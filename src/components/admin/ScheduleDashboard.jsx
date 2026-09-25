import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  subscribeToAppointments, 
  createAppointment, 
  createRecurringAppointments,
  updateAppointment, 
  deleteAppointment,
  getMessageTemplate,
  getWhatsAppCustomLink,
  MESSAGE_TEMPLATES
} from '../../services/appointmentService';
import {
  subscribeToPatients,
  createPatient,
  updatePatient,
  deletePatient
} from '../../services/patientService';
import {
  createGoogleCalendarEvent,
  updateGoogleCalendarEvent,
  deleteGoogleCalendarEvent
} from '../../services/googleCalendarService';
import {
  getPendingReminders,
  sendAutomatedReminder
} from '../../services/reminderAutomationService';
import AIAssistantDrawer from './AIAssistantDrawer';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Phone, 
  Plus, 
  MessageCircle, 
  Edit3, 
  Trash2, 
  LogOut, 
  Video, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CalendarRange,
  Sparkles,
  ArrowUpRight,
  Repeat,
  DollarSign,
  Copy,
  ExternalLink,
  Send,
  Link2,
  Users,
  UserCheck,
  UserPlus,
  GripVertical,
  Move,
  Bell,
  Check
} from 'lucide-react';
import icon from '../../assets/icons/icon.png';

function toDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseDateString(str) {
  if (!str) return new Date();
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}`;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEK_DAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const WEEK_DAYS_FULL = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

export default function ScheduleDashboard() {
  const { currentUser, logout, googleAccessToken } = useAuth();
  
  // Aba ativa: 'agenda' ou 'pacientes'
  const [mainTab, setMainTab] = useState('agenda');

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modo de visualização: 'month' | 'week' | 'day'
  const [viewMode, setViewMode] = useState('week');
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(toDateString(new Date()));
  
  const [statusFilter, setStatusFilter] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Drag and Drop
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverDate, setDragOverDate] = useState(null);

  // Toast
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Modal de Fila de Lembretes Automáticos
  const [isReminderQueueOpen, setIsReminderQueueOpen] = useState(false);
  const [batchReminderSending, setBatchReminderSending] = useState(false);

  // Modal de Agendamento
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [patientInputMode, setPatientInputMode] = useState('existing');

  // Modal de Pacientes
  const [isPatientEditModalOpen, setIsPatientEditModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [patientFormData, setPatientFormData] = useState({
    name: '',
    phone: '',
    email: '',
    defaultModality: 'presencial',
    sessionType: 'Individual Adulto',
    defaultPrice: '',
    notes: '',
  });

  // Modal de Mensagem WhatsApp
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [activeAppointmentForMessage, setActiveAppointmentForMessage] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(MESSAGE_TEMPLATES.CONFIRMATION);
  const [customMessageText, setCustomMessageText] = useState('');
  const [copiedToast, setCopiedToast] = useState(false);

  // Formulário de Agendamento
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    phone: '',
    date: toDateString(new Date()),
    startTime: '09:00',
    endTime: '10:00',
    modality: 'presencial',
    status: 'agendado',
    sessionType: 'Individual Adulto',
    price: '',
    paymentStatus: 'pendente',
    meetLink: '',
    notes: '',
    googleEventId: '',
    saveAsNewPatient: true,
    isRecurring: false,
    frequency: 'weekly',
    occurrences: 4,
  });

  // Assinatura em tempo real
  useEffect(() => {
    setLoading(true);
    const unsubAppointments = subscribeToAppointments(
      (data) => {
        setAppointments(data);
        setLoading(false);
      },
      (err) => {
        console.error("Erro nos agendamentos:", err);
        setLoading(false);
      }
    );

    const unsubPatients = subscribeToPatients(
      (data) => setPatients(data),
      (err) => console.error("Erro nos pacientes:", err)
    );

    return () => {
      unsubAppointments();
      unsubPatients();
    };
  }, []);

  // Lembretes pendentes de véspera / hoje
  const pendingReminders = useMemo(() => {
    return getPendingReminders(appointments);
  }, [appointments]);

  // Navegação
  const handleNavigate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + direction * 7);
    } else {
      newDate.setDate(newDate.getDate() + direction);
      setSelectedDateStr(toDateString(newDate));
    }
    setCurrentDate(newDate);
  };

  const handleNavigateYear = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(newDate.getFullYear() + direction);
    setCurrentDate(newDate);
  };

  const handleChangeMonth = (monthIndex) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(parseInt(monthIndex, 10));
    setCurrentDate(newDate);
  };

  const handleChangeYear = (year) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(parseInt(year, 10));
    setCurrentDate(newDate);
  };

  const handleGoToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(toDateString(today));
  };

  // Alternador Rápido de Pagamento (Pendente <-> Pago)
  const handleTogglePaymentStatus = async (e, item) => {
    e.stopPropagation();
    const newStatus = item.paymentStatus === 'pago' ? 'pendente' : 'pago';
    try {
      await updateAppointment(item.id, { paymentStatus: newStatus });
      showToast(newStatus === 'pago' 
        ? `✓ Pagamento de ${item.patientName} marcado como PAGO!` 
        : `⏳ Pagamento de ${item.patientName} marcado como PENDENTE.`);
    } catch (err) {
      console.error("Erro ao alterar pagamento:", err);
      alert("Falha ao atualizar status de pagamento.");
    }
  };

  // Drag and Drop (Reagendamento com sincronização no Google Agenda)
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, targetDateStr) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverDate !== targetDateStr) {
      setDragOverDate(targetDateStr);
    }
  };

  const handleDragLeave = (e, targetDateStr) => {
    e.preventDefault();
    if (dragOverDate === targetDateStr) {
      setDragOverDate(null);
    }
  };

  const handleDrop = async (e, targetDateStr) => {
    e.preventDefault();
    setDragOverDate(null);

    if (!draggedItem || draggedItem.date === targetDateStr) {
      setDraggedItem(null);
      return;
    }

    const patientName = draggedItem.patientName;
    const updatedData = { ...draggedItem, date: targetDateStr };

    try {
      await updateAppointment(draggedItem.id, { date: targetDateStr });

      // Sincronizar alteração no Google Calendar se houver evento vinculado
      if (draggedItem.googleEventId && googleAccessToken) {
        updateGoogleCalendarEvent(draggedItem.googleEventId, updatedData, googleAccessToken);
      }

      showToast(`✓ Consulta de ${patientName} reagendada para ${formatDisplayDate(targetDateStr)}!`);
    } catch (err) {
      console.error("Erro ao reagendar:", err);
      alert("Falha ao reagendar consulta.");
    } finally {
      setDraggedItem(null);
    }
  };

  // Filtragem dos Agendamentos
  const filteredAppointments = useMemo(() => {
    return appointments.filter((app) => {
      if (statusFilter === 'pago') {
        if (app.paymentStatus !== 'pago') return false;
      } else if (statusFilter === 'pendente_pagamento') {
        if (app.paymentStatus !== 'pendente') return false;
      } else if (statusFilter === 'convenio') {
        if (app.paymentStatus !== 'convenio' && !app.healthPlan) return false;
      } else if (statusFilter !== 'todos' && app.status !== statusFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = app.patientName?.toLowerCase().includes(q);
        const matchPhone = app.phone?.includes(q);
        const matchPlan = app.healthPlan?.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchPlan) return false;
      }
      return true;
    });
  }, [appointments, statusFilter, searchQuery]);

  const monthStringPrefix = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const appointmentsThisMonth = useMemo(() => {
    return appointments.filter(a => a.date?.startsWith(monthStringPrefix));
  }, [appointments, monthStringPrefix]);

  const financialStats = useMemo(() => {
    let totalPago = 0;
    let totalPendente = 0;
    let totalConvenio = 0;

    appointmentsThisMonth.forEach((a) => {
      const val = parseFloat(String(a.price || '0').replace(',', '.')) || 0;
      if (a.paymentStatus === 'pago') {
        totalPago += val;
      } else if (a.paymentStatus === 'convenio' || a.healthPlan) {
        totalConvenio += 1;
      } else if (a.status !== 'cancelado') {
        totalPendente += val;
      }
    });

    return { totalPago, totalPendente, totalConvenio };
  }, [appointmentsThisMonth]);

  const appointmentsByDate = useMemo(() => {
    const map = {};
    filteredAppointments.forEach((item) => {
      if (!map[item.date]) map[item.date] = [];
      map[item.date].push(item);
    });
    return map;
  }, [filteredAppointments]);

  // Cálculos de Mês e Semana
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    const startDayOfWeek = firstDay.getDay();
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const d = new Date(year, month - 1, dayNum);
      days.push({ date: d, dateStr: toDateString(d), dayNum, isCurrentMonth: false });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, dateStr: toDateString(d), dayNum: i, isCurrentMonth: true });
    }

    const totalCells = days.length > 35 ? 42 : 35;
    const remaining = totalCells - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, dateStr: toDateString(d), dayNum: i, isCurrentMonth: false });
    }

    return days;
  }, [currentDate]);

  const weekDays = useMemo(() => {
    const current = new Date(currentDate);
    const dayOfWeek = current.getDay();
    const sunday = new Date(current);
    sunday.setDate(current.getDate() - dayOfWeek);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      days.push({
        date: d,
        dateStr: toDateString(d),
        dayName: WEEK_DAYS_SHORT[d.getDay()],
        dayFull: WEEK_DAYS_FULL[d.getDay()],
        dayNum: d.getDate(),
      });
    }
    return days;
  }, [currentDate]);

  const recurringPreviewDates = useMemo(() => {
    if (!formData.isRecurring || !formData.date) return [];
    const [y, m, d] = formData.date.split('-').map(Number);
    const intervalDays = formData.frequency === 'biweekly' ? 14 : 7;
    const dates = [];
    for (let i = 0; i < Number(formData.occurrences); i++) {
      const dt = new Date(y, m - 1, d + (i * intervalDays));
      const day = String(dt.getDate()).padStart(2, '0');
      const mon = String(dt.getMonth() + 1).padStart(2, '0');
      dates.push(`${day}/${mon}`);
    }
    return dates;
  }, [formData.isRecurring, formData.date, formData.frequency, formData.occurrences]);

  // Modal handlers
  const handleOpenCreateModal = (presetDate = null, presetPatient = null, customPreset = null) => {
    setEditingItem(null);
    const activePatient = presetPatient || (customPreset?.presetPatient) || null;
    const hasExistingPatient = Boolean(activePatient) || (patients.length > 0 && !customPreset?.patientName);
    setPatientInputMode(activePatient || (patients.length > 0 && !customPreset?.patientName) ? 'existing' : 'new');
    setFormData({
      patientId: activePatient ? activePatient.id : (customPreset?.patientId || (patients.length > 0 && !customPreset?.patientName ? patients[0].id : '')),
      patientName: activePatient ? activePatient.name : (customPreset?.patientName || (patients.length > 0 ? patients[0].name : '')),
      phone: activePatient ? activePatient.phone : (customPreset?.phone || (patients.length > 0 ? patients[0].phone : '')),
      date: customPreset?.date || presetDate || selectedDateStr || toDateString(new Date()),
      startTime: customPreset?.startTime || '09:00',
      endTime: customPreset?.endTime || (customPreset?.startTime ? `${String(Math.min(23, parseInt(customPreset.startTime.split(':')[0], 10) + 1)).padStart(2, '0')}:${customPreset.startTime.split(':')[1] || '00'}` : '10:00'),
      modality: customPreset?.modality || (activePatient ? (activePatient.defaultModality || 'presencial') : 'presencial'),
      status: 'agendado',
      sessionType: activePatient ? (activePatient.sessionType || 'Individual Adulto') : 'Individual Adulto',
      price: activePatient ? (activePatient.defaultPrice || '') : '',
      paymentStatus: activePatient?.defaultBillingType === 'convenio' ? 'convenio' : (customPreset?.paymentStatus || 'pendente'),
      paymentMethod: customPreset?.paymentMethod || 'Pix',
      healthPlan: activePatient?.healthPlan || customPreset?.healthPlan || '',
      meetLink: '',
      notes: activePatient ? (activePatient.notes || '') : '',
      googleEventId: '',
      saveAsNewPatient: !activePatient && !patients.some(p => p.name.toLowerCase() === (customPreset?.patientName || '').toLowerCase()),
      isRecurring: false,
      frequency: 'weekly',
      occurrences: 4,
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSelectPatientDropdown = (patientId) => {
    const found = patients.find(p => p.id === patientId);
    if (found) {
      setFormData(prev => ({
        ...prev,
        patientId: found.id,
        patientName: found.name,
        phone: found.phone || '',
        modality: found.defaultModality || prev.modality,
        sessionType: found.sessionType || prev.sessionType,
        price: found.defaultPrice || prev.price,
        paymentStatus: found.defaultBillingType === 'convenio' ? 'convenio' : prev.paymentStatus,
        healthPlan: found.healthPlan || prev.healthPlan,
        notes: found.notes ? `${prev.notes ? prev.notes + ' | ' : ''}${found.notes}` : prev.notes,
        saveAsNewPatient: false
      }));
    }
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setPatientInputMode('existing');
    setFormData({
      patientId: item.patientId || '',
      patientName: item.patientName || '',
      phone: item.phone || '',
      date: item.date || toDateString(new Date()),
      startTime: item.startTime || '09:00',
      endTime: item.endTime || '10:00',
      modality: item.modality || 'presencial',
      status: item.status || 'agendado',
      sessionType: item.sessionType || 'Individual Adulto',
      price: item.price || '',
      paymentStatus: item.paymentStatus || 'pendente',
      paymentMethod: item.paymentMethod || 'Pix',
      healthPlan: item.healthPlan || '',
      meetLink: item.meetLink || '',
      notes: item.notes || '',
      googleEventId: item.googleEventId || '',
      saveAsNewPatient: false,
      isRecurring: false,
      frequency: 'weekly',
      occurrences: 4,
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSaveAppointment = async (e) => {
    e.preventDefault();
    if (!formData.patientName.trim()) {
      setModalError('Nome do paciente é obrigatório.');
      return;
    }
    setModalLoading(true);
    setModalError('');

    try {
      // 1. Auto-cadastrar novo paciente se solicitado
      if (patientInputMode === 'new' && formData.saveAsNewPatient && !formData.patientId) {
        try {
          const newPatientId = await createPatient({
            name: formData.patientName.trim(),
            phone: formData.phone.trim(),
            defaultModality: formData.modality,
            sessionType: formData.sessionType,
            defaultPrice: formData.price,
            defaultBillingType: formData.paymentStatus === 'convenio' ? 'convenio' : 'particular',
            healthPlan: formData.healthPlan || '',
            notes: formData.notes,
          });
          formData.patientId = newPatientId;
        } catch (errPatient) {
          console.warn("Aviso ao salvar paciente:", errPatient);
        }
      }

      // 2. Sincronização com o Google Calendar
      let gcalEventId = formData.googleEventId;
      if (googleAccessToken) {
        try {
          if (editingItem && gcalEventId) {
            await updateGoogleCalendarEvent(gcalEventId, formData, googleAccessToken);
          } else {
            const gcalRes = await createGoogleCalendarEvent(formData, googleAccessToken);
            if (gcalRes?.eventId) {
              gcalEventId = gcalRes.eventId;
              formData.googleEventId = gcalEventId;
            }
          }
        } catch (gcalErr) {
          console.warn("[Google Calendar] Erro na sincronização:", gcalErr);
        }
      }

      // 3. Salvar no Firestore
      if (editingItem) {
        await updateAppointment(editingItem.id, formData);
        showToast("✓ Consulta atualizada com sucesso!");
      } else {
        if (formData.isRecurring) {
          await createRecurringAppointments(formData, {
            frequency: formData.frequency,
            occurrences: Number(formData.occurrences),
          });
          showToast(`✓ ${formData.occurrences} sessões recorrentes agendadas!`);
        } else {
          await createAppointment(formData);
          showToast("✓ Consulta agendada com sucesso!");
        }
      }

      setIsModalOpen(false);

      // Sugerir confirmação no WhatsApp
      if (!editingItem && formData.phone) {
        handleOpenMessageModal(formData, MESSAGE_TEMPLATES.CONFIRMATION);
      }
    } catch (err) {
      setModalError(err.message || 'Erro ao salvar agendamento.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleQuickStatusChange = async (id, newStatus) => {
    try {
      await updateAppointment(id, { status: newStatus });
      showToast(`Status atualizado para "${newStatus}"!`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAppointment = async (id, name, googleEventId) => {
    if (window.confirm(`Deseja realmente excluir o agendamento de "${name}"?`)) {
      try {
        await deleteAppointment(id);
        if (googleEventId && googleAccessToken) {
          deleteGoogleCalendarEvent(googleEventId, googleAccessToken);
        }
        showToast("✓ Agendamento excluído.");
      } catch (err) {
        alert("Erro ao excluir agendamento.");
      }
    }
  };

  // Funções de Pacientes
  const handleOpenNewPatientModal = () => {
    setEditingPatient(null);
    setPatientFormData({
      name: '',
      phone: '',
      email: '',
      defaultModality: 'presencial',
      sessionType: 'Individual Adulto',
      defaultPrice: '',
      defaultBillingType: 'particular',
      healthPlan: '',
      notes: '',
    });
    setIsPatientEditModalOpen(true);
  };

  const handleOpenEditPatientModal = (p) => {
    setEditingPatient(p);
    setPatientFormData({
      name: p.name || '',
      phone: p.phone || '',
      email: p.email || '',
      defaultModality: p.defaultModality || 'presencial',
      sessionType: p.sessionType || 'Individual Adulto',
      defaultPrice: p.defaultPrice || '',
      defaultBillingType: p.defaultBillingType || 'particular',
      healthPlan: p.healthPlan || '',
      notes: p.notes || '',
    });
    setIsPatientEditModalOpen(true);
  };

  const handleSavePatientModal = async (e) => {
    e.preventDefault();
    if (!patientFormData.name.trim()) return;
    try {
      if (editingPatient) {
        await updatePatient(editingPatient.id, patientFormData);
        showToast("✓ Dados do paciente atualizados!");
      } else {
        await createPatient(patientFormData);
        showToast("✓ Paciente cadastrado com sucesso!");
      }
      setIsPatientEditModalOpen(false);
    } catch (err) {
      alert("Erro ao salvar paciente: " + err.message);
    }
  };

  const handleDeletePatient = async (id, name) => {
    if (window.confirm(`Deseja remover "${name}" do cadastro de pacientes?`)) {
      try {
        await deletePatient(id);
        showToast("✓ Paciente removido.");
      } catch (err) {
        alert("Erro ao remover paciente.");
      }
    }
  };

  // WhatsApp Modal
  const handleOpenMessageModal = (appointment, templateType = MESSAGE_TEMPLATES.CONFIRMATION) => {
    setActiveAppointmentForMessage(appointment);
    setSelectedTemplate(templateType);
    const initialText = getMessageTemplate(templateType, appointment);
    setCustomMessageText(initialText);
    setCopiedToast(false);
    setIsMessageModalOpen(true);
  };

  const handleTemplateChange = (type) => {
    setSelectedTemplate(type);
    if (activeAppointmentForMessage) {
      const text = getMessageTemplate(type, activeAppointmentForMessage);
      setCustomMessageText(text);
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(customMessageText);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  // Disparar lembrete automático com 1 clique
  const handleDispatchQuickReminder = async (app, type) => {
    const res = await sendAutomatedReminder(app, type);
    showToast(`✓ Lembrete de ${app.patientName} enviado/marcado como concluído!`);
  };

  const todayStr = toDateString(new Date());
  const appointmentsToday = appointments.filter(a => a.date === todayStr);

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#2d231a] font-sans selection:bg-[#fee64b] relative overflow-x-hidden pb-16">
      
      {/* Toast Flutuante */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-[#2d231a] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-black animate-in slide-in-from-bottom duration-300 border border-white/10">
          <Check size={16} className="text-[#fee64b]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Luzes de Fundo Disruptivas */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[#fd6011]/8 via-[#fee64b]/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="fixed bottom-0 right-10 w-[500px] h-[500px] bg-gradient-to-tr from-[#32a8e9]/8 via-[#fee64b]/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Header Superior Glassmorphic */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/85 border-b border-[#2d231a]/8 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img src={icon} alt="Dra. Adriana Catalani" className="w-10 h-10 object-contain drop-shadow-xs" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-[#2d231a]">
                  Agenda Dra. Adriana
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#fd6011]/15 to-[#fee64b]/30 text-[#fd6011]">
                  <Sparkles size={11} /> Pro
                </span>
                {googleAccessToken && (
                  <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    <Calendar size={10} /> Google Agenda Conectada
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#2d231a]/60 font-medium hidden sm:block">
                Gestão Inteligente de Horários, Pacientes & WhatsApp
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="inline-flex bg-[#faf8f5] p-1 rounded-2xl border border-[#2d231a]/8">
              <button
                onClick={() => setMainTab('agenda')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  mainTab === 'agenda'
                    ? 'bg-white text-[#fd6011] shadow-xs'
                    : 'text-[#2d231a]/70 hover:text-[#2d231a]'
                }`}
              >
                <Calendar size={14} />
                <span>Agenda</span>
              </button>

              <button
                onClick={() => setMainTab('pacientes')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  mainTab === 'pacientes'
                    ? 'bg-white text-[#fd6011] shadow-xs'
                    : 'text-[#2d231a]/70 hover:text-[#2d231a]'
                }`}
              >
                <Users size={14} />
                <span>Pacientes ({patients.length})</span>
              </button>
            </div>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#2d231a]/70 hover:text-[#2d231a] hover:bg-black/5 transition-all"
            >
              <span>Site</span>
              <ArrowUpRight size={14} />
            </Link>

            <div className="h-5 w-px bg-[#2d231a]/10"></div>

            <div className="flex items-center gap-2 pl-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#fd6011] to-[#fee64b] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {currentUser?.email ? currentUser.email[0].toUpperCase() : 'A'}
              </div>
              <button
                onClick={logout}
                title="Sair da conta"
                className="p-1.5 rounded-xl text-[#2d231a]/60 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Conteúdo Central */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

        {/* Banner Inteligente de Automação de Lembretes (Véspera e Dia da Consulta) */}
        {pendingReminders.totalPending > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs animate-in fade-in duration-300">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bell size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black text-[#2d231a] flex items-center gap-2">
                  Lembretes Automáticos Prontos para Envio
                  <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-extrabold">
                    {pendingReminders.totalPending} pendentes
                  </span>
                </h4>
                <p className="text-xs text-[#2d231a]/70 mt-0.5">
                  {pendingReminders.pendingTomorrow.length > 0 && (
                    <span>• {pendingReminders.pendingTomorrow.length} paciente(s) para confirmar a sessão de <strong>amanhã</strong>. </span>
                  )}
                  {pendingReminders.pendingToday.length > 0 && (
                    <span>• {pendingReminders.pendingToday.length} paciente(s) com sessão <strong>hoje</strong>.</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
              <button
                onClick={() => setIsReminderQueueOpen(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-[#fd6011] hover:opacity-95 text-white text-xs font-black rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles size={14} />
                <span>Central de Lembretes ({pendingReminders.totalPending})</span>
              </button>

              {pendingReminders.pendingTomorrow.slice(0, 1).map(app => (
                <button
                  key={app.id}
                  onClick={() => handleOpenMessageModal(app, MESSAGE_TEMPLATES.REMINDER)}
                  className="px-3.5 py-2.5 bg-[#2d231a] hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <MessageCircle size={14} />
                  <span>Avisar {app.patientName.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 1: AGENDA */}
        {/* ========================================================================= */}
        {mainTab === 'agenda' && (
          <>
            {/* Bento Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white/90 backdrop-blur-sm p-4 sm:p-5 rounded-3xl border border-[#2d231a]/8 shadow-xs">
                <div className="text-xs font-bold text-[#2d231a]/60 uppercase tracking-wider">Hoje</div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-3xl sm:text-4xl font-black text-[#2d231a]">
                    {appointmentsToday.length}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {appointmentsToday.filter(a => a.status === 'confirmado').length} conf.
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="bg-[#fd6011] h-full rounded-full" 
                    style={{ width: `${Math.min(100, (appointmentsToday.length / 8) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm p-4 sm:p-5 rounded-3xl border border-[#2d231a]/8 shadow-xs">
                <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Confirmadas no Mês</div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-3xl sm:text-4xl font-black text-emerald-600">
                    {appointmentsThisMonth.filter(a => a.status === 'confirmado').length}
                  </span>
                  <CheckCircle2 size={20} className="text-emerald-500 opacity-60" />
                </div>
                <p className="text-[11px] text-emerald-700/70 font-semibold mt-3">
                  Presenças confirmadas
                </p>
              </div>

              <div className="bg-white/90 backdrop-blur-sm p-4 sm:p-5 rounded-3xl border border-[#2d231a]/8 shadow-xs">
                <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center justify-between">
                  <span>Financeiro do Mês</span>
                  <DollarSign size={16} className="text-emerald-600" />
                </div>
                <div className="mt-2 flex items-baseline justify-between gap-2">
                  <div>
                    <span className="text-2xl sm:text-3xl font-black text-emerald-600">
                      R$ {financialStats.totalPago.toFixed(0)}
                    </span>
                    <span className="text-[10px] text-emerald-800/80 block font-bold">
                      ✓ Já Recebido
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-base sm:text-lg font-bold text-amber-600">
                      R$ {financialStats.totalPendente.toFixed(0)}
                    </span>
                    <span className="text-[10px] text-amber-800/80 block font-bold">
                      ⏳ A Receber
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all" 
                    style={{ width: `${Math.min(100, (financialStats.totalPago / ((financialStats.totalPago + financialStats.totalPendente) || 1)) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm p-4 sm:p-5 rounded-3xl border border-[#2d231a]/8 shadow-xs">
                <div className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Convênio & Planos</span>
                  <Users size={16} className="text-blue-500" />
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-3xl sm:text-4xl font-black text-blue-600">
                    {financialStats.totalConvenio}
                  </span>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                    {appointmentsThisMonth.length} sessões no mês
                  </span>
                </div>
                <p className="text-[11px] text-blue-700/70 font-semibold mt-3">
                  {MONTH_NAMES[currentDate.getMonth()]} de {currentDate.getFullYear()}
                </p>
              </div>
            </div>

            {/* Barra de Controle */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-[#2d231a]/8 shadow-sm space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  {/* Controles de Navegação com Pulo de Ano e Mês */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <div className="flex items-center bg-[#faf8f5] p-1 rounded-2xl border border-[#2d231a]/8 shadow-2xs">
                      <button
                        onClick={() => handleNavigateYear(-1)}
                        className="px-2 py-1.5 rounded-xl hover:bg-white text-[#2d231a] transition-all cursor-pointer font-black text-xs"
                        title="Ano Anterior (-1 Ano)"
                      >
                        «
                      </button>
                      <button
                        onClick={() => handleNavigate(-1)}
                        className="p-1.5 rounded-xl hover:bg-white text-[#2d231a] transition-all cursor-pointer"
                        title={viewMode === 'month' ? "Mês Anterior" : viewMode === 'week' ? "Semana Anterior" : "Dia Anterior"}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={handleGoToday}
                        className="px-3 py-1.5 text-xs font-black text-[#2d231a] hover:bg-white rounded-xl transition-all cursor-pointer"
                        title="Voltar para a data de hoje"
                      >
                        Hoje
                      </button>
                      <button
                        onClick={() => handleNavigate(1)}
                        className="p-1.5 rounded-xl hover:bg-white text-[#2d231a] transition-all cursor-pointer"
                        title={viewMode === 'month' ? "Próximo Mês" : viewMode === 'week' ? "Próxima Semana" : "Próximo Dia"}
                      >
                        <ChevronRight size={16} />
                      </button>
                      <button
                        onClick={() => handleNavigateYear(1)}
                        className="px-2 py-1.5 rounded-xl hover:bg-white text-[#2d231a] transition-all cursor-pointer font-black text-xs"
                        title="Próximo Ano (+1 Ano)"
                      >
                        »
                      </button>
                    </div>

                    {/* Seletores Diretos de Mês e Ano */}
                    <div className="flex items-center gap-1 bg-[#faf8f5] p-1 rounded-2xl border border-[#2d231a]/8">
                      <select
                        value={currentDate.getMonth()}
                        onChange={(e) => handleChangeMonth(e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-[#2d231a]/10 rounded-xl text-xs font-black text-[#2d231a] focus:outline-none focus:ring-2 focus:ring-[#fd6011]/30 cursor-pointer"
                      >
                        {MONTH_NAMES.map((m, idx) => (
                          <option key={idx} value={idx}>{m}</option>
                        ))}
                      </select>

                      <select
                        value={currentDate.getFullYear()}
                        onChange={(e) => handleChangeYear(e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-[#2d231a]/10 rounded-xl text-xs font-black text-[#fd6011] focus:outline-none focus:ring-2 focus:ring-[#fd6011]/30 cursor-pointer"
                      >
                        {[2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032].map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>

                    {viewMode === 'day' && (
                      <input
                        type="date"
                        value={selectedDateStr}
                        onChange={(e) => {
                          if (e.target.value) {
                            setSelectedDateStr(e.target.value);
                            setCurrentDate(new Date(e.target.value + 'T12:00:00'));
                          }
                        }}
                        className="px-2.5 py-1.5 bg-white border border-[#2d231a]/10 rounded-xl text-xs font-black text-[#2d231a] focus:outline-none cursor-pointer"
                      />
                    )}
                  </div>

                  <span className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-800 text-[11px] font-bold border border-purple-200/60">
                    <Move size={12} />
                    Arraste qualquer consulta para trocar o dia!
                  </span>
                </div>

                <div className="flex items-center gap-3 flex-wrap justify-between sm:justify-end">
                  <div className="inline-flex bg-[#faf8f5] p-1 rounded-2xl border border-[#2d231a]/8">
                    <button
                      onClick={() => setViewMode('month')}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        viewMode === 'month'
                          ? 'bg-white text-[#fd6011] shadow-xs'
                          : 'text-[#2d231a]/70 hover:text-[#2d231a]'
                      }`}
                    >
                      <CalendarDays size={14} />
                      <span>Mês</span>
                    </button>

                    <button
                      onClick={() => setViewMode('week')}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        viewMode === 'week'
                          ? 'bg-white text-[#fd6011] shadow-xs'
                          : 'text-[#2d231a]/70 hover:text-[#2d231a]'
                      }`}
                    >
                      <CalendarRange size={14} />
                      <span>Semana</span>
                    </button>

                    <button
                      onClick={() => setViewMode('day')}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        viewMode === 'day'
                          ? 'bg-white text-[#fd6011] shadow-xs'
                          : 'text-[#2d231a]/70 hover:text-[#2d231a]'
                      }`}
                    >
                      <Clock size={14} />
                      <span>Dia</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleOpenCreateModal()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#fd6011] to-[#ff7a38] text-white rounded-2xl font-black text-xs sm:text-sm shadow-md shadow-[#fd6011]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <Plus size={18} />
                    <span>Novo Agendamento</span>
                  </button>
                </div>
              </div>

              {/* Filtros e Busca */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-[#2d231a]/6">
                <div className="relative flex-1 max-w-md">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2d231a]/40" />
                  <input
                    type="text"
                    placeholder="Buscar paciente, telefone ou convênio..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-[#faf8f5] border border-[#2d231a]/8 rounded-2xl text-xs text-[#2d231a] placeholder-[#2d231a]/40 focus:outline-none focus:ring-2 focus:ring-[#fd6011]/30 transition-all font-medium"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {[
                    { id: 'todos', label: 'Todos' },
                    { id: 'confirmado', label: 'Confirmados' },
                    { id: 'pendente_pagamento', label: '⏳ Pgto Pendente' },
                    { id: 'pago', label: '✓ Pagos' },
                    { id: 'convenio', label: '🩺 Convênio/Plano' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStatusFilter(s.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        statusFilter === s.id
                          ? 'bg-[#2d231a] text-white shadow-xs'
                          : 'text-[#2d231a]/60 hover:bg-black/5 bg-[#faf8f5]'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* --- VISUALIZAÇÃO MENSAL COM DRAG & DROP --- */}
            {viewMode === 'month' && (
              <div className="bg-white/90 backdrop-blur-md rounded-3xl p-3 sm:p-5 border border-[#2d231a]/8 shadow-sm">
                <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                  {WEEK_DAYS_SHORT.map((day, idx) => (
                    <div 
                      key={day} 
                      className={`text-center py-2 text-xs font-black tracking-wider uppercase ${
                        idx === 0 || idx === 6 ? 'text-[#fd6011]' : 'text-[#2d231a]/50'
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {monthDays.map((cell, idx) => {
                    const isToday = cell.dateStr === todayStr;
                    const isSelected = cell.dateStr === selectedDateStr;
                    const isDropTarget = dragOverDate === cell.dateStr;
                    const dayItems = appointmentsByDate[cell.dateStr] || [];

                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedDateStr(cell.dateStr)}
                        onDragOver={(e) => handleDragOver(e, cell.dateStr)}
                        onDragLeave={(e) => handleDragLeave(e, cell.dateStr)}
                        onDrop={(e) => handleDrop(e, cell.dateStr)}
                        className={`min-h-[95px] sm:min-h-[125px] p-1.5 sm:p-2.5 rounded-2xl border transition-all flex flex-col justify-between group relative cursor-pointer ${
                          isDropTarget
                            ? 'bg-orange-100 border-2 border-dashed border-[#fd6011] scale-[1.02] shadow-lg ring-4 ring-[#fd6011]/20 z-10'
                            : !cell.isCurrentMonth 
                            ? 'bg-[#faf8f5]/40 opacity-40 border-transparent'
                            : isSelected
                            ? 'bg-gradient-to-b from-white to-[#fff9f0] border-[#fd6011] shadow-md ring-2 ring-[#fd6011]/20'
                            : isToday
                            ? 'bg-gradient-to-b from-white to-amber-50/50 border-amber-300 shadow-xs'
                            : 'bg-white border-[#2d231a]/6 hover:border-[#fd6011]/40 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                              isToday
                                ? 'bg-[#fd6011] text-white'
                                : isSelected
                                ? 'bg-[#2d231a] text-white'
                                : 'text-[#2d231a]'
                            }`}
                          >
                            {cell.dayNum}
                          </span>

                          {cell.isCurrentMonth && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenCreateModal(cell.dateStr);
                              }}
                              title="Agendar neste dia"
                              className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-[#fd6011]/10 text-[#fd6011] transition-opacity"
                            >
                              <Plus size={14} />
                            </button>
                          )}
                        </div>

                        <div className="space-y-1 my-1 overflow-hidden">
                          {dayItems.slice(0, 3).map((item) => (
                            <div
                              key={item.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, item)}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditModal(item);
                              }}
                              className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-bold truncate flex items-center justify-between gap-1 transition-all cursor-grab active:cursor-grabbing hover:shadow-xs ${
                                item.status === 'confirmado'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                                  : item.status === 'agendado'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200/60'
                                  : item.status === 'realizado'
                                  ? 'bg-blue-50 text-blue-800 border border-blue-200/60'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              <div className="flex items-center gap-1 min-w-0 truncate">
                                <GripVertical size={10} className="shrink-0 text-gray-400" />
                                <span className="shrink-0 font-extrabold">{item.startTime}</span>
                                <span className="truncate">{item.patientName}</span>
                              </div>
                              <span 
                                onClick={(e) => handleTogglePaymentStatus(e, item)}
                                title={item.paymentStatus === 'pago' ? "Pago (clique para alterar)" : item.paymentStatus === 'convenio' ? `Convênio: ${item.healthPlan || 'Plano'}` : "Pagamento Pendente (clique para marcar como Pago)"}
                                className={`shrink-0 text-[9px] px-1 py-0.2 rounded font-extrabold cursor-pointer hover:scale-110 transition-transform ${
                                  item.paymentStatus === 'pago'
                                    ? 'text-emerald-700 bg-emerald-100/80'
                                    : item.paymentStatus === 'convenio'
                                    ? 'text-blue-700 bg-blue-100/80'
                                    : 'text-amber-700 bg-amber-100/80'
                                }`}
                              >
                                {item.paymentStatus === 'pago' ? '✓' : item.paymentStatus === 'convenio' ? '🩺' : '⏳'}
                              </span>
                            </div>
                          ))}

                          {dayItems.length > 3 && (
                            <div 
                              onClick={() => {
                                setSelectedDateStr(cell.dateStr);
                                setViewMode('day');
                              }}
                              className="text-[10px] font-extrabold text-[#fd6011] hover:underline px-1"
                            >
                              +{dayItems.length - 3} mais...
                            </div>
                          )}
                        </div>

                        <div className="text-[10px] text-[#2d231a]/40 font-semibold text-right">
                          {dayItems.length > 0 && `${dayItems.length} sessões`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* --- VISUALIZAÇÃO SEMANAL COM DRAG & DROP --- */}
            {viewMode === 'week' && (
              <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                {weekDays.map((col) => {
                  const isToday = col.dateStr === todayStr;
                  const isSelected = col.dateStr === selectedDateStr;
                  const isDropTarget = dragOverDate === col.dateStr;
                  const dayItems = appointmentsByDate[col.dateStr] || [];

                  return (
                    <div
                      key={col.dateStr}
                      onDragOver={(e) => handleDragOver(e, col.dateStr)}
                      onDragLeave={(e) => handleDragLeave(e, col.dateStr)}
                      onDrop={(e) => handleDrop(e, col.dateStr)}
                      className={`bg-white/90 backdrop-blur-md rounded-3xl p-3 sm:p-4 border flex flex-col transition-all min-h-[420px] ${
                        isDropTarget
                          ? 'bg-orange-50/90 border-2 border-dashed border-[#fd6011] ring-4 ring-[#fd6011]/20 scale-[1.01] shadow-lg'
                          : isSelected
                          ? 'border-[#fd6011] ring-2 ring-[#fd6011]/20 shadow-md'
                          : isToday
                          ? 'border-amber-300 shadow-xs'
                          : 'border-[#2d231a]/8 hover:border-[#fd6011]/30'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-[#2d231a]/6 mb-3">
                        <div>
                          <div className="text-[11px] font-black uppercase text-[#2d231a]/50">
                            {col.dayName}
                          </div>
                          <div className={`text-xl font-black mt-0.5 ${isToday ? 'text-[#fd6011]' : 'text-[#2d231a]'}`}>
                            {col.dayNum}
                          </div>
                        </div>

                        <button
                          onClick={() => handleOpenCreateModal(col.dateStr)}
                          className="p-1.5 rounded-xl bg-[#faf8f5] hover:bg-[#fd6011] text-[#2d231a]/70 hover:text-white transition-colors cursor-pointer"
                          title="Agendar neste dia"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className="space-y-2.5 flex-1 overflow-y-auto pr-0.5">
                        {dayItems.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-[#2d231a]/30">
                            <Clock size={24} className="opacity-40 mb-1" />
                            <span className="text-[11px] font-semibold">Sem horários</span>
                            <span className="text-[10px] text-gray-400 mt-1">Solte para mover</span>
                          </div>
                        ) : (
                          dayItems.map((item) => (
                            <div
                              key={item.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, item)}
                              onClick={() => handleOpenEditModal(item)}
                              className="bg-[#faf8f5] hover:bg-white p-3 rounded-2xl border border-[#2d231a]/6 hover:border-[#fd6011]/40 hover:shadow-md transition-all cursor-grab active:cursor-grabbing space-y-2 group"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <GripVertical size={12} className="text-gray-400 group-hover:text-[#fd6011]" />
                                  <span className="text-xs font-black text-[#2d231a]">
                                    {item.startTime}
                                  </span>
                                </div>
                                <span
                                  className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase ${
                                    item.status === 'confirmado'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : item.status === 'agendado'
                                      ? 'bg-amber-100 text-amber-800'
                                      : item.status === 'realizado'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-gray-200 text-gray-700'
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </div>

                              <div>
                                <h4 className="text-xs font-bold text-[#2d231a] truncate">
                                  {item.patientName}
                                </h4>
                                <div className="flex items-center gap-1 text-[10px] text-[#2d231a]/60 mt-0.5 font-semibold">
                                  {item.modality === 'online' ? (
                                    <>
                                      <Video size={10} className="text-blue-500" />
                                      <span>Online</span>
                                    </>
                                  ) : (
                                    <>
                                      <MapPin size={10} className="text-emerald-500" />
                                      <span>Presencial</span>
                                    </>
                                  )}
                                  {item.isRecurring && (
                                    <span className="text-purple-600 font-extrabold">• Recorrente</span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center justify-between gap-1 pt-0.5">
                                <button
                                  type="button"
                                  onClick={(e) => handleTogglePaymentStatus(e, item)}
                                  className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full transition-all cursor-pointer hover:scale-102 ${
                                    item.paymentStatus === 'pago'
                                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                      : item.paymentStatus === 'convenio'
                                      ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                  }`}
                                  title="Clique para alternar Pago / Pendente"
                                >
                                  {item.paymentStatus === 'pago' ? (
                                    <>
                                      <span>✓ Pago</span>
                                      {item.price ? <span className="opacity-75 font-semibold">R${item.price}</span> : null}
                                    </>
                                  ) : item.paymentStatus === 'convenio' ? (
                                    <span>🩺 {item.healthPlan || 'Convênio'}</span>
                                  ) : (
                                    <>
                                      <span>⏳ Pendente</span>
                                      {item.price ? <span className="opacity-75 font-semibold">R${item.price}</span> : null}
                                    </>
                                  )}
                                </button>
                              </div>

                              {item.phone && (
                                <div className="pt-1 flex items-center justify-between border-t border-gray-100">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenMessageModal(item, MESSAGE_TEMPLATES.REMINDER);
                                    }}
                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                                  >
                                    <MessageCircle size={12} />
                                    <span>Lembrete</span>
                                  </button>
                                  <Edit3 size={12} className="opacity-0 group-hover:opacity-60 text-[#2d231a]" />
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* --- VISUALIZAÇÃO DIÁRIA --- */}
            {viewMode === 'day' && (
              <div className="space-y-4">
                <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 border border-[#2d231a]/8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#fd6011]">
                      Visão Detalhada
                    </span>
                    <h3 className="text-xl font-black text-[#2d231a] mt-0.5">
                      {parseDateString(selectedDateStr).getDate()} de {MONTH_NAMES[parseDateString(selectedDateStr).getMonth()]} de {parseDateString(selectedDateStr).getFullYear()}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={selectedDateStr}
                      onChange={(e) => setSelectedDateStr(e.target.value)}
                      className="px-3 py-2 bg-[#faf8f5] border border-[#2d231a]/10 rounded-xl text-xs font-bold text-[#2d231a] focus:outline-none"
                    />
                    <button
                      onClick={() => handleOpenCreateModal(selectedDateStr)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#fd6011] text-white rounded-xl text-xs font-bold hover:bg-orange-600 shadow-sm cursor-pointer"
                    >
                      <Plus size={16} />
                      <span>Agendar Neste Dia</span>
                    </button>
                  </div>
                </div>

                {(appointmentsByDate[selectedDateStr] || []).length === 0 ? (
                  <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-dashed border-[#2d231a]/15 p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#faf8f5] flex items-center justify-center text-[#2d231a]/40 mx-auto mb-3">
                      <Calendar size={32} />
                    </div>
                    <h4 className="text-base font-bold text-[#2d231a]">
                      Nenhuma sessão agendada para este dia
                    </h4>
                    <p className="text-xs text-[#2d231a]/50 mt-1 max-w-sm mx-auto">
                      Cadastre um novo agendamento ou ative a recorrência para preencher seus horários.
                    </p>
                    <button
                      onClick={() => handleOpenCreateModal(selectedDateStr)}
                      className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-[#2d231a] hover:bg-black text-white rounded-2xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <Plus size={16} />
                      Adicionar Agendamento
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(appointmentsByDate[selectedDateStr] || []).map((item) => (
                      <div
                        key={item.id}
                        className="bg-white/95 backdrop-blur-md rounded-3xl p-5 border border-[#2d231a]/8 hover:border-[#fd6011]/50 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className="bg-[#faf8f5] border border-[#2d231a]/8 rounded-2xl p-3 text-center min-w-[95px] shrink-0">
                            <span className="block text-lg font-black text-[#2d231a]">
                              {item.startTime}
                            </span>
                            <span className="block text-[11px] font-semibold text-[#2d231a]/50">
                              até {item.endTime}
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-base font-black text-[#2d231a]">
                                {item.patientName}
                              </h4>

                              {item.isRecurring && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
                                  <Repeat size={10} />
                                  {item.sessionNumber ? `Sessão ${item.sessionNumber} de ${item.totalSessions}` : 'Recorrente'}
                                </span>
                              )}

                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                  item.modality === 'online'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}
                              >
                                {item.modality === 'online' ? (
                                  <>
                                    <Video size={11} />
                                    Online
                                  </>
                                ) : (
                                  <>
                                    <MapPin size={11} />
                                    Presencial
                                  </>
                                )}
                              </span>

                              <select
                                value={item.status}
                                onChange={(e) => handleQuickStatusChange(item.id, e.target.value)}
                                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border cursor-pointer focus:outline-none ${
                                  item.status === 'confirmado'
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : item.status === 'agendado'
                                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                                    : item.status === 'realizado'
                                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                                    : 'bg-gray-100 text-gray-600 border-gray-300'
                                }`}
                              >
                                <option value="agendado">Agendado</option>
                                <option value="confirmado">Confirmado</option>
                                <option value="realizado">Realizado</option>
                                <option value="cancelado">Cancelado</option>
                              </select>

                              {/* Botão de Alternância Rápida de Pagamento */}
                              <button
                                type="button"
                                onClick={(e) => handleTogglePaymentStatus(e, item)}
                                className={`inline-flex items-center gap-1.5 text-xs font-black px-2.5 py-0.5 rounded-full border transition-all cursor-pointer hover:scale-105 ${
                                  item.paymentStatus === 'pago'
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                                    : item.paymentStatus === 'convenio'
                                    ? 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200'
                                    : 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                                }`}
                                title="Clique para alternar status financeiro (Pago / Pendente)"
                              >
                                {item.paymentStatus === 'pago' ? (
                                  <>
                                    <CheckCircle2 size={12} />
                                    <span>Pago</span>
                                  </>
                                ) : item.paymentStatus === 'convenio' ? (
                                  <span>🩺 {item.healthPlan || 'Convênio'}</span>
                                ) : (
                                  <>
                                    <Clock size={12} />
                                    <span>Pgto Pendente</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#2d231a]/70 font-medium">
                              {item.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone size={13} className="text-[#2d231a]/40" />
                                  {item.phone}
                                </span>
                              )}
                              {item.price && (
                                <span className="flex items-center gap-1 font-semibold text-emerald-700">
                                  <DollarSign size={13} />
                                  R$ {item.price}
                                </span>
                              )}
                              {item.meetLink && (
                                <a
                                  href={item.meetLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                                >
                                  <Link2 size={13} />
                                  Sala Online
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-[#2d231a]/6 shrink-0">
                          {item.phone && (
                            <button
                              onClick={() => handleOpenMessageModal(item, MESSAGE_TEMPLATES.REMINDER)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black shadow-xs hover:shadow transition-all cursor-pointer"
                            >
                              <MessageCircle size={15} />
                              <span>Confirmar WhatsApp</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-2 text-[#2d231a]/70 hover:text-[#fd6011] hover:bg-[#fd6011]/10 rounded-xl transition-colors cursor-pointer"
                          >
                            <Edit3 size={16} />
                          </button>

                          <button
                            onClick={() => handleDeleteAppointment(item.id, item.patientName, item.googleEventId)}
                            className="p-2 text-[#2d231a]/40 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* ABA 2: GESTÃO DE PACIENTES */}
        {/* ========================================================================= */}
        {mainTab === 'pacientes' && (
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 border border-[#2d231a]/8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-[#2d231a]">
                  Diretório de Pacientes
                </h2>
                <p className="text-xs text-[#2d231a]/60 mt-0.5">
                  Cadastre seus pacientes para agendar sessões com 1 clique e manter dados de contato centralizados.
                </p>
              </div>

              <button
                onClick={handleOpenNewPatientModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#fd6011] to-[#ff7a38] text-white rounded-2xl font-black text-xs sm:text-sm shadow-md shadow-[#fd6011]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer self-start sm:self-auto"
              >
                <UserPlus size={18} />
                <span>+ Novo Paciente</span>
              </button>
            </div>

            {patients.length === 0 ? (
              <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-dashed border-[#2d231a]/15 p-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
                  <Users size={32} />
                </div>
                <h4 className="text-base font-black text-[#2d231a]">
                  Nenhum paciente cadastrado ainda
                </h4>
                <p className="text-xs text-[#2d231a]/50 mt-1 max-w-sm mx-auto">
                  Cadastre seu primeiro paciente agora ou adicione um diretamente ao criar uma nova consulta.
                </p>
                <button
                  onClick={handleOpenNewPatientModal}
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-[#2d231a] hover:bg-black text-white rounded-2xl text-xs font-bold transition-all cursor-pointer"
                >
                  <UserPlus size={16} />
                  Cadastrar Primeiro Paciente
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {patients.map((p) => {
                  const patientAppointments = appointments.filter(a => a.patientId === p.id || a.patientName === p.name);
                  const nextAppointment = patientAppointments
                    .filter(a => a.date >= todayStr && a.status !== 'cancelado')
                    .sort((a, b) => a.date.localeCompare(b.date))[0];

                  return (
                    <div
                      key={p.id}
                      className="bg-white/90 backdrop-blur-md rounded-3xl p-5 border border-[#2d231a]/8 hover:border-[#fd6011]/40 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#fd6011]/15 to-[#fee64b]/30 text-[#fd6011] font-black text-base flex items-center justify-center shadow-2xs">
                              {p.name ? p.name[0].toUpperCase() : 'P'}
                            </div>
                            <div>
                              <h3 className="text-sm font-black text-[#2d231a] group-hover:text-[#fd6011] transition-colors">
                                {p.name}
                              </h3>
                              <span className="text-[11px] text-gray-500 font-medium">
                                {p.phone || 'Sem telefone'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditPatientModal(p)}
                              className="p-1.5 text-gray-400 hover:text-[#fd6011] hover:bg-[#fd6011]/10 rounded-xl transition-colors cursor-pointer"
                              title="Editar"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              onClick={() => handleDeletePatient(p.id, p.name)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                              title="Excluir"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-[#faf8f5] p-2 rounded-xl">
                            <span className="block text-[10px] text-gray-400 font-bold uppercase">Modalidade</span>
                            <span className="font-bold text-[#2d231a] capitalize">{p.defaultModality || 'Presencial'}</span>
                          </div>
                          <div className="bg-[#faf8f5] p-2 rounded-xl">
                            <span className="block text-[10px] text-gray-400 font-bold uppercase">Valor / Acordo</span>
                            <span className="font-bold text-emerald-700">
                              {p.defaultBillingType === 'convenio' ? (
                                `🩺 ${p.healthPlan || 'Convênio'}`
                              ) : p.defaultPrice ? (
                                `R$ ${p.defaultPrice}`
                              ) : (
                                'Particular'
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Tag de Tipo de Acordo / Plano */}
                        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                            p.defaultBillingType === 'convenio'
                              ? 'bg-blue-100 text-blue-800'
                              : p.defaultBillingType === 'reembolso'
                              ? 'bg-purple-100 text-purple-800'
                              : p.defaultBillingType === 'pacote'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-50 text-emerald-800'
                          }`}>
                            {p.defaultBillingType === 'convenio' 
                              ? `🩺 Convênio: ${p.healthPlan || 'Geral'}` 
                              : p.defaultBillingType === 'reembolso' 
                              ? '🔄 Recibo p/ Reembolso' 
                              : p.defaultBillingType === 'pacote'
                              ? '📦 Pacote Mensal'
                              : '💼 Particular'}
                          </span>
                        </div>

                        <div className="mt-3 text-xs bg-amber-50/70 border border-amber-200/50 p-2.5 rounded-xl">
                          <span className="block text-[10px] font-bold text-amber-800 uppercase">Próxima Consulta</span>
                          <span className="font-extrabold text-[#2d231a]">
                            {nextAppointment ? (
                              `📅 ${formatDisplayDate(nextAppointment.date)} às ${nextAppointment.startTime}`
                            ) : (
                              'Nenhuma agendada'
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center gap-2">
                        {p.phone && (
                          <a
                            href={getWhatsAppCustomLink(p.phone, `Olá, ${p.name}! Tudo bem? Aqui é a Dra. Adriana Catalani.`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl transition-all cursor-pointer"
                            title="Conversar no WhatsApp"
                          >
                            <MessageCircle size={16} />
                          </a>
                        )}

                        <button
                          onClick={() => {
                            setMainTab('agenda');
                            handleOpenCreateModal(null, p);
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#2d231a] hover:bg-black text-white rounded-xl text-xs font-black shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                        >
                          <Calendar size={14} />
                          <span>Agendar Consulta</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* BOT ASSISTENTE IA DA DRA. ADRIANA */}
      {/* ========================================================================= */}
      <AIAssistantDrawer 
        appointments={appointments} 
        patients={patients} 
        onQuickSchedule={(data) => handleOpenCreateModal(data.date, data.presetPatient, data)}
        onOpenMessageModal={(app, template) => handleOpenMessageModal(app, template)}
        onNavigateDate={(dateStr) => {
          setSelectedDateStr(dateStr);
          setCurrentDate(new Date(dateStr + 'T12:00:00'));
        }}
        onDispatchReminder={(app, type) => handleDispatchQuickReminder(app, type)}
      />

      {/* ========================================================================= */}
      {/* MODAL DE CADASTRO / EDIÇÃO DE CONSULTAS */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#2d231a]/10 relative my-8 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-[#2d231a]/40 hover:text-[#2d231a] p-1 rounded-xl hover:bg-black/5 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2 rounded-xl bg-[#fd6011]/10 text-[#fd6011]">
                <Clock size={20} />
              </div>
              <h3 className="text-xl font-black text-[#2d231a]">
                {editingItem ? 'Editar Consulta' : 'Novo Agendamento'}
              </h3>
            </div>
            <p className="text-xs text-[#2d231a]/60 mb-5 font-medium">
              Agende sessões individuais ou recorrentes com sincronização automática no Google Agenda.
            </p>

            {modalError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAppointment} className="space-y-4">
              
              {!editingItem && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1 bg-[#faf8f5] p-1 rounded-2xl border border-[#2d231a]/8">
                    <button
                      type="button"
                      onClick={() => setPatientInputMode('existing')}
                      className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        patientInputMode === 'existing'
                          ? 'bg-white text-[#fd6011] shadow-2xs'
                          : 'text-gray-500 hover:text-black'
                      }`}
                    >
                      Paciente Salvo ({patients.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPatientInputMode('new');
                        setFormData(prev => ({ ...prev, patientId: '', patientName: '', phone: '' }));
                      }}
                      className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        patientInputMode === 'new'
                          ? 'bg-white text-[#fd6011] shadow-2xs'
                          : 'text-gray-500 hover:text-black'
                      }`}
                    >
                      + Novo Paciente
                    </button>
                  </div>

                  {patientInputMode === 'existing' && (
                    <select
                      value={formData.patientId}
                      onChange={(e) => handleSelectPatientDropdown(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#faf8f5] border border-amber-300 rounded-2xl text-xs font-black text-[#2d231a] focus:outline-none focus:ring-2 focus:ring-[#fd6011]/30 cursor-pointer"
                    >
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} {p.phone ? `(${p.phone})` : ''} - {p.defaultModality || 'Presencial'}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {(patientInputMode === 'new' || editingItem) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-xs font-black text-[#2d231a] mb-1">
                      Nome do Paciente *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Mariana Silveira"
                      value={formData.patientName}
                      onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#faf8f5] border border-[#2d231a]/10 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#fd6011]/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#2d231a] mb-1">
                      WhatsApp com DDD
                    </label>
                    <input
                      type="text"
                      placeholder="(19) 99745-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#faf8f5] border border-[#2d231a]/10 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#fd6011]/30"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-black text-[#2d231a] mb-1">
                    Data {formData.isRecurring ? 'Inicial' : ''} *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-2.5 py-2 bg-[#faf8f5] border border-[#2d231a]/10 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#fd6011]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-[#2d231a] mb-1">
                    Início *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-2.5 py-2 bg-[#faf8f5] border border-[#2d231a]/10 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#fd6011]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-[#2d231a] mb-1">
                    Término
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-2.5 py-2 bg-[#faf8f5] border border-[#2d231a]/10 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#fd6011]/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[#2d231a] mb-1">
                  Modalidade
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, modality: 'presencial' })}
                    className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      formData.modality === 'presencial'
                        ? 'bg-[#2d231a] text-white shadow-xs'
                        : 'bg-[#faf8f5] text-[#2d231a]/70 hover:bg-gray-100 border border-[#2d231a]/8'
                    }`}
                  >
                    <MapPin size={14} className="text-emerald-400" />
                    <span>Presencial</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, modality: 'online' })}
                    className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      formData.modality === 'online'
                        ? 'bg-[#2d231a] text-white shadow-xs'
                        : 'bg-[#faf8f5] text-[#2d231a]/70 hover:bg-gray-100 border border-[#2d231a]/8'
                    }`}
                  >
                    <Video size={14} className="text-blue-400" />
                    <span>Online (Vídeo)</span>
                  </button>
                </div>
              </div>

              {formData.modality === 'online' && (
                <div className="bg-blue-50/70 p-3 rounded-2xl border border-blue-200">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-black text-blue-900">
                      Link da Videochamada (Google Meet / Zoom)
                    </label>
                    <a
                      href="https://meet.google.com/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      <ExternalLink size={11} />
                      Criar Meet
                    </a>
                  </div>
                  <input
                    type="url"
                    placeholder="https://meet.google.com/xyz"
                    value={formData.meetLink}
                    onChange={(e) => setFormData({ ...formData, meetLink: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>
              )}

              {/* Seção Financeira & Convênio */}
              <div className="bg-[#faf8f5] p-3.5 rounded-2xl border border-[#2d231a]/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <DollarSign size={15} className="text-emerald-600" />
                    <span className="text-xs font-black text-[#2d231a]">Financeiro & Acordo</span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    {formData.paymentStatus === 'pago' ? '✓ Pago' : formData.paymentStatus === 'convenio' ? '🩺 Convênio' : '⏳ Pendente'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#2d231a] mb-1">
                      Valor da Sessão (R$)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 200,00"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#2d231a]/10 rounded-xl text-xs font-bold text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#2d231a] mb-1">
                      Status do Pagamento
                    </label>
                    <select
                      value={formData.paymentStatus}
                      onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                      className="w-full px-2.5 py-2 bg-white border border-[#2d231a]/10 rounded-xl text-xs font-bold text-[#2d231a] focus:outline-none"
                    >
                      <option value="pendente">⏳ Pendente</option>
                      <option value="pago">✓ Pago</option>
                      <option value="convenio">🩺 Convênio / Plano</option>
                      <option value="reembolso">🔄 Reembolso</option>
                      <option value="mensalidade">📦 Pacote Mensal</option>
                      <option value="isento">🎁 Isento / Cortesia</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-[#2d231a] mb-1">
                      Forma de Pagamento
                    </label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-full px-2.5 py-2 bg-white border border-[#2d231a]/10 rounded-xl text-xs font-bold text-[#2d231a] focus:outline-none"
                    >
                      <option value="Pix">Pix</option>
                      <option value="Cartão">Cartão (Débito/Crédito)</option>
                      <option value="Dinheiro">Dinheiro</option>
                      <option value="Transferência">Transferência Bancária</option>
                      <option value="Guia de Convênio">Guia de Convênio / Autorização</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#2d231a] mb-1">
                      Nome do Convênio / Plano (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Unimed, Bradesco, Amil..."
                      value={formData.healthPlan}
                      onChange={(e) => setFormData({ ...formData, healthPlan: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#2d231a]/10 rounded-xl text-xs font-bold text-[#2d231a] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Recorrência Semanal */}
              {!editingItem && (
                <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Repeat size={16} className="text-purple-600" />
                      <div>
                        <span className="block text-xs font-black text-purple-950">
                          Sessões Recorrentes (Horário Fixo)
                        </span>
                        <span className="block text-[10px] text-purple-800/70">
                          {formData.date && (
                            <>Toda <strong>{WEEK_DAYS_FULL[parseDateString(formData.date).getDay()]}</strong> às <strong>{formData.startTime}</strong></>
                          )}
                        </span>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isRecurring}
                        onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  {formData.isRecurring && (
                    <div className="space-y-3 pt-2 border-t border-purple-200/80 animate-in fade-in duration-150">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-purple-900 mb-1">
                            Frequência
                          </label>
                          <select
                            value={formData.frequency}
                            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-purple-300 rounded-xl text-xs font-bold text-purple-900 focus:outline-none"
                          >
                            <option value="weekly">Semanal (Toda semana)</option>
                            <option value="biweekly">Quinzenal (A cada 15 dias)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-purple-900 mb-1">
                            Duração do Plano
                          </label>
                          <select
                            value={formData.occurrences}
                            onChange={(e) => setFormData({ ...formData, occurrences: Number(e.target.value) })}
                            className="w-full px-2.5 py-1.5 bg-white border border-purple-300 rounded-xl text-xs font-bold text-purple-900 focus:outline-none"
                          >
                            <option value={4}>4 sessões (~1 mês)</option>
                            <option value={8}>8 sessões (~2 meses)</option>
                            <option value={12}>12 sessões (~3 meses)</option>
                            <option value={24}>24 sessões (~6 meses)</option>
                          </select>
                        </div>
                      </div>

                      <div className="bg-white/80 p-2.5 rounded-xl border border-purple-200 text-[11px] text-purple-950">
                        <span className="font-extrabold block text-purple-800 mb-1">
                          📅 Datas das {formData.occurrences} sessões:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {recurringPreviewDates.map((dStr, idx) => (
                            <span key={idx} className="bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded text-[10px]">
                              Sessão {idx + 1}: {dStr}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-[#2d231a]/60 hover:bg-black/5 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#fd6011] to-[#ff7a38] text-white rounded-xl text-xs font-black shadow-md shadow-[#fd6011]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {modalLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  {editingItem ? 'Salvar Alterações' : 'Confirmar Agendamento'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL DE PACIENTES */}
      {isPatientEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#2d231a]/10 relative">
            <button
              onClick={() => setIsPatientEditModalOpen(false)}
              className="absolute top-5 right-5 text-[#2d231a]/40 hover:text-[#2d231a] p-1 rounded-xl hover:bg-black/5 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <UserPlus size={20} />
              </div>
              <h3 className="text-xl font-black text-[#2d231a]">
                {editingPatient ? 'Editar Paciente' : 'Novo Paciente'}
              </h3>
            </div>
            <p className="text-xs text-[#2d231a]/60 mb-5 font-medium">
              Dados cadastrais do paciente para agendamento rápido.
            </p>

            <form onSubmit={handleSavePatientModal} className="space-y-3.5">
              <div>
                <label className="block text-xs font-black text-[#2d231a] mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo"
                  value={patientFormData.name}
                  onChange={(e) => setPatientFormData({ ...patientFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#faf8f5] border border-[#2d231a]/10 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#fd6011]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#2d231a] mb-1">
                  WhatsApp com DDD
                </label>
                <input
                  type="text"
                  placeholder="(19) 99745-0000"
                  value={patientFormData.phone}
                  onChange={(e) => setPatientFormData({ ...patientFormData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#faf8f5] border border-[#2d231a]/10 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#fd6011]/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-[#2d231a] mb-1">
                    Modalidade Padrão
                  </label>
                  <select
                    value={patientFormData.defaultModality}
                    onChange={(e) => setPatientFormData({ ...patientFormData, defaultModality: e.target.value })}
                    className="w-full px-3 py-2 bg-[#faf8f5] border border-[#2d231a]/10 rounded-xl text-xs font-bold focus:outline-none"
                  >
                    <option value="presencial">Presencial</option>
                    <option value="online">Online</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-[#2d231a] mb-1">
                    Valor Padrão (R$)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 180,00"
                    value={patientFormData.defaultPrice}
                    onChange={(e) => setPatientFormData({ ...patientFormData, defaultPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-[#faf8f5] border border-[#2d231a]/10 rounded-xl text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-[#2d231a] mb-1">
                    Tipo de Acordo
                  </label>
                  <select
                    value={patientFormData.defaultBillingType}
                    onChange={(e) => setPatientFormData({ ...patientFormData, defaultBillingType: e.target.value })}
                    className="w-full px-3 py-2 bg-[#faf8f5] border border-[#2d231a]/10 rounded-xl text-xs font-bold focus:outline-none"
                  >
                    <option value="particular">Particular</option>
                    <option value="convenio">Convênio / Plano</option>
                    <option value="reembolso">Reembolso</option>
                    <option value="pacote">Pacote Mensal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-[#2d231a] mb-1">
                    {patientFormData.defaultBillingType === 'convenio' ? 'Nome do Convênio *' : 'Convênio / Plano'}
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Unimed, Amil..."
                    value={patientFormData.healthPlan}
                    onChange={(e) => setPatientFormData({ ...patientFormData, healthPlan: e.target.value })}
                    className="w-full px-3 py-2 bg-[#faf8f5] border border-[#2d231a]/10 rounded-xl text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPatientEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#2d231a] hover:bg-black text-white text-xs font-black rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  {editingPatient ? 'Salvar Alterações' : 'Cadastrar Paciente'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL DE ENVIO WHATSAPP */}
      {isMessageModalOpen && activeAppointmentForMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#2d231a]/10 relative">
            <button
              onClick={() => setIsMessageModalOpen(false)}
              className="absolute top-5 right-5 text-[#2d231a]/40 hover:text-[#2d231a] p-1 rounded-xl hover:bg-black/5 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <MessageCircle size={20} />
              </div>
              <h3 className="text-xl font-black text-[#2d231a]">
                Enviar Mensagem ao Paciente
              </h3>
            </div>
            <p className="text-xs text-[#2d231a]/60 mb-4 font-medium">
              Destinatário: <strong className="text-[#2d231a]">{activeAppointmentForMessage.patientName}</strong> ({activeAppointmentForMessage.phone || 'Sem telefone'})
            </p>

            <div className="flex items-center gap-1 bg-[#faf8f5] p-1 rounded-2xl border border-[#2d231a]/8 mb-3">
              <button
                type="button"
                onClick={() => handleTemplateChange(MESSAGE_TEMPLATES.CONFIRMATION)}
                className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                  selectedTemplate === MESSAGE_TEMPLATES.CONFIRMATION
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Confirmação
              </button>
              <button
                type="button"
                onClick={() => handleTemplateChange(MESSAGE_TEMPLATES.REMINDER)}
                className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                  selectedTemplate === MESSAGE_TEMPLATES.REMINDER
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Lembrete
              </button>
              <button
                type="button"
                onClick={() => handleTemplateChange(MESSAGE_TEMPLATES.ONLINE_LINK)}
                className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                  selectedTemplate === MESSAGE_TEMPLATES.ONLINE_LINK
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Link Online
              </button>
            </div>

            <div className="space-y-1 mb-4">
              <div className="flex items-center justify-between text-xs font-black text-[#2d231a]">
                <span>Texto da Mensagem</span>
                {copiedToast && (
                  <span className="text-emerald-600 text-[11px] font-bold animate-pulse">
                    ✓ Copiado com sucesso!
                  </span>
                )}
              </div>
              <textarea
                rows="6"
                value={customMessageText}
                onChange={(e) => setCustomMessageText(e.target.value)}
                className="w-full p-3 bg-[#faf8f5] border border-[#2d231a]/10 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30 leading-relaxed resize-none"
              ></textarea>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={handleCopyMessage}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                <Copy size={15} />
                <span>Copiar Texto</span>
              </button>

              <a
                href={getWhatsAppCustomLink(activeAppointmentForMessage.phone, customMessageText)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMessageModalOpen(false)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Send size={15} />
                <span>Abrir no WhatsApp</span>
              </a>
            </div>

          </div>
        </div>
      )}

      {/* MODAL CENTRAL DE LEMBRETES AUTOMÁTICOS */}
      {isReminderQueueOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-[#2d231a]/10 relative my-8 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsReminderQueueOpen(false)}
              className="absolute top-5 right-5 text-[#2d231a]/40 hover:text-[#2d231a] p-1 rounded-xl hover:bg-black/5 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="p-2.5 rounded-2xl bg-amber-500 text-white shadow-xs">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#2d231a]">
                  Central de Lembretes Automáticos
                </h3>
                <p className="text-xs text-[#2d231a]/60 font-medium">
                  Confirmações de presença para consultas de <strong>amanhã</strong> e de <strong>hoje</strong>.
                </p>
              </div>
            </div>

            <div className="my-5 space-y-4">
              {pendingReminders.totalPending === 0 ? (
                <div className="text-center py-12 px-4 bg-[#faf8f5] rounded-3xl border border-dashed border-gray-200">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 size={24} />
                  </div>
                  <h4 className="text-sm font-black text-[#2d231a]">
                    Tudo em dia!
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                    Não há pacientes com consultas pendentes de aviso para as próximas 24 horas.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Lembretes de Véspera (Amanhã) */}
                  {pendingReminders.pendingTomorrow.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-[#2d231a] uppercase tracking-wider flex items-center gap-1.5">
                        <Clock size={14} className="text-[#fd6011]" />
                        <span>Consultas de Amanhã ({pendingReminders.pendingTomorrow.length})</span>
                      </h4>
                      <div className="space-y-2">
                        {pendingReminders.pendingTomorrow.map(app => {
                          const msgText = getMessageTemplate(MESSAGE_TEMPLATES.REMINDER, app);
                          return (
                            <div 
                              key={app.id}
                              className="bg-[#faf8f5] border border-[#2d231a]/8 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <strong className="text-xs sm:text-sm font-black text-[#2d231a]">{app.patientName}</strong>
                                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                                    {app.modality === 'online' ? 'Online' : 'Presencial'}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-600 mt-0.5">
                                  Horário: <strong>{app.startTime}</strong> • Tel: {app.phone || 'Sem telefone'}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {app.phone && (
                                  <a
                                    href={getWhatsAppCustomLink(app.phone, msgText)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => handleDispatchQuickReminder(app, '1day')}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
                                  >
                                    <Send size={13} />
                                    <span>Enviar WhatsApp</span>
                                  </a>
                                )}
                                <button
                                  onClick={() => handleDispatchQuickReminder(app, '1day')}
                                  className="px-3 py-1.5 bg-white hover:bg-gray-100 text-[#2d231a] rounded-xl text-xs font-bold border border-gray-200 transition-colors cursor-pointer"
                                  title="Marcar como já enviado sem abrir o WhatsApp"
                                >
                                  ✓ Marcar Feito
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Lembretes do Dia (Hoje) */}
                  {pendingReminders.pendingToday.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-black text-[#2d231a] uppercase tracking-wider flex items-center gap-1.5">
                        <Clock size={14} className="text-emerald-600" />
                        <span>Consultas de Hoje ({pendingReminders.pendingToday.length})</span>
                      </h4>
                      <div className="space-y-2">
                        {pendingReminders.pendingToday.map(app => {
                          const msgType = app.modality === 'online' ? MESSAGE_TEMPLATES.ONLINE_LINK : MESSAGE_TEMPLATES.REMINDER;
                          const msgText = getMessageTemplate(msgType, app);
                          return (
                            <div 
                              key={app.id}
                              className="bg-[#faf8f5] border border-[#2d231a]/8 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <strong className="text-xs sm:text-sm font-black text-[#2d231a]">{app.patientName}</strong>
                                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                                    {app.modality === 'online' ? 'Online' : 'Presencial'}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-600 mt-0.5">
                                  Hoje às <strong>{app.startTime}</strong> • Tel: {app.phone || 'Sem telefone'}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {app.phone && (
                                  <a
                                    href={getWhatsAppCustomLink(app.phone, msgText)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => handleDispatchQuickReminder(app, 'sameday')}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
                                  >
                                    <Send size={13} />
                                    <span>Enviar WhatsApp</span>
                                  </a>
                                )}
                                <button
                                  onClick={() => handleDispatchQuickReminder(app, 'sameday')}
                                  className="px-3 py-1.5 bg-white hover:bg-gray-100 text-[#2d231a] rounded-xl text-xs font-bold border border-gray-200 transition-colors cursor-pointer"
                                  title="Marcar como já enviado sem abrir o WhatsApp"
                                >
                                  ✓ Marcar Feito
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsReminderQueueOpen(false)}
                className="px-5 py-2.5 bg-[#2d231a] hover:bg-black text-white text-xs font-black rounded-xl transition-all cursor-pointer"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
