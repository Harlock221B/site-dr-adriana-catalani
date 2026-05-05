import React from 'react';
import { Users, Sparkles, Compass } from 'lucide-react';

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
      description: 'Uma jornada profunda para entender seus desejos, medos e padrões de comportamento, promovendo maior autonomia emocional.'
    },
    {
      icon: Sparkles,
      colorTheme: colorStyles.blue,
      title: 'Ansiedade e Estresse',
      description: 'Ferramentas da psicanálise para compreender as raízes da ansiedade, ajudando a retomar o controle e a leveza no dia a dia.'
    },
    {
      icon: Users, // Ícone mantido para representar relacionamentos
      colorTheme: colorStyles.orange,
      title: 'Relacionamento Afetivo',
      description: 'Um espaço neutro e acolhedor para melhorar a comunicação, mediar conflitos e fortalecer a conexão emocional e o respeito mútuo.'
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

        {/* Uso de Grid para alinhamento perfeito e mesma altura (items-stretch) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 items-stretch">
          {especialidades.map((esp, index) => (
            <div 
              key={index} 
              className={`bg-white p-8 lg:p-10 rounded-[2.5rem] shadow-lg border-t border-l border-r border-drica-dark/5 border-b-[8px] ${esp.colorTheme.border} hover:-translate-y-3 hover:shadow-2xl transition-all duration-500 group flex flex-col h-full`}
            >
              {/* Ícone com animação */}
              <div className={`w-16 h-16 rounded-2xl ${esp.colorTheme.bg} flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                <esp.icon className={`${esp.colorTheme.text} w-8 h-8`} />
              </div>
              
              {/* Título */}
              <h4 className="text-2xl font-bold mb-4 text-drica-dark">
                {esp.title}
              </h4>
              
              {/* flex-grow garante que o texto empurre o fundo do cartão preenchendo o espaço vazio */}
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