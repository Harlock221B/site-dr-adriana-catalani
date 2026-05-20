import React from 'react';
import { MessageCircle } from 'lucide-react'; 
import { FaInstagram } from 'react-icons/fa'; // Importação do ícone do Instagram
import icon from '../assets/icons/icon.png';
import { whatsappLink } from '../utils/constants';

export default function Footer() {
  return (
    <footer id="contato" className="bg-drica-dark text-drica-light border-t-[4px] border-drica-orange relative overflow-hidden">
      <div className="absolute inset-0 bg-drica-yellow/5 skew-y-2 translate-y-1/2"></div>
      
      <div className="max-w-7xl mx-auto px-6 py-10 sm:py-12 relative z-10">
        
        <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
          
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
              Vamos dar o próximo passo?
            </h2>
            <p className="font-light text-sm sm:text-base text-drica-light/80">
              A terapia é o maior investimento em si próprio.
            </p>
          </div>

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

          <div className="flex flex-col items-center lg:items-end space-y-3 text-center lg:text-right lg:border-l border-drica-light/10 lg:pl-8">
            <div className="flex items-center gap-2 opacity-90">
              <img src={icon} alt="Ícone Adriana Catalani" className="h-7 sm:h-8 w-auto object-contain" />
              {/* Nome da marca simplificado */}
              <span className="text-lg font-black tracking-tight">Adriana Catalani</span>
            </div>
            
            <div className="text-xs text-drica-light/80 font-medium space-y-1.5">
              <p>Psicóloga e Psicanalista | CRP: 06/220435</p>
              <p>WhatsApp: (19) 99745-9295</p>
              <p>Atendimento online e presencial em Guaratinguetá e Lorena</p>
              <div>
                <a 
                  href="https://instagram.com/adriana_barbosa_catalani" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center justify-center lg:justify-end gap-1.5 hover:text-drica-orange transition-colors duration-300"
                >
                  <FaInstagram size={16} />
                  @adriana_barbosa_catalani
                </a>
              </div>
              <p className="pt-2 opacity-50 text-drica-light/50">© {new Date().getFullYear()} Adriana Catalani.</p>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}