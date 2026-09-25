/**
 * =========================================================================================
 * ROBÔ DE AUTOMAÇÃO DE LEMBRETES 100% GRATUITO - DRA. ADRIANA CATALANI
 * Plataforma: Google Apps Script (Executa na nuvem da Google, sem servidor, custo ZERO)
 * =========================================================================================
 * 
 * COMO FUNCIONA:
 * 1. Todos os agendamentos feitos no site são salvos automaticamente no Google Agenda da Dra. Adriana.
 * 2. Este script roda todos os dias às 08h00 da manhã de forma 100% automática na nuvem do Google.
 * 3. Ele lê os eventos de amanhã (véspera) e de hoje no Google Agenda da psicóloga.
 * 4. Extrai o nome do paciente, horário e o WhatsApp salvo na descrição do evento.
 * 5. Pode operar enviando o resumo diretamente no WhatsApp da Dra. Adriana:
 *    - 'WHATSAPP_ADRIANA' (via CallMeBot): 100% Gratuito! Envia o resumo matinal no WhatsApp pessoal
 *      da Dra. Adriana com um link clicável para cada paciente. Ela só clica no link e o WhatsApp
 *      dela já abre com a mensagem pronta de confirmação!
 *    - 'EVOLUTION_API': Disparo 100% autônomo no WhatsApp dos próprios pacientes via API open-source.
 *    - 'LOG_ONLY': Apenas registra os dados no log de execução para testes.
 * 
 * INSTRUÇÕES DE INSTALAÇÃO (Leva apenas 3 minutos):
 * 1. Acesse: https://script.google.com/home logado com o Gmail da Dra. Adriana.
 * 2. Clique em "+ Novo projeto".
 * 3. Dê o nome de "Robô Agenda Dra. Adriana".
 * 4. Apague o código padrão e cole todo o conteúdo deste arquivo.
 * 5. Configure suas preferências no bloco CONFIG abaixo.
 * 6. Clique em Salvar (ícone de disquete).
 * 7. Clique no menu lateral esquerdo em "Acionadores" (ícone de relógio) > "+ Adicionar acionador":
 *    - Função: "executarRotinaLembretesDiarios"
 *    - Origem do evento: "Baseado no tempo"
 *    - Tipo: "Temporizador por dia"
 *    - Hora do dia: "Entre 8h e 9h da manhã"
 *    - Salvar e autorizar as permissões na sua conta Google.
 * =========================================================================================
 */

const CONFIG = {
  // Nome que aparecerá nas mensagens
  NOME_TERAPEUTA: "Dra. Adriana Catalani",
  ESPECIALIDADE: "Psicóloga e Psicanalista",

  // MODO DE ENVIO:
  // 'WHATSAPP_ADRIANA' -> Envia o resumo matinal para o WhatsApp da própria Adriana com links de 1 clique
  // 'EVOLUTION_API'     -> Envia as mensagens automaticamente no WhatsApp dos pacientes
  // 'LOG_ONLY'          -> Apenas exibe no console para testes
  MODO_ENVIO: 'WHATSAPP_ADRIANA', 

  // =====================================================================================
  // OPÇÃO A: ENVIAR RESUMO NO WHATSAPP DA ADRIANA (CallMeBot - 100% Gratuito)
  // Como ativar (Leva 30 segundos):
  // 1. No WhatsApp da Adriana, adicione o contato do CallMeBot: +34 644 44 20 89 (ou +34 644 10 55 84)
  // 2. Envie a mensagem: "I allow callmebot to send me messages"
  // 3. Você receberá uma mensagem com a sua APIKey gratuita.
  // 4. Preencha seu número com DDI e DDD (ex: 5519999999999) e a apikey abaixo:
  // =====================================================================================
  WHATSAPP_ADRIANA_NUMERO: "5519999999999", // Coloque o número do WhatsApp da Adriana com 55 e DDD
  CALLMEBOT_API_KEY: "",                   // Cole a APIKey recebida pelo WhatsApp

  // =====================================================================================
  // OPÇÃO B: EVOLUTION API (Caso queira envio 100% autônomo direto no WhatsApp do paciente)
  // =====================================================================================
  EVOLUTION_API_URL: "",  // Ex: https://sua-evolution-api.onrender.com
  EVOLUTION_API_KEY: "",  // Sua API Key configurada na Evolution API
  EVOLUTION_INSTANCE: "", // Nome da instância conectada (ex: adriana)
};

/**
 * Função principal executada diariamente pelo acionador de horário do Google
 */
function executarRotinaLembretesDiarios() {
  const agora = new Date();
  
  // Calcula a data de amanhã
  const amanha = new Date(agora);
  amanha.setDate(agora.getDate() + 1);

  console.log("Iniciando rotina de lembretes para:", amanha.toLocaleDateString("pt-BR"));

  const calendar = CalendarApp.getDefaultCalendar();
  if (!calendar) {
    console.error("Calendário principal não encontrado.");
    return;
  }

  // Define início e fim do dia de amanhã (00:00 às 23:59:59)
  const inicioAmanha = new Date(amanha.getFullYear(), amanha.getMonth(), amanha.getDate(), 0, 0, 0);
  const fimAmanha = new Date(amanha.getFullYear(), amanha.getMonth(), amanha.getDate(), 23, 59, 59);

  const eventos = calendar.getEvents(inicioAmanha, fimAmanha);
  console.log("Total de eventos encontrados para amanhã:", eventos.length);

  const pacientesAmanha = [];

  eventos.forEach(evento => {
    const titulo = evento.getTitle(); // Ex: "Sessão: Mariana Silveira (Presencial)"
    const descricao = evento.getDescription() || "";
    const inicio = evento.getStartTime();

    // Filtra apenas eventos criados pelo sistema de agenda da Dra. Adriana
    if (titulo.startsWith("Sessão:")) {
      const horaStr = Utilities.formatDate(inicio, "America/Sao_Paulo", "HH:mm");
      const dataStr = Utilities.formatDate(inicio, "America/Sao_Paulo", "dd/MM/yyyy");

      // Extrai o WhatsApp da descrição
      const phoneMatch = descricao.match(/WhatsApp:\s*([^\n\r]+)/i);
      const telefone = phoneMatch ? phoneMatch[1].trim() : "";

      // Extrai o nome do paciente do título
      const nomeMatch = titulo.match(/Sessão:\s*([^(]+)/i);
      const nomePaciente = nomeMatch ? nomeMatch[1].trim() : "Paciente";

      const isOnline = titulo.toLowerCase().includes("online");
      const modalidade = isOnline ? "Online (Videochamada)" : "Presencial no consultório";

      // Mensagem personalizada para o paciente
      const mensagemPaciente = 
        `Olá, ${nomePaciente}! Tudo bem?\n\n` +
        `Passando para confirmar nossa sessão de psicoterapia marcada para *amanhã, ${dataStr}, às ${horaStr}* (${modalidade}).\n\n` +
        `Poderia por favor confirmar sua presença respondendo esta mensagem?\n\n` +
        `Atenciosamente,\n*${CONFIG.NOME_TERAPEUTA}*\n${CONFIG.ESPECIALIDADE}`;

      pacientesAmanha.push({
        nome: nomePaciente,
        hora: horaStr,
        data: dataStr,
        telefone: telefone,
        modalidade: modalidade,
        mensagem: mensagemPaciente,
      });
    }
  });

  if (pacientesAmanha.length === 0) {
    console.log("Nenhum paciente agendado para amanhã.");
    if (CONFIG.MODO_ENVIO === 'WHATSAPP_ADRIANA' && CONFIG.CALLMEBOT_API_KEY) {
      enviarResumoWhatsAppAdriana("☀️ *Bom dia, Dra. Adriana!*\n\nVocê não possui atendimentos agendados para amanhã.");
    }
    return;
  }

  console.log(`Processando ${pacientesAmanha.length} paciente(s)...`);

  // DISPARO CONFORME O MODO CONFIGURADO:
  if (CONFIG.MODO_ENVIO === 'WHATSAPP_ADRIANA') {
    const textoResumo = formatarResumoParaWhatsApp(pacientesAmanha);
    enviarResumoWhatsAppAdriana(textoResumo);
  } else if (CONFIG.MODO_ENVIO === 'EVOLUTION_API') {
    dispararViaEvolutionAPI(pacientesAmanha);
  } else {
    // MODO LOG_ONLY
    console.log("=== RELATÓRIO DE PACIENTES DE AMANHÃ ===");
    pacientesAmanha.forEach((p, idx) => {
      console.log(`[${idx + 1}] ${p.hora} - ${p.nome} (${p.telefone}):\n${p.mensagem}\n`);
    });
  }
}

/**
 * Monta o texto do resumo matinal com links clicáveis de WhatsApp
 */
function formatarResumoParaWhatsApp(pacientes) {
  let texto = `☀️ *Bom dia, Dra. Adriana!*\n\n`;
  texto += `Você tem *${pacientes.length} atendimento(s)* agendado(s) para amanhã:\n\n`;

  pacientes.forEach((p, idx) => {
    texto += `*${idx + 1}. ${p.hora}* - *${p.nome}* (${p.modalidade})\n`;

    if (p.telefone) {
      const numLimpo = p.telefone.replace(/\D/g, "");
      const numFinal = numLimpo.startsWith("55") ? numLimpo : `55${numLimpo}`;
      const linkWa = `https://wa.me/${numFinal}?text=${encodeURIComponent(p.mensagem)}`;
      texto += `👉 *Enviar confirmação:* ${linkWa}\n\n`;
    } else {
      texto += `⚠️ _Sem telefone cadastrado_\n\n`;
    }
  });

  texto += `Basta tocar no link de cada paciente para abrir a mensagem prontinha no seu WhatsApp! Tenha um ótimo dia!`;
  return texto;
}

/**
 * Envia mensagem direta para o WhatsApp pessoal da Adriana usando o CallMeBot (100% Gratuito)
 */
function enviarResumoWhatsAppAdriana(mensagem) {
  if (!CONFIG.CALLMEBOT_API_KEY || !CONFIG.WHATSAPP_ADRIANA_NUMERO) {
    console.warn("CallMeBot não configurado. Preencha WHATSAPP_ADRIANA_NUMERO e CALLMEBOT_API_KEY no CONFIG.");
    return;
  }

  const numero = CONFIG.WHATSAPP_ADRIANA_NUMERO.replace(/\D/g, "");
  const url = `https://api.callmebot.com/whatsapp.php?phone=${numero}&text=${encodeURIComponent(mensagem)}&apikey=${CONFIG.CALLMEBOT_API_KEY}`;

  try {
    const response = UrlFetchApp.fetch(url, {
      method: "get",
      muteHttpExceptions: true
    });
    console.log("Resumo enviado para o WhatsApp da Dra. Adriana. Status:", response.getResponseCode());
  } catch (e) {
    console.error("Erro ao enviar resumo para o WhatsApp:", e.message);
  }
}

/**
 * Disparo autônomo via Evolution API (opcional)
 */
function dispararViaEvolutionAPI(pacientes) {
  if (!CONFIG.EVOLUTION_API_URL || !CONFIG.EVOLUTION_API_KEY) {
    console.warn("Evolution API não configurada.");
    return;
  }

  const endpoint = `${CONFIG.EVOLUTION_API_URL}/message/sendText/${CONFIG.EVOLUTION_INSTANCE || 'adriana'}`;

  pacientes.forEach(p => {
    if (!p.telefone) return;

    const numeroLimpo = p.telefone.replace(/\D/g, "");
    const numeroFinal = numeroLimpo.startsWith("55") ? numeroLimpo : `55${numeroLimpo}`;

    const payload = {
      number: numeroFinal,
      text: p.mensagem,
      options: {
        delay: 1200,
        presence: "composing",
      }
    };

    try {
      UrlFetchApp.fetch(endpoint, {
        method: "post",
        contentType: "application/json",
        headers: {
          "apikey": CONFIG.EVOLUTION_API_KEY
        },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });
      console.log(`Mensagem enviada com sucesso para ${p.nome} (${numeroFinal})`);
    } catch (e) {
      console.error(`Erro ao disparar para ${p.nome}:`, e.message);
    }
  });
}
