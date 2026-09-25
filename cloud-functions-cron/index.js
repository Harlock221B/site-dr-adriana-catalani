/**
 * Firebase Cloud Function: Disparo Automático Diário de Lembretes (Cloud Scheduler)
 * 
 * Executa todos os dias às 08:30 da manhã (horário de Brasília) via cron job na nuvem.
 * Busca as consultas de amanhã e de hoje no Firestore e dispara os lembretes no WhatsApp.
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

admin.initializeApp();
const db = admin.firestore();

// Cron roda todos os dias às 08:30 (Horário de São Paulo)
exports.dailyReminderCron = functions.pubsub
  .schedule('30 8 * * *')
  .timeZone('America/Sao_Paulo')
  .onRun(async (context) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const y = tomorrow.getFullYear();
    const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const d = String(tomorrow.getDate()).padStart(2, '0');
    const tomorrowStr = `${y}-${m}-${d}`;

    console.log(`[Lembrete Cron] Verificando consultas para a véspera: ${tomorrowStr}`);

    const snapshot = await db.collection('appointments')
      .where('date', '==', tomorrowStr)
      .where('status', 'in', ['agendado', 'confirmado'])
      .get();

    const batch = db.batch();
    let sentCount = 0;

    for (const doc of snapshot.docs) {
      const app = doc.data();
      if (app.reminderSent_1day || !app.phone) continue;

      const cleanPhone = app.phone.replace(/\D/g, '');
      const formattedDate = `${d}/${m}/${y}`;
      const modalidade = app.modality === 'online' ? 'Online' : 'Presencial';

      const message = `Olá, ${app.patientName}! 👋\n\nPassando para confirmar sua sessão com a Dra. Adriana Catalani (${modalidade}) agendada para:\n📅 *${formattedDate}*\n⏰ *${app.startTime}*\n\nPor gentileza, confirme sua presença respondendo a esta mensagem. Abraço!`;

      // Exemplo de envio via Evolution API / Z-API:
      const gatewayUrl = process.env.WHATSAPP_API_URL;
      const apiKey = process.env.WHATSAPP_API_KEY;

      if (gatewayUrl && apiKey) {
        try {
          await axios.post(`${gatewayUrl}/messages/send`, {
            number: cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`,
            text: message,
          }, {
            headers: { 'apikey': apiKey }
          });
          sentCount++;
        } catch (err) {
          console.error(`Falha no envio para ${app.patientName}:`, err.message);
        }
      }

      batch.update(doc.ref, {
        reminderSent_1day: true,
        lastReminderSentAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();
    console.log(`[Lembrete Cron] Concluído. Lembretes enviados: ${sentCount}`);
    return null;
  });
