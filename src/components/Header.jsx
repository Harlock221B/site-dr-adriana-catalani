import React from 'react';
import { ArrowRight } from 'lucide-react';
import icon from '../assets/icons/icon.png';
import { whatsappLink } from '../utils/constants';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-drica-light/85 backdrop-blur-xl border-b border-drica-dark/5 shadow-sm">
      <div className="px-6 py-4 lg:py-5 max-w-screen-2xl mx-auto flex justify-between items-center relative">
        
        {/* Nova Área do Logo: Ícone + Texto */}
        <a href="#" className="flex items-center gap-3 group z-10">
          <img 
            src={icon} 
            alt="Ícone Adriana Catalani" 
            className="h-10 sm:h-12 lg:h-14 w-auto object-contain transition-transform duration-500 group-hover:scale-110 origin-center drop-shadow-sm"
          />
          <span className="text-xl sm:text-2xl font-black text-drica-dark tracking-tight">
            Adriana Catalani
          </span>
        </a>

        {/* Navegação e Botão (Escondido em telas muito pequenas, visível em Desktop) */}
        <div className="hidden lg:flex items-center gap-8">
          <nav className="flex items-center gap-2 bg-white/60 px-4 py-2.5 rounded-full border border-drica-dark/5 shadow-inner backdrop-blur-sm">
            {[
              { label: 'Sobre', href: '#sobre' },
              { label: 'A Abordagem', href: '#abordagem' },
              { label: 'Depoimentos', href: '#depoimentos' },
              { label: 'Contato', href: '#contato' },
            ].map((link) => (
              <a 
                key={link.label} 
                href={link.href} 
                className="relative px-6 py-2 text-base font-medium tracking-wide hover:text-drica-orange transition-colors duration-300 group"
              >
                {link.label}
                <span className="absolute bottom-1 left-6 right-6 h-[2px] bg-drica-orange transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center rounded-full"></span>
              </a>
            ))}
          </nav>

          <a 
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-drica-dark text-drica-light px-8 py-3.5 rounded-full text-base font-bold hover:bg-drica-orange transition-all duration-300 hover:shadow-xl hover:shadow-drica-orange/20 hover:-translate-y-1 active:translate-y-0"
          >
            Agendar Sessão
            <ArrowRight size={20} />
          </a>
        </div>
        
        {/* Botão Mobile Simples (Aparece apenas no celular) */}
        <div className="lg:hidden flex items-center">
           <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="bg-drica-orange text-white px-5 py-2 rounded-full font-bold text-sm shadow-md">
             Agendar
           </a>
        </div>
      </div>
    </header>
  );
}