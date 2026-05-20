import React from 'react';

export default function QuotesDivider() {
  const frases = [
    "Você não precisa carregar tudo sozinha/o",
    "Sua dor merece ser escutada",
    "Nem sempre é fácil pedir ajuda",
    "A terapia pode ser um recomeço"
  ];

  return (
    <section className="bg-drica-orange text-drica-light py-12 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-4 items-center">
          {frases.map((frase, index) => (
            <div key={index} className="text-center px-4">
              <p className="italic text-lg sm:text-xl font-light leading-relaxed text-balance">
                "{frase}"
              </p>
              {/* Divisor sutil para mobile entre frases */}
              {index !== frases.length - 1 && (
                <div className="w-12 h-px bg-drica-light/30 mx-auto mt-8 md:hidden"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}