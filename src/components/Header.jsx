import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import logo from '../assets/icons/icon.png';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Início', href: '#' },
    { name: 'Sobre', href: '#sobre' },
    { name: 'Especialidades', href: '#especialidades' },
    { name: 'Abordagem', href: '#abordagem' },
    { name: 'Depoimentos', href: '#depoimentos' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Contato', href: '#contato' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
      
      {/* Announcement Bar */}
      <div className="w-full bg-drica-orange/10 text-center py-1.5 text-xs sm:text-sm font-medium text-drica-dark tracking-wide border-b border-drica-orange/5">
        Atendimento on-line para o Brasil e exterior | Presencial em Lorena e Guaratinguetá
      </div>

      {/* Main Header Content */}
      <div className={`max-w-7xl mx-auto px-6 flex justify-between items-center transition-all duration-300 ${scrolled ? 'py-3' : 'py-5'}`}>
        {/* Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <img src={logo} alt="Logo Dra. Adriana Catalani" className="h-10 sm:h-12 w-auto transition-transform group-hover:scale-105" />
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-drica-dark">Adriana Catalani</span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-drica-orange">Psicologia • Psicanálise</span>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href}
              className="text-sm font-bold text-drica-dark hover:text-drica-orange transition-colors"
            >
              {link.name}
            </a>
          ))}
          <a 
            href="#contato"
            className="bg-drica-orange text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-drica-dark transition-all shadow-md hover:shadow-lg"
          >
            Agendar Consulta
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="lg:hidden text-drica-dark"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <div className={`lg:hidden absolute top-full left-0 w-full bg-white shadow-2xl transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <nav className="flex flex-col p-6 gap-4">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-lg font-bold text-drica-dark border-b border-gray-100 pb-2"
            >
              {link.name}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}