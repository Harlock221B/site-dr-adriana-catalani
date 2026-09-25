/**
 * Serviço de Integração Automática com a Google Calendar API (Google Agenda)
 * Sincroniza em tempo real as consultas no Google Agenda da Dra. Adriana.
 */

const GCAL_API_BASE = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

/**
 * Converte data (YYYY-MM-DD) e horário (HH:MM) para formato ISO RFC3339 brasileiro (-03:00)
 */
function toRFC3339(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  return `${dateStr}T${timeStr}:00-03:00`;
}

/**
 * Cria um evento no Google Agenda da psicóloga
 */
export async function createGoogleCalendarEvent(appointment, accessToken) {
  if (!accessToken) {
    console.warn("[Google Calendar] Token de acesso não disponível para sincronização.");
    return null;
  }

  const startDateTime = toRFC3339(appointment.date, appointment.startTime);
  const endDateTime = toRFC3339(appointment.date, appointment.endTime || appointment.startTime);

  if (!startDateTime || !endDateTime) return null;

  const isOnline = appointment.modality === 'online';
  const location = isOnline 
    ? (appointment.meetLink || 'Atendimento Online por Videochamada')
    : 'Consultório Dra. Adriana Catalani - Atendimento Presencial';

  const summary = `Sessão: ${appointment.patientName} (${isOnline ? 'Online' : 'Presencial'})`;
  const description = [
    `Paciente: ${appointment.patientName}`,
    appointment.phone ? `WhatsApp: ${appointment.phone}` : null,
    appointment.sessionType ? `Tipo: ${appointment.sessionType}` : null,
    appointment.price ? `Valor: R$ ${appointment.price}` : null,
    appointment.notes ? `Observações: ${appointment.notes}` : null,
    isOnline && appointment.meetLink ? `Link da Videochamada: ${appointment.meetLink}` : null,
  ].filter(Boolean).join('\n');

  const eventPayload = {
    summary,
    description,
    location,
    start: {
      dateTime: startDateTime,
      timeZone: 'America/Sao_Paulo',
    },
    end: {
      dateTime: endDateTime,
      timeZone: 'America/Sao_Paulo',
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 30 },
        { method: 'popup', minutes: 120 },
      ],
    },
  };

  try {
    const res = await fetch(GCAL_API_BASE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventPayload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error("[Google Calendar] Erro ao criar evento:", errData);
      return null;
    }

    const createdEvent = await res.json();
    return {
      eventId: createdEvent.id,
      htmlLink: createdEvent.htmlLink,
    };
  } catch (error) {
    console.error("[Google Calendar] Falha na requisição de criação:", error);
    return null;
  }
}

/**
 * Atualiza um evento existente no Google Agenda (inclusive reagendamento / Drag and Drop)
 */
export async function updateGoogleCalendarEvent(eventId, appointment, accessToken) {
  if (!accessToken || !eventId) return null;

  const startDateTime = toRFC3339(appointment.date, appointment.startTime);
  const endDateTime = toRFC3339(appointment.date, appointment.endTime || appointment.startTime);

  if (!startDateTime || !endDateTime) return null;

  const isOnline = appointment.modality === 'online';
  const location = isOnline 
    ? (appointment.meetLink || 'Atendimento Online por Videochamada')
    : 'Consultório Dra. Adriana Catalani - Atendimento Presencial';

  const summary = `Sessão: ${appointment.patientName} (${isOnline ? 'Online' : 'Presencial'})`;
  const description = [
    `Paciente: ${appointment.patientName}`,
    appointment.phone ? `WhatsApp: ${appointment.phone}` : null,
    appointment.sessionType ? `Tipo: ${appointment.sessionType}` : null,
    appointment.price ? `Valor: R$ ${appointment.price}` : null,
    appointment.notes ? `Observações: ${appointment.notes}` : null,
    isOnline && appointment.meetLink ? `Link da Videochamada: ${appointment.meetLink}` : null,
  ].filter(Boolean).join('\n');

  const eventPayload = {
    summary,
    description,
    location,
    start: {
      dateTime: startDateTime,
      timeZone: 'America/Sao_Paulo',
    },
    end: {
      dateTime: endDateTime,
      timeZone: 'America/Sao_Paulo',
    },
  };

  try {
    const res = await fetch(`${GCAL_API_BASE}/${eventId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventPayload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.warn("[Google Calendar] Erro ao atualizar evento:", errData);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("[Google Calendar] Falha na atualização do evento:", error);
    return null;
  }
}

/**
 * Exclui um evento do Google Agenda
 */
export async function deleteGoogleCalendarEvent(eventId, accessToken) {
  if (!accessToken || !eventId) return;

  try {
    await fetch(`${GCAL_API_BASE}/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
  } catch (error) {
    console.error("[Google Calendar] Falha ao excluir evento do calendário:", error);
  }
}
