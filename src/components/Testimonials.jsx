import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { depoimentos } from '../data/testimonialsData';

export default function Testimonials() {
  const carouselRef = useRef(null);

  const scroll = (direction) => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      carouselRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const RenderStars = ({ count }) => (
    <div className="flex text-drica-yellow mb-3">
      {[...Array(count)].map((_, i) => (
        <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  return (
    <section id="depoimentos" className="bg-drica-light py-20 sm:py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 sm:mb-16 gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-drica-dark text-balance">
              O que dizem os pacientes
            </h3>
            <p className="font-light text-lg sm:text-xl lg:text-2xl text-drica-dark/70 text-pretty">
              Avaliações reais compartilhadas no Google
            </p>
          </div>
          
          <div className="flex gap-4 hidden md:flex">
            <button 
              onClick={() => scroll('left')} 
              className="p-4 rounded-full bg-white border border-drica-dark/10 text-drica-dark hover:bg-drica-orange hover:text-white hover:border-transparent transition-all duration-300 shadow-sm focus:outline-none"
              aria-label="Anterior"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={() => scroll('right')} 
              className="p-4 rounded-full bg-white border border-drica-dark/10 text-drica-dark hover:bg-drica-orange hover:text-white hover:border-transparent transition-all duration-300 shadow-sm focus:outline-none"
              aria-label="Próximo"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* AJUSTE AQUI: items-stretch faz os cards ficarem da mesma altura e o pb-16 dá respiro no rodapé */}
        <div 
          ref={carouselRef}
          className="flex items-stretch overflow-x-auto snap-x snap-mandatory gap-6 pb-16 pt-8 px-4 -mx-4 sm:mx-0 sm:px-0 hide-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style>{`
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {depoimentos.map((depoimento, index) => (
            <div 
              key={index} 
              /* AJUSTE AQUI: h-auto garante que o card cresça conforme o texto */
              className="snap-center shrink-0 w-[85vw] sm:w-[380px] lg:w-[420px] h-auto bg-white p-8 lg:p-10 rounded-[2.5rem] shadow-lg border border-drica-dark/5 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-drica-blue/10 rounded-bl-[100px] z-0"></div>

              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-14 h-14 bg-drica-orange/10 rounded-full flex items-center justify-center text-drica-orange font-bold text-2xl shrink-0">
                  {depoimento.nome.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-drica-dark text-base leading-tight">{depoimento.nome}</h4>
                  <p className="text-sm text-drica-dark/50 mt-1">{depoimento.tempo}</p>
                </div>
              </div>
              
              <div className="relative z-10">
                <RenderStars count={depoimento.estrelas} />
              </div>
              
              <p className="text-drica-dark/80 font-light text-base leading-relaxed flex-grow relative z-10">
                "{depoimento.texto}"
              </p>
              
              <div className="mt-8 pt-6 border-t border-drica-dark/5 flex items-center justify-between relative z-10">
                <span className="text-sm font-medium text-drica-dark/40">Postado no Google</span>
                <svg className="w-6 h-6 opacity-80" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}