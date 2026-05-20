import React from 'react';
import img3 from '../assets/imgs/Dr Adriana 3.jpeg'; // Foto do consultório

export default function ConsultorioBanner() {
  return (
    <section className="bg-drica-light pb-20 sm:pb-32 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden shadow-2xl border-[8px] border-white relative group">
          <img 
            src={img3} 
            alt="Ambiente acolhedor do consultório da Dra. Adriana Catalani" 
            className="w-full h-64 sm:h-80 lg:h-[450px] object-cover object-center transition-transform duration-700 ease-in-out group-hover:scale-105"
          />
          {/* Uma leve camada escura apenas para dar um toque sofisticado na borda */}
          <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-[2rem] sm:rounded-[2.5rem] pointer-events-none"></div>
        </div>
      </div>
    </section>
  );
}