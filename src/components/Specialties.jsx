import React from 'react';
import { Users, Sparkles, Compass, Cloud } from 'lucide-react';

export default function Specialties() {
  // Mapeamento de estilos expandido com a nova cor vermelha
  const colorStyles = {
    orange: { 
      bg: 'bg-drica-orange/20', 
      text: 'text-drica-orange', 
      border: 'border-drica-orange', 
      bgHover: 'group-hover:bg-drica-orange/[0.04]'
    },
    blue: { 
      bg: 'bg-drica-blue/20', 
      text: 'text-drica-blue', 
      border: 'border-drica-blue',   
      bgHover: 'group-hover:bg-drica-blue/[0.04]'
    },
    yellow: { 
      bg: 'bg-drica-yellow/20', 
      text: 'text-drica-yellow', 
      border: 'border-drica-yellow', 
      bgHover: 'group-hover:bg-drica-yellow/[0.04]'
    },
    red: { 
      // Utilizando o vermelho padrão do Tailwind (red-500) para garantir compatibilidade
      bg: 'bg-red-500/20', 
      text: 'text-red-500', 
      border: 'border-red-500', 
      bgHover: 'group-hover:bg-red-500/[0.04]'
    }
  };

  const especialidades = [
    {
      icon: Compass,
      colorTheme: colorStyles.yellow, // AMARELO
      title: 'Autoconhecimento',
      description: 'Um espaço para compreender padrões, emoções e escolhas, fortalecendo sua relação consigo mesmo e promovendo mais consciência e autenticidade na vida.'
    },
    {
      icon: Sparkles,
      colorTheme: colorStyles.blue, // AZUL 
      title: 'Ansiedade e Estresse',
      description: 'Acolhimento para momentos de sobrecarga emocional, pensamentos acelerados e ansiedade, ajudando você a recuperar equilíbrio, leveza e qualidade de vida.'
    },
    {
      icon: Users,
      colorTheme: colorStyles.red, // VERMELHO (Atualizado conforme o seu pedido)
      title: 'Relacionamentos Afetivos',
      description: 'Um espaço seguro para compreender vínculos, melhorar a comunicação, lidar com conflitos emocionais e construir relações mais saudáveis e conscientes.'
    },
    {
      icon: Cloud,
      colorTheme: colorStyles.orange, // LARANJA 
      title: 'Luto e Processos de Perda',
      description: 'O luto pode despertar dores profundas, mudanças e sentimentos difíceis de nomear. A terapia oferece acolhimento e suporte emocional para atravessar esse processo com cuidado e respeito ao seu tempo.'
    }
  ];

  return (
    <section id="especialidades" className="bg-drica-light py-20 sm:py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Cabeçalho da Seção */}
        <div className="text-center mb-16 sm:mb-24">
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-drica-dark text-balance">
            Áreas de Atuação
          </h3>
          <p className="font-light text-lg sm:text-xl lg:text-2xl text-drica-dark/70 text-pretty">
            Foco direcionado para as suas necessidades emocionais.
          </p>
        </div>

        {/* Grid 2x2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 items-stretch">
          {especialidades.map((esp, index) => (
            <div 
              key={index} 
              className={`bg-white p-8 lg:p-10 rounded-[2.5rem] shadow-lg border-2 ${esp.colorTheme.border} border-b-[8px] ${esp.colorTheme.bgHover} hover:-translate-y-3 hover:shadow-2xl transition-all duration-500 group flex flex-col h-full`}
            >
              <div className={`w-16 h-16 rounded-2xl ${esp.colorTheme.bg} flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                <esp.icon className={`${esp.colorTheme.text} w-8 h-8`} />
              </div>
              
              <h4 className={`text-2xl font-bold mb-4 transition-colors duration-500 ${esp.colorTheme.text}`}>
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