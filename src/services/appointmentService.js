import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

const COLLECTION_NAME = 'appointments';

/**
 * Escuta em tempo real a coleção de agendamentos no Firestore
 */
export function subscribeToAppointments(callback, onError) {
  if (!isFirebaseConfigured || !db) {
    callback([]);
    return () => {};
  }

  const appointmentsRef = collection(db, COLLECTION_NAME);

  const unsubscribe = onSnapshot(
    appointmentsRef,
    (snapshot) => {
      const appointments = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      // Ordena no cliente por data e horário (evita exigência de índice composto no Firebase)
      appointments.sort((a, b) => {
        const dateComp = (a.date || '').localeCompare(b.date || '');
        if (dateComp !== 0) return dateComp;
        return (a.startTime || '').localeCompare(b.startTime || '');
      });

      callback(appointments);
    },
    (err) => {
      console.error("Erro ao carregar agendamentos:", err);
      if (onError) onError(err);
    }
  );

  return unsubscribe;
}

/**
 * Cria um único agendamento
 */
export async function createAppointment(data) {
  if (!db) throw new Error("Banco de dados não conectado.");
  
  const appointmentsRef = collection(db, COLLECTION_NAME);
  const docRef = await addDoc(appointmentsRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Cria sessões recorrentes (ex: toda semana por 4, 8 ou 12 semanas)
 */
export async function createRecurringAppointments(baseData, { frequency = 'weekly', occurrences = 4 }) {
  if (!db) throw new Error("Banco de dados não conectado.");
  
  const batch = writeBatch(db);
  const recurrenceId = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const appointmentsRef = collection(db, COLLECTION_NAME);

  const [startYear, startMonth, startDay] = baseData.date.split('-').map(Number);
  const intervalDays = frequency === 'biweekly' ? 14 : 7;

  const createdIds = [];

  for (let i = 0; i < occurrences; i++) {
    const sessionDate = new Date(startYear, startMonth - 1, startDay + (i * intervalDays));
    const y = sessionDate.getFullYear();
    const m = String(sessionDate.getMonth() + 1).padStart(2, '0');
    const d = String(sessionDate.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    const newDocRef = doc(appointmentsRef);
    createdIds.push(newDocRef.id);

    batch.set(newDocRef, {
      ...baseData,
      date: dateStr,
      isRecurring: true,
      recurrenceId,
      sessionNumber: i + 1,
      totalSessions: occurrences,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();
  return createdIds;
}

/**
 * Atualiza um agendamento existente
 */
export async function updateAppointment(id, data) {
  if (!db) throw new Error("Banco de dados não conectado.");
  
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Exclui um agendamento
 */
export async function deleteAppointment(id) {
  if (!db) throw new Error("Banco de dados não conectado.");
  
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

/**
 * Higieniza o número de telefone para o padrão WhatsApp internacional (55...)
 */
export function cleanPhoneNumber(phone) {
  if (!phone) return '';
  let clean = phone.replace(/\D/g, '');
  if (clean.length === 10 || clean.length === 11) {
    clean = `55${clean}`;
  }
  return clean;
}

/**
 * Templates pré-formatados de mensagens para os pacientes
 */
export const MESSAGE_TEMPLATES = {
  CONFIRMATION: 'confirmacao',
  REMINDER: 'lembrete',
  ONLINE_LINK: 'online_link',
};

export function getMessageTemplate(type, appointment) {
  if (!appointment) return '';
  const [year, month, day] = (appointment.date || '').split('-');
  const formattedDate = day && month ? `${day}/${month}/${year}` : appointment.date;
  const modalidadeText = appointment.modality === 'online' 
    ? 'Online (por chamada de vídeo)' 
    : 'Presencial no consultório';

  const meetLinkPart = appointment.meetLink 
    ? `\n🔗 Link de Acesso: ${appointment.meetLink}`
    : '';

  switch (type) {
    case MESSAGE_TEMPLATES.CONFIRMATION:
      return `Olá, ${appointment.patientName}! 👋\n\nSua sessão de terapia com a Dra. Adriana Catalani foi agendada com sucesso!\n\n📅 Data: *${formattedDate}*\n⏰ Horário: *${appointment.startTime} às ${appointment.endTime || 'fim'}*\n📍 Modalidade: *${modalidadeText}*${meetLinkPart}\n\nCaso precise reagendar ou tenha alguma dúvida, estou à disposição!`;

    case MESSAGE_TEMPLATES.REMINDER:
      return `Olá, ${appointment.patientName}! 👋\n\nPassando para confirmar nossa sessão de terapia agendada para:\n\n📅 *${formattedDate}*\n⏰ *${appointment.startTime}*\n📍 *${modalidadeText}*${meetLinkPart}\n\nPor gentileza, confirme sua presença respondendo a esta mensagem. Abraço!`;

    case MESSAGE_TEMPLATES.ONLINE_LINK:
      return `Olá, ${appointment.patientName}! 👋\n\nSegue o link para a nossa sessão online marcada para hoje às *${appointment.startTime}*:\n\n${appointment.meetLink ? `🔗 ${appointment.meetLink}\n\n` : ''}Recomendo entrar alguns minutos antes em um ambiente privativo e confortável. Até já!`;

    default:
      return '';
  }
}

/**
 * Gera URL do WhatsApp com mensagem personalizada
 */
export function getWhatsAppCustomLink(phone, message) {
  const cleanPhone = cleanPhoneNumber(phone);
  if (!cleanPhone) return null;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Gera o link padrão de confirmação (compatibilidade)
 */
export function getWhatsAppReminderLink(appointment) {
  if (!appointment?.phone) return null;
  const msg = getMessageTemplate(MESSAGE_TEMPLATES.REMINDER, appointment);
  return getWhatsAppCustomLink(appointment.phone, msg);
}
