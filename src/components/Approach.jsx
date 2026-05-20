import React from 'react';
import { Heart, Brain, Sun } from 'lucide-react';

export default function Approach() {
  // Objeto de estilos declarado com strings completas das classes Tailwind.
  // Isto evita a interpolação dinâmica (ex: `bg-${cor}/20`) e garante que 
  // as classes não sejam purgadas no build final.
  const pillarStyles = {
    yellow: { bg: 'bg-drica-yellow/20', text: 'text-drica-yellow', border: 'border-drica-yellow' },
    blue: { bg: 'bg-drica-blue/20', text: 'text-drica-blue', border: 'border-drica-blue' },
    orange: { bg: 'bg-drica-orange/20', text: 'text-drica-orange', border: 'border-drica-orange' }
  };

  const pilares = [
    { 
      icon: Heart, 
      colorTheme: pillarStyles.yellow, 
      title: 'Acolhimento', 
      text: 'O primeiro passo da terapia é sentir-se seguro para falar, sem julgamentos. Um espaço de escuta, cuidado e confiança para que você possa ser quem realmente é.' 
    },
    { 
      icon: Brain, 
      colorTheme: pillarStyles.blue, 
      title: 'Análise', 
      text: 'Juntos, buscamos compreender emoções, padrões e dores que muitas vezes se repetem silenciosamente, ajudando você a enxergar sua história com mais profundidade e clareza.' 
    },
    { 
      icon: Sun, 
      colorTheme: pillarStyles.orange, 
      title: 'Clareza', 
      text: 'A terapia pode ajudar a organizar pensamentos, compreender sentimentos e trazer mais leveza para decisões, relações e caminhos da vida.' 
    }
  ];

  return (
    <section id="abordagem" className="bg-white py-20 sm:py-32">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-16 sm:mb-24">
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-drica-dark text-balance">
            Acolhimento, Análise e Clareza
          </h3>
          <p className="font-light text-lg sm:text-xl lg:text-2xl text-drica-dark/70 max-w-3xl mx-auto text-pretty leading-relaxed">
            Um atendimento pensado para oferecer acolhimento, clareza emocional e um espaço seguro para compreender sua história.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {pilares.map((pilar) => (
            <div 
              key={pilar.title} 
              className={`group p-8 sm:p-10 lg:p-12 bg-drica-light rounded-[2.5rem] border-b-[8px] sm:border-b-[12px] ${pilar.colorTheme.border} transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl relative overflow-hidden flex flex-col items-center sm:items-start text-center sm:text-left`}
            >
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${pilar.colorTheme.bg} flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-500`}>
                <pilar.icon className={`${pilar.colorTheme.text} w-8 h-8 sm:w-10 sm:h-10`} />
              </div>
              
              <h4 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
                {pilar.title}
              </h4>
              
              <p className="font-light text-base sm:text-lg text-drica-dark/80 leading-relaxed text-pretty">
                {pilar.text}
              </p>
            </div>
          ))}
        </div>

        {/* Respiro Adicional */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl md:text-3xl font-light italic text-drica-dark/60">
            "Nem sempre é fácil pedir ajuda."
          </h3>
        </div>
        
      </div>
    </section>
  );
}