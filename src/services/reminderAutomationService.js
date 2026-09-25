/**
 * Serviço de Automação de Lembretes & Confirmações (Véspera e Dia da Consulta)
 * Prepara o terreno para disparos 100% automáticos na nuvem e fornece
 * detecção em tempo real de mensagens pendentes para o consultório.
 */

import { updateAppointment, getMessageTemplate, MESSAGE_TEMPLATES } from './appointmentService';

// Configurações do Gateway de WhatsApp (opcionais, lidas do .env.local)
const WHATSAPP_API_URL = import.meta.env.VITE_WHATSAPP_API_URL;
const WHATSAPP_API_KEY = import.meta.env.VITE_WHATSAPP_API_KEY;

function toDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Identifica agendamentos que necessitam de lembrete de véspera (amanhã) ou do dia (hoje)
 */
export function getPendingReminders(appointments) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const todayStr = toDateString(today);
  const tomorrowStr = toDateString(tomorrow);

  const pendingTomorrow = appointments.filter(app => 
    app.date === tomorrowStr &&
    app.phone &&
    app.status !== 'cancelado' &&
    !app.reminderSent_1day
  );

  const pendingToday = appointments.filter(app => 
    app.date === todayStr &&
    app.phone &&
    app.status !== 'cancelado' &&
    !app.reminderSent_sameday
  );

  return {
    pendingTomorrow,
    pendingToday,
    totalPending: pendingTomorrow.length + pendingToday.length,
  };
}

/**
 * Dispara o lembrete via Gateway de WhatsApp (se configurado) ou marca como enviado
 */
export async function sendAutomatedReminder(appointment, type = '1day') {
  if (!appointment?.phone) return false;

  const templateType = appointment.modality === 'online' && type === 'sameday'
    ? MESSAGE_TEMPLATES.ONLINE_LINK
    : MESSAGE_TEMPLATES.REMINDER;

  const messageText = getMessageTemplate(templateType, appointment);

  let sentSuccessfully = false;

  // Se houver um Gateway configurado (ex: Evolution API, Z-API, Meta Cloud API)
  if (WHATSAPP_API_URL && WHATSAPP_API_KEY) {
    try {
      const res = await fetch(`${WHATSAPP_API_URL}/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': WHATSAPP_API_KEY,
          'Authorization': `Bearer ${WHATSAPP_API_KEY}`,
        },
        body: JSON.stringify({
          number: appointment.phone.replace(/\D/g, ''),
          text: messageText,
        }),
      });
      sentSuccessfully = res.ok;
    } catch (err) {
      console.warn("[Automação WhatsApp] Falha ao conectar ao gateway:", err);
    }
  }

  // Atualizar sinalizadores no Firestore para evitar envios duplicados
  const updatePayload = {
    lastReminderSentAt: new Date().toISOString(),
  };

  if (type === '1day') {
    updatePayload.reminderSent_1day = true;
  } else {
    updatePayload.reminderSent_sameday = true;
  }

  await updateAppointment(appointment.id, updatePayload);
  return { sentSuccessfully, messageText };
}
