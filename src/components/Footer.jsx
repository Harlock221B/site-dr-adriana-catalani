import React from 'react';
import { MessageCircle } from 'lucide-react';
import icon from '../assets/icons/icon.png';
import { whatsappLink } from '../utils/constants';

export default function Footer() {
  return (
    <footer id="contato" className="bg-drica-dark text-drica-light border-t-[4px] border-drica-orange relative overflow-hidden">
      {/* Decoração de fundo sutil */}
      <div className="absolute inset-0 bg-drica-yellow/5 skew-y-2 translate-y-1/2"></div>
      
      {/* Padding bem menor (py-10) para ficar mais fino */}
      <div className="max-w-7xl mx-auto px-6 py-10 sm:py-12 relative z-10">
        
        <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
          
          {/* Esquerda: Título Menor */}
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
              Vamos dar o próximo passo?
            </h2>
            <p className="font-light text-sm sm:text-base text-drica-light/80">
              A terapia é o maior investimento em si próprio.
            </p>
          </div>

          {/* Centro: Botão de Contato Reduzido */}
          <div>
            <a 
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-drica-yellow text-drica-dark px-6 py-3 rounded-full font-bold text-base hover:bg-white transition-all duration-300 hover:shadow-lg group whitespace-nowrap"
            >
              <MessageCircle size={20} className="transition-transform group-hover:scale-110" />
              Agendar Consulta
            </a>
          </div>

          {/* Direita: Logo e Credenciais */}
          <div className="flex flex-col items-center lg:items-end space-y-3 text-center lg:text-right lg:border-l border-drica-light/10 lg:pl-8">
            <div className="flex items-center gap-2 opacity-90">
              <img src={icon} alt="Ícone Dra Adriana" className="h-7 sm:h-8 w-auto object-contain" />
              <span className="text-lg font-black tracking-tight">Dra. Adriana</span>
            </div>
            <div className="text-xs text-drica-light/60 font-medium">
              <p>Psicóloga e Psicanalista | CRP 06/XXXXXX</p>
              <p>© {new Date().getFullYear()} Adriana Catalani.</p>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}