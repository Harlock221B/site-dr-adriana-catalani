/**
 * Serviço Avançado do Bot Assistente IA da Dra. Adriana Catalani
 * 
 * Funcionalidades:
 * 1. Processamento de linguagem natural contextualizada da clínica.
 * 2. Suporte a Gemini 2.5 Flash / Gemini Flash Latest com contexto e histórico multi-turn.
 * 3. Processador Local Inteligente (NLP offline) com extração de intenções acionáveis:
 *    - Consulta de horários (hoje, amanhã, dias da semana, datas específicas)
 *    - Identificação de vagas/horários livres
 *    - Geração de lembretes automáticos para WhatsApp (véspera e dia)
 *    - Sugestão e estruturação de novos agendamentos com preenchimento automático
 *    - Consulta de status de confirmação e pacientes sem confirmação
 *    - Busca de histórico e perfil de pacientes
 */

import { getMessageTemplate, MESSAGE_TEMPLATES } from './appointmentService';
import { getPendingReminders } from './reminderAutomationService';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

export function toDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

/**
 * Retorna os horários livres para uma data específica
 */
export function getAvailableSlotsForDate(dateStr, appointments) {
  const dayAppointments = appointments
    .filter(a => a.date === dateStr && a.status !== 'cancelado')
    .map(a => a.startTime);

  const standardSlots = [
    '08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  return standardSlots.filter(slot => !dayAppointments.includes(slot));
}

/**
 * Converte referências relativas (hoje, amanhã, segunda, etc.) para YYYY-MM-DD
 */
function parseRelativeDate(text) {
  const lower = text.toLowerCase();
  const today = new Date();

  if (lower.includes('amanhã') || lower.includes('amanha')) {
    const d = new Date(today);
    d.setDate(today.getDate() + 1);
    return toDateString(d);
  }

  if (lower.includes('hoje')) {
    return toDateString(today);
  }

  if (lower.includes('depois de amanhã') || lower.includes('depois de amanha')) {
    const d = new Date(today);
    d.setDate(today.getDate() + 2);
    return toDateString(d);
  }

  // Dias da semana
  const weekdaysMap = {
    'domingo': 0,
    'segunda': 1,
    'terça': 2,
    'terca': 2,
    'quarta': 3,
    'quinta': 4,
    'sexta': 5,
    'sábado': 6,
    'sabado': 6
  };

  for (const [dayName, targetDayIndex] of Object.entries(weekdaysMap)) {
    if (lower.includes(dayName)) {
      const currentDayIndex = today.getDay();
      let diff = targetDayIndex - currentDayIndex;
      if (diff <= 0) diff += 7; // Próximo dia da semana
      const d = new Date(today);
      d.setDate(today.getDate() + diff);
      return toDateString(d);
    }
  }

  // Tenta capturar formato DD/MM ou DD/MM/YYYY
  const dateMatch = text.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
  if (dateMatch) {
    const day = parseInt(dateMatch[1], 10);
    const month = parseInt(dateMatch[2], 10) - 1;
    const year = dateMatch[3] ? parseInt(dateMatch[3], 10) : today.getFullYear();
    const d = new Date(year, month, day);
    return toDateString(d);
  }

  return null;
}

/**
 * Extrai horário do texto (ex: "às 14h", "14:30", "15 hrs")
 */
function parseTimeFromText(text) {
  const match = text.match(/(?:às|as|para as|as)?\s*(\d{1,2})(?:[:h](\d{2}))?\s*(?:h|hrs|horas)?/i);
  if (match) {
    const hour = String(match[1]).padStart(2, '0');
    const min = match[2] ? String(match[2]).padStart(2, '0') : '00';
    if (parseInt(hour, 10) >= 0 && parseInt(hour, 10) <= 23) {
      return `${hour}:${min}`;
    }
  }
  return null;
}

/**
 * Processador Local Inteligente (NLP de Alto Desempenho com suporte a Ações)
 */
export async function processLocalCommand(userText, { appointments, patients }) {
  const lower = userText.toLowerCase().trim();
  const today = new Date();
  const todayStr = toDateString(today);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = toDateString(tomorrow);

  // 1. INTENÇÃO: DISPARAR OU CONSULTAR LEMBRETES AUTOMÁTICOS
  if (
    lower.includes('lembrete') || 
    lower.includes('avisar') || 
    lower.includes('mensagem de confirmação') ||
    lower.includes('notificar') ||
    (lower.includes('disparar') && lower.includes('mensagem'))
  ) {
    const reminders = getPendingReminders(appointments);
    const targetTomorrow = lower.includes('amanhã') || lower.includes('amanha');
    const listToReport = targetTomorrow ? reminders.pendingTomorrow : (reminders.pendingTomorrow.concat(reminders.pendingToday));

    if (listToReport.length === 0) {
      return {
        reply: "🎉 Todos os lembretes já foram enviados ou não há consultas pendentes de aviso para as próximas 24h!",
        action: null,
      };
    }

    const items = listToReport.map(app => {
      const isTomorrow = app.date === tomorrowStr;
      const labelDate = isTomorrow ? 'Amanhã' : 'Hoje';
      const template = getMessageTemplate(MESSAGE_TEMPLATES.REMINDER, app);
      return {
        appointmentId: app.id,
        patientName: app.patientName,
        phone: app.phone,
        date: app.date,
        startTime: app.startTime,
        modality: app.modality,
        labelDate,
        messageText: template,
      };
    });

    return {
      reply: `Encontrei **${items.length} lembrete(s)** pendente(s) de envio. Você pode disparar agora diretamente pelo WhatsApp:`,
      action: {
        type: 'BATCH_REMINDERS',
        items,
      },
    };
  }

  // 2. INTENÇÃO: AGENDAR NOVA CONSULTA VIA CHAT
  if (
    lower.startsWith('agendar') || 
    lower.startsWith('marcar') || 
    lower.includes('agende para') || 
    lower.includes('marque uma consulta')
  ) {
    const targetDate = parseRelativeDate(lower) || tomorrowStr;
    const targetTime = parseTimeFromText(lower) || '14:00';
    const isOnline = lower.includes('online') || lower.includes('remoto') || lower.includes('vídeo');
    const modality = isOnline ? 'online' : 'presencial';

    // Tenta encontrar paciente existente mencionado no texto
    let matchedPatient = patients.find(p => lower.includes(p.name.toLowerCase()));
    
    // Se não encontrou pelo nome completo, tenta primeiro nome
    if (!matchedPatient) {
      matchedPatient = patients.find(p => {
        const firstName = p.name.split(' ')[0].toLowerCase();
        return firstName.length > 2 && lower.includes(firstName);
      });
    }

    const patientName = matchedPatient ? matchedPatient.name : 'Novo Paciente';
    const phone = matchedPatient ? matchedPatient.phone : '';

    return {
      reply: `Identifiquei o pedido de agendamento para **${patientName}** no dia **${formatDisplayDate(targetDate)}** às **${targetTime}** (${modality === 'online' ? 'Online' : 'Presencial'}).\n\nClique no botão abaixo para abrir o formulário já pré-preenchido e salvar na agenda:`,
      action: {
        type: 'SCHEDULE_SUGGESTION',
        data: {
          patientName,
          phone,
          patientId: matchedPatient ? matchedPatient.id : '',
          date: targetDate,
          startTime: targetTime,
          modality,
          presetPatient: matchedPatient || null,
        }
      }
    };
  }

  // 3. INTENÇÃO: CONSULTAR HORÁRIOS LIVRES / VAGAS
  if (
    lower.includes('livre') || 
    lower.includes('vago') || 
    lower.includes('vaga') || 
    lower.includes('disponivel') || 
    lower.includes('disponível') ||
    lower.includes('horários vagos')
  ) {
    const targetDateStr = parseRelativeDate(lower) || (lower.includes('amanhã') || lower.includes('amanha') ? tomorrowStr : todayStr);
    const dateLabel = targetDateStr === todayStr ? 'hoje' : targetDateStr === tomorrowStr ? 'amanhã' : formatDisplayDate(targetDateStr);
    const freeSlots = getAvailableSlotsForDate(targetDateStr, appointments);

    if (freeSlots.length === 0) {
      return {
        reply: `Não há horários vagos disponíveis para **${dateLabel}** no seu horário padrão de atendimento (08:00 às 19:00).`,
        action: null,
      };
    }

    return {
      reply: `Horários vagos disponíveis para **${dateLabel}** (${freeSlots.length} horários livres):\n\n` + 
             freeSlots.map(s => `⏰ **${s}**`).join('   |   '),
      action: {
        type: 'FREE_SLOTS',
        date: targetDateStr,
        slots: freeSlots,
      }
    };
  }

  // 4. INTENÇÃO: CONSULTAR ATENDIMENTOS DE HOJE
  if (lower.includes('hoje') || lower.includes('dia de hoje')) {
    const todayApps = appointments
      .filter(a => a.date === todayStr && a.status !== 'cancelado')
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    if (todayApps.length === 0) {
      return {
        reply: "Dra. Adriana, você **não tem nenhum atendimento agendado para hoje**. Sua agenda está 100% livre!",
        action: null,
      };
    }

    const list = todayApps.map(a => 
      `• **${a.startTime}** às **${a.endTime || a.startTime}**: **${a.patientName}** ` +
      `(${a.modality === 'online' ? '🌐 Online' : '🏢 Presencial'}) ` +
      `[Status: ${a.status === 'confirmado' ? '✅ Confirmado' : '⏳ Aguardando'}]`
    ).join('\n');

    return {
      reply: `Você tem **${todayApps.length} consulta(s)** marcada(s) para hoje:\n\n${list}`,
      action: {
        type: 'VIEW_DAY',
        date: todayStr,
      }
    };
  }

  // 5. INTENÇÃO: CONSULTAR ATENDIMENTOS DE AMANHÃ
  if (lower.includes('amanhã') || lower.includes('amanha')) {
    const tomApps = appointments
      .filter(a => a.date === tomorrowStr && a.status !== 'cancelado')
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    if (tomApps.length === 0) {
      return {
        reply: "Para amanhã você não possui nenhum atendimento marcado até o momento.",
        action: null,
      };
    }

    const list = tomApps.map(a => 
      `• **${a.startTime}** às **${a.endTime || a.startTime}**: **${a.patientName}** ` +
      `(${a.modality === 'online' ? '🌐 Online' : '🏢 Presencial'}) ` +
      `[${a.status === 'confirmado' ? '✅ Confirmado' : '⏳ Aguardando'}]`
    ).join('\n');

    return {
      reply: `Para amanhã você tem **${tomApps.length} consulta(s)** agendadas:\n\n${list}`,
      action: {
        type: 'VIEW_DAY',
        date: tomorrowStr,
      }
    };
  }

  // 6. INTENÇÃO: QUEM AINDA NÃO CONFIRMOU
  if (lower.includes('confirmar') || lower.includes('pendente') || lower.includes('falta confirmar')) {
    const unconfirmed = appointments
      .filter(a => a.status === 'agendado' && a.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date));

    if (unconfirmed.length === 0) {
      return {
        reply: "✨ Excelente! Todas as próximas consultas já estão confirmadas. Não há pendências na agenda.",
        action: null,
      };
    }

    const list = unconfirmed.map(a => 
      `• **${a.patientName}** — ${formatDisplayDate(a.date)} às ${a.startTime} (${a.phone || 'Sem telefone'})`
    ).join('\n');

    return {
      reply: `Você tem **${unconfirmed.length} consulta(s)** aguardando confirmação:\n\n${list}`,
      action: null,
    };
  }

  // 7. INTENÇÃO: RESUMO DA SEMANA
  if (lower.includes('semana') || lower.includes('resumo')) {
    const futureApps = appointments.filter(a => a.date >= todayStr && a.status !== 'cancelado');
    const totalSemana = futureApps.slice(0, 7);

    return {
      reply: `📊 **Resumo da sua Agenda:**\n` +
             `• Total de pacientes cadastrados: **${patients.length}**\n` +
             `• Consultas marcadas para hoje: **${appointments.filter(a => a.date === todayStr && a.status !== 'cancelado').length}**\n` +
             `• Próximos atendimentos nos próximos dias: **${totalSemana.length} sessões**\n\n` +
             `Deseja verificar os horários de algum dia específico ou disparar os lembretes?`,
      action: null,
    };
  }

  // 8. INTENÇÃO: CONSULTA DE PACIENTE ESPECÍFICO
  const matchedP = patients.find(p => lower.includes(p.name.toLowerCase()));
  if (matchedP) {
    const pApps = appointments.filter(a => a.patientId === matchedP.id || a.patientName.toLowerCase() === matchedP.name.toLowerCase());
    const nextApp = pApps.find(a => a.date >= todayStr && a.status !== 'cancelado');

    return {
      reply: `📋 **Ficha Rápida do Paciente:**\n` +
             `• **Nome:** ${matchedP.name}\n` +
             `• **WhatsApp:** ${matchedP.phone || 'Não informado'}\n` +
             `• **Modalidade habitual:** ${matchedP.defaultModality || 'Presencial'}\n` +
             `• **Valor padrão:** ${matchedP.defaultPrice ? `R$ ${matchedP.defaultPrice}` : 'Não definido'}\n` +
             `• **Próxima consulta:** ${nextApp ? `${formatDisplayDate(nextApp.date)} às ${nextApp.startTime}` : 'Nenhuma consulta futura agendada'}\n` +
             (matchedP.notes ? `• **Observações:** ${matchedP.notes}` : ''),
      action: {
        type: 'PATIENT_CARD',
        patient: matchedP,
      }
    };
  }

  // 9. INTENÇÃO: CONSULTAR PAGAMENTOS PENDENTES
  if (lower.includes('pagamento') || lower.includes('pagou') || lower.includes('pendente de pagamento') || lower.includes('devedor') || lower.includes('a receber')) {
    const pendentes = appointments.filter(a => a.paymentStatus === 'pendente' && a.status !== 'cancelado');
    if (pendentes.length === 0) {
      return {
        reply: "🎉 Nenhum pagamento pendente encontrado! Todas as sessões realizadas ou agendadas estão com status regularizado ou convênio.",
        action: null,
      };
    }

    const totalPendente = pendentes.reduce((acc, a) => acc + (parseFloat(String(a.price || '0').replace(',', '.')) || 0), 0);
    const list = pendentes.slice(0, 8).map(a => 
      `• **${a.patientName}**: ${formatDisplayDate(a.date)} às ${a.startTime} — ${a.price ? `R$ ${a.price}` : 'Valor não informado'}`
    ).join('\n');

    return {
      reply: `💰 **Você tem ${pendentes.length} atendimento(s) com pagamento pendente** (Total estimado: **R$ ${totalPendente.toFixed(2).replace('.', ',')}**):\n\n${list}\n\n` +
             (pendentes.length > 8 ? `_... e mais ${pendentes.length - 8} sessões._\n\n` : '') +
             `Você pode marcar como pago com 1 toque nos cartões da agenda.`,
      action: null,
    };
  }

  // 10. INTENÇÃO: CONSULTAR CONVÊNIOS E PLANOS DE SAÚDE
  if (lower.includes('convenio') || lower.includes('convênio') || lower.includes('plano de saúde') || lower.includes('plano')) {
    const convenios = appointments.filter(a => a.paymentStatus === 'convenio' || a.healthPlan);
    if (convenios.length === 0) {
      return {
        reply: "Você não possui nenhuma consulta cadastrada com plano de saúde ou convênio no momento.",
        action: null,
      };
    }

    const list = convenios.slice(0, 8).map(a => 
      `• **${a.patientName}** — ${a.healthPlan || 'Convênio'} (${formatDisplayDate(a.date)} às ${a.startTime})`
    ).join('\n');

    return {
      reply: `🩺 **Você possui ${convenios.length} sessão(ões) por Convênio / Plano de Saúde:**\n\n${list}`,
      action: null,
    };
  }

  // 11. INTENÇÃO: RESUMO FINANCEIRO
  if (lower.includes('faturei') || lower.includes('recebido') || lower.includes('quanto ganhei') || lower.includes('financeiro') || lower.includes('faturamento')) {
    const currentMonthPrefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const thisMonthApps = appointments.filter(a => a.date?.startsWith(currentMonthPrefix) && a.status !== 'cancelado');
    
    let totalPago = 0;
    let totalPendente = 0;
    let totalConvenio = 0;

    thisMonthApps.forEach(a => {
      const val = parseFloat(String(a.price || '0').replace(',', '.')) || 0;
      if (a.paymentStatus === 'pago') totalPago += val;
      else if (a.paymentStatus === 'convenio' || a.healthPlan) totalConvenio += 1;
      else totalPendente += val;
    });

    return {
      reply: `💵 **Balanço Financeiro do Mês (${today.getMonth() + 1}/${today.getFullYear()}):**\n\n` +
             `• Total já recebido (Pago): **R$ ${totalPago.toFixed(2).replace('.', ',')}**\n` +
             `• A receber (Pendente): **R$ ${totalPendente.toFixed(2).replace('.', ',')}**\n` +
             `• Atendimentos via Convênio/Plano: **${totalConvenio} sessões**\n` +
             `• Total de sessões no mês: **${thisMonthApps.length} atendimentos**`,
      action: null,
    };
  }

  // Resposta padrão inteligente e receptiva
  return {
    reply: "Olá, Dra. Adriana! Sou seu assistente de consultório. Você pode me pedir por voz ou texto:\n\n" +
           "• 📢 *'Avisar pacientes de amanhã pelo WhatsApp'*\n" +
           "• 📅 *'Agendar consulta para Maria amanhã às 15h presencial'*\n" +
           "• 🕒 *'Quais são minhas consultas de hoje?'*\n" +
           "• 🔍 *'Tenho algum horário livre amanhã?'*\n" +
           "• 💰 *'Quem ainda não pagou a sessão?'*\n" +
           "• 🩺 *'Quais sessões são por convênio?'*\n" +
           "• 💵 *'Qual é o meu faturamento deste mês?'*",
    action: null,
  };
}

/**
 * Envia comando para a Gemini API com contexto do consultório ou aciona fallback local
 */
export async function askAIAssistant(promptText, { appointments, patients, history = [] }) {
  if (!GEMINI_API_KEY) {
    // Modo Gratuito Offline / Sem chave: executa o NLP local refinado
    return processLocalCommand(promptText, { appointments, patients });
  }

  const todayStr = toDateString(new Date());

  const systemContext = `
Você é o Assistente Virtual Oficial e exclusivo da Dra. Adriana Catalani (Psicóloga e Psicanalista).
Seu tom é acolhedor, altamente profissional, empático, conciso e objetivo.
Data de hoje: ${todayStr}.

Base de Dados Atual:
- Pacientes Cadastrados (${patients.length}):
${JSON.stringify(patients.map(p => ({ id: p.id, nome: p.name, telefone: p.phone, modalidade: p.defaultModality, preco: p.defaultPrice })))}

- Agendamentos Atuais (${appointments.length}):
${JSON.stringify(appointments.map(a => ({ id: a.id, paciente: a.patientName, data: a.date, inicio: a.startTime, fim: a.endTime, modalidade: a.modality, status: a.status })))}

Instruções:
1. Responda em Português do Brasil com formatação elegante (bullet points, negrito, emojis discretos).
2. Se o usuário quiser agendar, cancelar, verificar vagas ou avisar pacientes, forneça a resposta e, quando aplicável, cite claramente os dados para confirmação.
`;

  try {
    const formattedContents = [
      {
        role: 'user',
        parts: [{ text: `${systemContext}\n\nPergunta da Dra. Adriana:\n"${promptText}"` }]
      }
    ];

    const res = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: formattedContents })
    });

    if (!res.ok) {
      console.warn("[Gemini API] Falha na requisição, utilizando NLP local:", res.status);
      return processLocalCommand(promptText, { appointments, patients });
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return processLocalCommand(promptText, { appointments, patients });
    }

    // Verifica se também há alguma ação identificável pelo NLP local para enriquecer a resposta
    const localAnalysis = await processLocalCommand(promptText, { appointments, patients });

    return {
      reply: candidateText,
      action: localAnalysis.action, // Anexa cartão interativo se houver
    };
  } catch (err) {
    console.warn("[Gemini API] Erro ao chamar serviço, acionando fallback local:", err);
    return processLocalCommand(promptText, { appointments, patients });
  }
}
