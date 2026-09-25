import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  Calendar, 
  Clock, 
  CheckCircle,
  HelpCircle,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Plus,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { askAIAssistant, formatDisplayDate } from '../../services/aiAssistantService';
import { getWhatsAppCustomLink } from '../../services/appointmentService';

export default function AIAssistantDrawer({ 
  appointments = [], 
  patients = [], 
  onQuickSchedule,
  onOpenMessageModal,
  onNavigateDate,
  onDispatchReminder
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Olá, Dra. Adriana! 👋 Sou sua assistente inteligente. Como posso facilitar o seu dia no consultório?',
      action: null,
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechAvailable, setSpeechAvailable] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeechIdx, setActiveSpeechIdx] = useState(null);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Inicializa reconhecimento de voz nativo do navegador (100% gratuito)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechAvailable(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'pt-BR';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
          // Opcional: auto-enviar comando de voz
          setTimeout(() => {
            handleSendMessage(transcript);
          }, 300);
        }
      };

      recognition.onerror = (event) => {
        console.warn("[Voice Recognition] Erro:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!speechAvailable || !recognitionRef.current) {
      alert("Reconhecimento de voz não suportado pelo seu navegador atual. Recomendamos o Google Chrome.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        recognitionRef.current.stop();
        setTimeout(() => recognitionRef.current.start(), 200);
      }
    }
  };

  // Leitura em voz alta da resposta (Text to Speech nativo do navegador - 100% gratuito)
  const speakText = (text, idx) => {
    if (!window.speechSynthesis) return;

    if (isSpeaking && activeSpeechIdx === idx) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setActiveSpeechIdx(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Limpa marcações markdown para leitura natural
    const cleanText = text.replace(/[*#_`•]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.05;

    // Tenta encontrar voz em português
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang.includes('pt-BR') || v.lang.includes('pt'));
    if (ptVoice) utterance.voice = ptVoice;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setActiveSpeechIdx(idx);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setActiveSpeechIdx(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setActiveSpeechIdx(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMessage = { role: 'user', text, action: null };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await askAIAssistant(text, { appointments, patients });
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: response.reply,
        action: response.action,
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: 'Desculpe, Dra. Adriana, ocorreu um erro momentâneo ao processar a consulta. Poderia tentar novamente?',
        action: null,
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setMessages([
      {
        role: 'assistant',
        text: 'Histórico limpo! Como posso te ajudar agora, Dra. Adriana?',
        action: null,
      }
    ]);
  };

  const quickPrompts = [
    { label: "📢 Avisar Pacientes de Amanhã", prompt: "Avisar pacientes de amanhã pelo WhatsApp" },
    { label: "🕒 Consultas de Hoje", prompt: "Quais são meus atendimentos de hoje?" },
    { label: "🔍 Horários Livres", prompt: "Quais horários livres tenho disponíveis hoje e amanhã?" },
    { label: "⏳ Quem Falta Confirmar?", prompt: "Quem ainda precisa confirmar presença nas próximas consultas?" },
    { label: "📅 Agendar Nova Consulta", prompt: "Gostaria de agendar uma consulta para amanhã" },
  ];

  return (
    <>
      {/* Botão Flutuante Discreto e Elegante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-[#fd6011] to-[#ff7a38] text-white rounded-full font-black text-xs shadow-xl shadow-[#fd6011]/30 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          title="Abrir Assistente Inteligente da Dra. Adriana"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles size={14} className="text-[#fee64b] group-hover:rotate-12 transition-transform" />
          </div>
          <span>Assistente IA</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </button>
      )}

      {/* Drawer / Janela do Chat IA */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm sm:max-w-md md:max-w-lg bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-[#2d231a]/10 overflow-hidden flex flex-col h-[580px] animate-in slide-in-from-bottom duration-300">
          
          {/* Header da IA */}
          <div className="bg-gradient-to-r from-[#2d231a] to-[#423427] text-white px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-[#fee64b] shadow-2xs">
                <Bot size={22} />
              </div>
              <div>
                <h3 className="text-sm font-black flex items-center gap-1.5">
                  Assistente Dra. Adriana
                  <span className="text-[10px] font-black px-2 py-0.5 bg-[#fd6011] text-white rounded-full">
                    IA Pro
                  </span>
                </h3>
                <p className="text-[10px] text-white/70 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Voz, agendamentos rápidos & lembretes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                title="Limpar conversa"
                className="p-1.5 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => {
                  if (window.speechSynthesis) window.speechSynthesis.cancel();
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Área de Mensagens */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-[#fd6011]/10 text-[#fd6011] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={15} />
                  </div>
                )}

                <div className={`space-y-2 max-w-[85%] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`rounded-2xl p-3 leading-relaxed whitespace-pre-wrap relative group ${
                      m.role === 'user'
                        ? 'bg-gradient-to-r from-[#fd6011] to-[#ff7a38] text-white font-semibold rounded-tr-xs shadow-xs'
                        : 'bg-[#faf8f5] text-[#2d231a] border border-[#2d231a]/8 rounded-tl-xs shadow-2xs font-medium'
                    }`}
                  >
                    {m.text}

                    {/* Botão de Leitura de Voz */}
                    {m.role === 'assistant' && (
                      <button
                        onClick={() => speakText(m.text, idx)}
                        title={isSpeaking && activeSpeechIdx === idx ? "Pausar áudio" : "Ouvir resposta em voz alta"}
                        className="absolute bottom-1.5 right-1.5 p-1 rounded-lg bg-black/5 hover:bg-black/10 text-gray-500 hover:text-black transition-colors cursor-pointer"
                      >
                        {isSpeaking && activeSpeechIdx === idx ? (
                          <VolumeX size={13} className="text-[#fd6011] animate-pulse" />
                        ) : (
                          <Volume2 size={13} />
                        )}
                      </button>
                    )}
                  </div>

                  {/* CARTÕES DE AÇÃO INTERATIVOS NA CONVERSA */}
                  {m.action && (
                    <div className="animate-in fade-in zoom-in-95 duration-200">
                      
                      {/* 1. SUGESTÃO DE AGENDAMENTO */}
                      {m.action.type === 'SCHEDULE_SUGGESTION' && (
                        <div className="bg-white rounded-2xl p-3 border border-amber-300 shadow-sm space-y-2.5">
                          <div className="flex items-center justify-between text-[11px] font-black text-[#2d231a]">
                            <span className="flex items-center gap-1.5 text-[#fd6011]">
                              <Calendar size={13} />
                              Agendamento Rápido
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px]">
                              {m.action.data.modality === 'online' ? 'Online' : 'Presencial'}
                            </span>
                          </div>

                          <div className="text-[11px] text-[#2d231a]/80 space-y-0.5 bg-[#faf8f5] p-2.5 rounded-xl border border-[#2d231a]/6">
                            <div>Paciente: <strong>{m.action.data.patientName}</strong></div>
                            <div>Data: <strong>{formatDisplayDate(m.action.data.date)}</strong></div>
                            <div>Horário: <strong>{m.action.data.startTime}</strong></div>
                          </div>

                          <button
                            onClick={() => {
                              if (onQuickSchedule) {
                                onQuickSchedule(m.action.data);
                              }
                            }}
                            className="w-full py-2 px-3 bg-[#fd6011] hover:bg-[#e0520b] text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                          >
                            <Plus size={14} />
                            <span>Confirmar e Salvar na Agenda</span>
                          </button>
                        </div>
                      )}

                      {/* 2. FILA DE LEMBRETES AUTOMÁTICOS PARA WHATSAPP */}
                      {m.action.type === 'BATCH_REMINDERS' && (
                        <div className="bg-emerald-50/80 rounded-2xl p-3 border border-emerald-200 shadow-sm space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-black text-emerald-900">
                            <span className="flex items-center gap-1.5">
                              <MessageCircle size={14} className="text-emerald-600" />
                              Lembretes Prontos ({m.action.items.length})
                            </span>
                          </div>

                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {m.action.items.map((item, itemIdx) => (
                              <div
                                key={itemIdx}
                                className="bg-white p-2 rounded-xl border border-emerald-100 flex items-center justify-between gap-2 shadow-2xs"
                              >
                                <div className="text-[11px]">
                                  <strong className="text-[#2d231a]">{item.patientName}</strong>
                                  <div className="text-[10px] text-gray-500">
                                    {item.labelDate} às {item.startTime} • {item.phone || 'Sem fone'}
                                  </div>
                                </div>

                                {item.phone ? (
                                  <a
                                    href={getWhatsAppCustomLink(item.phone, item.messageText)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold inline-flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                                    title="Disparar no WhatsApp"
                                  >
                                    <Send size={11} />
                                    <span>Avisar</span>
                                  </a>
                                ) : (
                                  <span className="text-[10px] text-gray-400 font-bold">Sem nº</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 3. LISTA DE HORÁRIOS LIVRES */}
                      {m.action.type === 'FREE_SLOTS' && (
                        <div className="bg-white rounded-2xl p-3 border border-[#2d231a]/10 shadow-sm space-y-2">
                          <div className="text-[11px] font-black text-[#2d231a] flex items-center gap-1.5">
                            <Clock size={13} className="text-[#fd6011]" />
                            <span>Vagas Disponíveis ({formatDisplayDate(m.action.date)})</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5">
                            {m.action.slots.map((slot, sIdx) => (
                              <button
                                key={sIdx}
                                onClick={() => {
                                  if (onQuickSchedule) {
                                    onQuickSchedule({
                                      date: m.action.date,
                                      startTime: slot,
                                    });
                                  }
                                }}
                                className="py-1 px-2 bg-[#faf8f5] hover:bg-[#fd6011] hover:text-white text-[#2d231a] rounded-lg text-[11px] font-bold border border-[#2d231a]/8 transition-all cursor-pointer text-center"
                                title="Agendar neste horário"
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 4. VISUALIZAR DIA NA AGENDA */}
                      {m.action.type === 'VIEW_DAY' && (
                        <button
                          onClick={() => {
                            if (onNavigateDate) onNavigateDate(m.action.date);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2d231a] hover:bg-black text-white rounded-xl text-[11px] font-bold shadow-2xs transition-all cursor-pointer"
                        >
                          <Calendar size={13} />
                          <span>Abrir {formatDisplayDate(m.action.date)} no Calendário</span>
                          <ChevronRight size={13} />
                        </button>
                      )}

                      {/* 5. FICHA RÁPIDA DE PACIENTE */}
                      {m.action.type === 'PATIENT_CARD' && (
                        <div className="bg-white rounded-2xl p-3 border border-[#2d231a]/10 shadow-sm flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-[#2d231a]">
                            {m.action.patient.name}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {m.action.patient.phone && (
                              <a
                                href={getWhatsAppCustomLink(m.action.patient.phone, `Olá, ${m.action.patient.name}!`)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors cursor-pointer"
                                title="Conversar no WhatsApp"
                              >
                                <MessageCircle size={13} />
                              </a>
                            )}
                            <button
                              onClick={() => {
                                if (onQuickSchedule) {
                                  onQuickSchedule({
                                    patientId: m.action.patient.id,
                                    patientName: m.action.patient.name,
                                    phone: m.action.patient.phone,
                                    presetPatient: m.action.patient,
                                  });
                                }
                              }}
                              className="px-2.5 py-1 bg-[#fd6011] text-white rounded-lg text-[10px] font-black hover:bg-[#e0520b] transition-colors cursor-pointer"
                            >
                              + Agendar
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                </div>

                {m.role === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-[#2d231a] text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                    A
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 items-center text-gray-400">
                <div className="w-7 h-7 rounded-xl bg-[#fd6011]/10 text-[#fd6011] flex items-center justify-center shrink-0">
                  <Bot size={15} />
                </div>
                <div className="bg-[#faf8f5] border border-[#2d231a]/8 px-3 py-2 rounded-2xl flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#fd6011] rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-[#fd6011] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-[#fd6011] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Atalhos Rápidos */}
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto shrink-0">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q.prompt)}
                className="px-2.5 py-1 bg-white hover:bg-[#fd6011]/10 hover:text-[#fd6011] text-[#2d231a]/70 rounded-full text-[10px] font-bold border border-gray-200 whitespace-nowrap transition-colors cursor-pointer"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Indicador de Ouvindo Voz */}
          {isListening && (
            <div className="px-4 py-2 bg-red-50 border-t border-red-100 flex items-center justify-between text-xs text-red-600 font-bold animate-pulse">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                <span>Ouvindo sua voz... Fale com a assistente</span>
              </div>
              <button
                onClick={toggleListening}
                className="text-[10px] text-red-800 underline cursor-pointer"
              >
                Parar
              </button>
            </div>
          )}

          {/* Input de Envio & Microfone */}
          <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2 shrink-0">
            {/* Botão de Comando de Voz */}
            <button
              onClick={toggleListening}
              disabled={isTyping}
              className={`p-2.5 rounded-2xl transition-all cursor-pointer ${
                isListening 
                  ? 'bg-red-500 text-white animate-bounce shadow-md shadow-red-500/30' 
                  : 'bg-[#faf8f5] hover:bg-gray-200 text-gray-700 border border-[#2d231a]/10'
              }`}
              title={isListening ? "Parar gravação" : "Falar por comando de voz"}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            <input
              type="text"
              placeholder={isListening ? "Ouvindo você..." : "Pergunte, agende ou avise pacientes..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping || isListening}
              className="flex-1 px-3.5 py-2.5 bg-[#faf8f5] border border-[#2d231a]/10 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#fd6011]/30 transition-all"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={isTyping || !inputText.trim()}
              className="p-2.5 bg-[#2d231a] hover:bg-black text-white rounded-2xl disabled:opacity-40 transition-all cursor-pointer shadow-xs"
              title="Enviar comando"
            >
              <Send size={15} />
            </button>
          </div>

        </div>
      )}
    </>
  );
}
