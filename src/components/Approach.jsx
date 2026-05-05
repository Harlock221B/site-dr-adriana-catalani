import React from 'react';
import { Heart, Brain, Sun } from 'lucide-react';

export default function Approach() {
  // Objeto de estilos para evitar problemas de compilação com o TailwindCSS
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
      text: 'O primeiro passo é criar um laço de confiança. Uma escuta ativa e empática, construindo o ambiente seguro fundamental para a terapia.' 
    },
    { 
      icon: Brain, 
      colorTheme: pillarStyles.blue, 
      title: 'Análise', 
      text: 'Através das ferramentas da psicanálise, investigamos juntos as raízes dos seus sentimentos e padrões de comportamento profundos.' 
    },
    { 
      icon: Sun, 
      colorTheme: pillarStyles.orange, 
      title: 'Clareza', 
      text: 'A luz da luminária. Direcionamos a atenção para o que realmente importa, promovendo clareza mental e autonomia emocional.' 
    }
  ];

  return (
    <section id="abordagem" className="bg-white py-20 sm:py-32">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-16 sm:mb-24">
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-drica-dark text-balance">
            Os Pilares do Atendimento
          </h3>
          <p className="font-light text-lg sm:text-xl lg:text-2xl text-drica-dark/70 max-w-3xl mx-auto text-pretty leading-relaxed">
            Uma estrutura baseada na escola da Bauhaus: funcional, clara e focada no essencial para o seu bem-estar emocional.
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
        
      </div>
    </section>
  );
}