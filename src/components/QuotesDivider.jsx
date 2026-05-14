import React from 'react';

export default function QuotesDivider() {
  const frases = [
    "Você não precisa carregar tudo sozinha(o)",
    "Sua dor merece ser escutada",
    "Nem sempre é fácil pedir ajuda",
    "A terapia pode ser um recomeço"
  ];

  return (
    <section className="bg-drica-orange py-16 sm:py-24 overflow-hidden relative">
      {/* Fundo sutil */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/20">
          {frases.map((frase, index) => (
            <div key={index} className="px-6 py-4 md:py-0 flex items-center justify-center">
              <p className="text-white font-medium text-xl sm:text-2xl leading-tight text-balance">
                "{frase}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}