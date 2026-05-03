import React from 'react';
import { MessageCircle } from 'lucide-react';
import img1 from '../assets/imgs/Dr Adriana 1.jpeg';
import { whatsappLink } from '../utils/constants';

export default function Hero() {
  return (
    <section className="relative px-6 py-16 sm:py-24 lg:py-32 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full">
      
      {/* Lado Esquerdo - Textos e CTA */}
      <div className="space-y-8 z-10 text-center lg:text-left flex flex-col items-center lg:items-start">
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-drica-yellow/30 text-drica-dark text-xs sm:text-sm font-bold tracking-widest uppercase shadow-sm transition-transform hover:scale-105 cursor-default">
          <span className="w-2 h-2 rounded-full bg-drica-orange animate-pulse"></span>
          Psicologia e Psicanálise
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight text-balance">
          Um espaço para <span className="text-drica-orange relative inline-block group cursor-default">falar<span className="absolute -bottom-1 left-0 w-full h-2 md:h-3 bg-drica-orange/20 rounded-full transition-all duration-300 group-hover:h-4"></span></span>,<br/> 
          <span className="text-drica-blue relative inline-block group cursor-default">sentir<span className="absolute -bottom-1 left-0 w-full h-2 md:h-3 bg-drica-blue/20 rounded-full transition-all duration-300 group-hover:h-4"></span></span> e focar em você.
        </h1>
        
        <p className="text-lg sm:text-xl md:text-2xl font-light leading-relaxed max-w-2xl text-drica-dark/80 text-pretty">
          Em um ambiente de escuta acolhedora, caminhamos juntos para a compreensão e o cuidado com a sua saúde mental.
        </p>
        
        {/* Container do Botão com Efeito de Glow (Brilho) */}
        <div className="pt-4 w-full sm:w-auto relative group">
          <div className="absolute -inset-1 bg-drica-orange rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
          <a 
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="relative inline-flex items-center gap-3 bg-drica-orange text-drica-light px-8 py-5 sm:px-10 sm:py-6 rounded-full font-bold text-lg sm:text-xl hover:bg-drica-dark hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 w-full sm:w-auto justify-center"
          >
            <MessageCircle size={28} className="group-hover:rotate-12 transition-transform duration-300" />
            Falar com a Adriana
          </a>
        </div>
      </div>

      {/* Lado Direito - Imagem e Formas Bauhaus Animadas */}
      {/* O group/hero detecta o hover na área inteira para animar as formas juntas */}
      <div className="relative w-full h-[350px] sm:h-[450px] lg:h-[550px] flex items-center justify-center mt-12 lg:mt-0 group/hero">
        
        {/* Bola Amarela - Flutua e aumenta */}
        <div className="absolute w-56 h-56 sm:w-72 sm:h-72 bg-drica-yellow rounded-full mix-blend-multiply opacity-80 -top-4 sm:-top-8 right-0 sm:right-10 transition-transform duration-1000 ease-out group-hover/hero:scale-110 group-hover/hero:translate-x-2"></div>
        
        {/* Forma Azul - Rotaciona e sobe */}
        <div className="absolute w-40 h-40 sm:w-56 sm:h-56 bg-drica-blue rounded-tl-[100px] rounded-br-[100px] sm:rounded-tl-[120px] sm:rounded-br-[120px] -bottom-4 sm:-bottom-8 left-0 sm:left-10 mix-blend-multiply opacity-80 transition-transform duration-1000 ease-out group-hover/hero:-translate-y-4 group-hover/hero:-rotate-6"></div>
        
        {/* Wrapper da Imagem para manter as bordas perfeitamente redondas */}
        <div className="relative z-10 w-[85%] sm:w-3/4 lg:w-full max-w-md mx-auto h-full rounded-[2rem] sm:rounded-[3rem] border-4 sm:border-8 border-drica-light shadow-2xl overflow-hidden bg-drica-light/10">
          <img 
            src={img1} 
            alt="Adriana em sessão" 
            className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out hover:scale-105"
          />
        </div>
        
        {/* Aro Laranja - Rotaciona */}
        <div className="absolute w-24 h-24 sm:w-32 sm:h-32 border-[10px] sm:border-[16px] border-drica-orange rounded-full -bottom-6 sm:-bottom-10 right-4 sm:right-16 z-20 transition-transform duration-1000 ease-out group-hover/hero:scale-110 group-hover/hero:rotate-12"></div>
      </div>
      
    </section>
  );
}