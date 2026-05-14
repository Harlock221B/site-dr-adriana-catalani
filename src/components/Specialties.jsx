import React from 'react';
import { Users, Sparkles, Compass, Leaf } from 'lucide-react';

export default function Specialties() {
  const colorStyles = {
    orange: { bg: 'bg-drica-orange/20', text: 'text-drica-orange', border: 'border-drica-orange' },
    blue: { bg: 'bg-drica-blue/20', text: 'text-drica-blue', border: 'border-drica-blue' },
    yellow: { bg: 'bg-drica-yellow/20', text: 'text-drica-yellow', border: 'border-drica-yellow' }
  };

  const especialidades = [
    {
      icon: Compass,
      colorTheme: colorStyles.yellow,
      title: 'Autoconhecimento',
      description: 'Um espaço para compreender padrões, emoções e escolhas, fortalecendo sua relação consigo mesmo e promovendo mais consciência e autenticidade na vida.'
    },
    {
      icon: Sparkles,
      colorTheme: colorStyles.blue,
      title: 'Ansiedade e Estresse',
      description: 'Acolhimento para momentos de sobrecarga emocional, pensamentos acelerados e ansiedade, ajudando você a recuperar equilíbrio, leveza e qualidade de vida.'
    },
    {
      icon: Users,
      colorTheme: colorStyles.orange,
      title: 'Relacionamentos Afetivos',
      description: 'Um espaço seguro para compreender vínculos, melhorar a comunicação, lidar com conflitos emocionais e construir relações mais saudáveis e conscientes.'
    },
    {
      icon: Leaf,
      colorTheme: colorStyles.blue, // Reutilizando o azul para manter harmonia
      title: 'Luto e Processos de Perda',
      description: 'O luto pode despertar dores profundas, mudanças e sentimentos difíceis de nomear. A terapia oferece acolhimento e suporte emocional para atravessar esse processo com cuidado e respeito ao seu tempo.'
    }
  ];

  return (
    <section id="especialidades" className="bg-drica-light py-20 sm:py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-16 sm:mb-24">
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-drica-dark text-balance">
            Áreas de Atuação
          </h3>
          <p className="font-light text-lg sm:text-xl lg:text-2xl text-drica-dark/70 text-pretty">
            Foco direcionado para as suas necessidades emocionais.
          </p>
        </div>

        {/* Mudei o grid aqui para 2x2 para acomodar 4 cards perfeitamente */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 items-stretch">
          {especialidades.map((esp, index) => (
            <div 
              key={index} 
              className={`bg-white p-8 lg:p-10 rounded-[2.5rem] shadow-lg border-t border-l border-r border-drica-dark/5 border-b-[8px] ${esp.colorTheme.border} hover:-translate-y-3 hover:shadow-2xl transition-all duration-500 group flex flex-col h-full`}
            >
              <div className={`w-16 h-16 rounded-2xl ${esp.colorTheme.bg} flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                <esp.icon className={`${esp.colorTheme.text} w-8 h-8`} />
              </div>
              <h4 className="text-2xl font-bold mb-4 text-drica-dark">
                {esp.title}
              </h4>
              <p className="text-drica-dark/80 font-light leading-relaxed flex-grow">
                {esp.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}