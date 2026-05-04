import React, { useState } from 'react';
import { ChevronDown, MessageCircleQuestion } from 'lucide-react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      pergunta: "Como funciona a primeira consulta?",
      resposta: "A primeira sessão é um momento de acolhimento e escuta. Vamos nos conhecer, entender suas necessidades, tirar dúvidas sobre o processo e definir juntos como a terapia pode te ajudar."
    },
    {
      pergunta: "Os atendimentos são online ou presenciais?",
      resposta: "Atualmente realizo atendimentos [Online / Presenciais / Ambos]. As sessões online oferecem a mesma eficácia da terapia presencial, com a conveniência de fazer de onde você estiver, em um ambiente seguro e sigiloso."
    },
    {
      pergunta: "Você atende por plano de saúde (convênio)?",
      resposta: "Meus atendimentos são particulares. No entanto, forneço recibo detalhado para que você possa solicitar o reembolso junto ao seu plano de saúde, caso ele ofereça essa opção no seu contrato."
    },
    {
      pergunta: "Qual a duração e a frequência das sessões?",
      resposta: "As sessões duram em média 50 minutos. Geralmente, acontecem com frequência semanal, mas isso é conversado e ajustado de acordo com a sua necessidade logo nas primeiras consultas."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="bg-white py-20 sm:py-32 relative">
      <div className="max-w-4xl mx-auto px-6">
        
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-drica-blue/10 rounded-full flex items-center justify-center text-drica-blue">
              <MessageCircleQuestion size={32} />
            </div>
          </div>
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-drica-dark text-balance">
            Dúvidas Frequentes
          </h3>
          <p className="font-light text-lg sm:text-xl text-drica-dark/70 text-pretty">
            Respostas rápidas sobre o funcionamento das sessões.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`border border-drica-dark/10 rounded-2xl overflow-hidden transition-all duration-300 ${openIndex === index ? 'bg-drica-light/50 shadow-md' : 'bg-white hover:bg-drica-light/20'}`}
            >
              <button
                className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
                onClick={() => toggleFAQ(index)}
              >
                <span className="font-bold text-lg text-drica-dark pr-4">{faq.pergunta}</span>
                <ChevronDown 
                  className={`text-drica-orange shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} 
                  size={24} 
                />
              </button>
              
              <div 
                className={`transition-all duration-500 ease-in-out overflow-hidden ${openIndex === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <p className="px-6 pb-6 text-drica-dark/80 font-light leading-relaxed">
                  {faq.resposta}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}