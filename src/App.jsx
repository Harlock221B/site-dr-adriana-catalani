import React from 'react';
import { MessageCircle, Heart, Brain, Sun, User, ArrowRight } from 'lucide-react';

// Importação das Imagens Locais
import logoOriginal from './assets/icons/logos_vetor_logo_original.png';
import logoNegativo from './assets/icons/logos_vetor_logo_negativo.png';

export default function App() {
  const whatsappNumber = "5519997459295";
  const whatsappMsg = encodeURIComponent("Olá, Adriana! Gostaria de saber mais sobre as sessões de terapia.");
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMsg}`;

  const heroImageUrl = "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";

  return (
    <div className="min-h-screen bg-drica-light font-sans text-drica-dark scroll-smooth selection:bg-drica-yellow selection:text-drica-dark flex flex-col overflow-x-hidden">
      
      {/* 1. HEADER (Menu com Logo em Destaque Absoluto) */}
      <header className="sticky top-0 z-50 bg-drica-light/85 backdrop-blur-xl border-b border-drica-dark/5 shadow-sm">
        <div className="px-6 py-4 lg:py-6 max-w-screen-2xl mx-auto flex justify-between items-center relative">
          
          {/* Logo muito maior e com mais "respiro" */}
          <a href="#" className="flex items-center group z-10">
            <img 
              src={logoOriginal} 
              alt="Logo Adriana Catalani" 
              className="h-20 sm:h-24 lg:h-32 w-auto object-contain transition-transform duration-500 group-hover:scale-105 origin-left drop-shadow-sm"
            />
          </a>

          {/* Navegação e Botão */}
          <div className="hidden lg:flex items-center gap-8">
            <nav className="flex items-center gap-2 bg-white/60 px-4 py-2.5 rounded-full border border-drica-dark/5 shadow-inner backdrop-blur-sm">
              {[
                { label: 'Sobre', href: '#sobre' },
                { label: 'A Abordagem', href: '#abordagem' },
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
              className="flex items-center gap-3 bg-drica-dark text-drica-light px-8 py-4 rounded-full text-base font-bold hover:bg-drica-orange transition-all duration-300 hover:shadow-xl hover:shadow-drica-orange/20 hover:-translate-y-1 active:translate-y-0"
            >
              Agendar Sessão
              <ArrowRight size={20} />
            </a>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION (Responsividade Orgânica) */}
      <section className="relative px-6 py-16 sm:py-24 lg:py-32 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full">
        <div className="space-y-8 z-10 text-center lg:text-left flex flex-col items-center lg:items-start">
          
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-drica-yellow/30 text-drica-dark text-xs sm:text-sm font-bold tracking-widest uppercase shadow-sm">
            <span className="w-2 h-2 rounded-full bg-drica-orange animate-pulse"></span>
            Psicologia e Psicanálise
          </div>
          
          {/* Título fluido usando text-balance para quebras naturais */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight text-balance">
            Um espaço para <span className="text-drica-orange relative inline-block">falar<span className="absolute -bottom-1 left-0 w-full h-2 md:h-3 bg-drica-orange/20 rounded-full"></span></span>,<br/> 
            <span className="text-drica-blue relative inline-block">sentir<span className="absolute -bottom-1 left-0 w-full h-2 md:h-3 bg-drica-blue/20 rounded-full"></span></span> e focar em você.
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl font-light leading-relaxed max-w-2xl text-drica-dark/80 text-pretty">
            Em um ambiente de escuta acolhedora, caminhamos juntos para a compreensão e o cuidado com a sua saúde mental.
          </p>
          
          <div className="pt-4">
            <a 
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-drica-orange text-drica-light px-8 py-5 sm:px-10 sm:py-6 rounded-full font-bold text-lg sm:text-xl hover:bg-drica-dark hover:-translate-y-1 hover:shadow-2xl hover:shadow-drica-orange/30 transition-all duration-300 w-full sm:w-auto justify-center group"
            >
              <MessageCircle size={28} className="group-hover:rotate-12 transition-transform" />
              Falar com a Adriana
            </a>
          </div>
        </div>

        {/* Imagem com Bauhaus */}
        <div className="relative w-full h-[350px] sm:h-[450px] lg:h-[550px] flex items-center justify-center mt-12 lg:mt-0">
          <div className="absolute w-56 h-56 sm:w-72 sm:h-72 bg-drica-yellow rounded-full mix-blend-multiply opacity-80 -top-4 sm:-top-8 right-0 sm:right-10 transition-all duration-1000"></div>
          <div className="absolute w-40 h-40 sm:w-56 sm:h-56 bg-drica-blue rounded-tl-[100px] rounded-br-[100px] sm:rounded-tl-[120px] sm:rounded-br-[120px] -bottom-4 sm:-bottom-8 left-0 sm:left-10 mix-blend-multiply opacity-80"></div>
          
          <img 
            src={heroImageUrl} 
            alt="Adriana em sessão" 
            className="relative z-10 w-[85%] sm:w-3/4 lg:w-full max-w-md mx-auto rounded-[2rem] sm:rounded-[3rem] object-cover shadow-2xl border-4 sm:border-8 border-drica-light h-full"
          />
          
          <div className="absolute w-24 h-24 sm:w-32 sm:h-32 border-[10px] sm:border-[16px] border-drica-orange rounded-full -bottom-6 sm:-bottom-10 right-4 sm:right-16 z-20"></div>
        </div>
      </section>

      {/* 3. SOBRE A ADRIANA */}
      <section id="sobre" className="bg-drica-dark text-drica-light py-20 sm:py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full bg-drica-orange/5 mix-blend-screen skew-x-12 translate-x-10 lg:translate-x-20"></div>
        
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
          <div className="order-2 lg:order-1 relative mx-auto w-full max-w-sm lg:max-w-md">
            <div className="w-full aspect-square bg-drica-light/10 rounded-[3rem] lg:rounded-[4rem] rounded-tr-none border border-drica-light/20 flex items-center justify-center p-8 sm:p-12 shadow-2xl">
               <User size={100} className="text-drica-yellow opacity-40 sm:w-32 sm:h-32" />
            </div>
            <div className="absolute -bottom-6 -right-6 sm:-bottom-8 sm:-right-8 w-24 h-24 sm:w-28 sm:h-28 bg-drica-orange rounded-full flex items-center justify-center shadow-xl">
              <Sun className="text-drica-light w-10 h-10 sm:w-12 sm:h-12" />
            </div>
          </div>
          
          <div className="order-1 lg:order-2 space-y-6 sm:space-y-8 text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance leading-tight">
              A luz que guia o processo.
            </h2>
            <div className="space-y-4 sm:space-y-6 text-base sm:text-lg lg:text-xl font-light text-drica-light/80 leading-relaxed text-pretty">
              <p>
                Inspirada pelo conceito de uma luminária de mesa, a minha prática procura trazer foco para os seus sentimentos. Acredito que a terapia é o ambiente seguro onde podemos direcionar a luz para as questões que precisam ser vistas e compreendidas.
              </p>
              <p>
                Trabalho com psicanálise integrativa, utilizando a escuta ativa para construir um espaço livre de julgamentos, onde você é o centro da sua própria jornada de cura e autoconhecimento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. A ABORDAGEM */}
      <section id="abordagem" className="bg-white py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 sm:mb-24">
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-drica-dark text-balance">
              Os Pilares do Atendimento
            </h3>
            <p className="font-light text-lg sm:text-xl lg:text-2xl text-drica-dark/70 max-w-3xl mx-auto text-pretty leading-relaxed">
              Uma estrutura baseada na escola da Bauhaus: funcional, clara e focada no essencial para o seu bem-estar emocional.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {[
              { icon: Heart, color: 'yellow', title: 'Acolhimento', text: 'O primeiro passo é criar um laço de confiança. Uma escuta ativa e empática, construindo o ambiente seguro fundamental para a terapia.' },
              { icon: Brain, color: 'blue', title: 'Análise', text: 'Através das ferramentas da psicanálise, investigamos juntos as raízes dos seus sentimentos e padrões de comportamento profundos.' },
              { icon: Sun, color: 'orange', title: 'Clareza', text: 'A luz da luminária. Direcionamos a atenção para o que realmente importa, promovendo clareza mental e autonomia emocional.' }
            ].map((pilar) => (
              <div key={pilar.title} className="group p-8 sm:p-10 lg:p-12 bg-drica-light rounded-[2.5rem] border-b-[8px] sm:border-b-[12px] transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl relative overflow-hidden flex flex-col items-center sm:items-start text-center sm:text-left" style={{ borderColor: `var(--color-drica-${pilar.color})` }}>
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-drica-${pilar.color}/20 flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-500`}>
                  <pilar.icon className={`text-drica-${pilar.color} w-8 h-8 sm:w-10 sm:h-10`} />
                </div>
                <h4 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">{pilar.title}</h4>
                <p className="font-light text-base sm:text-lg text-drica-dark/80 leading-relaxed text-pretty">
                  {pilar.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer id="contato" className="bg-drica-dark text-drica-light border-t-[8px] sm:border-t-[12px] border-drica-orange relative overflow-hidden">
        <div className="absolute inset-0 bg-drica-yellow/5 skew-y-6 translate-y-20"></div>
        <div className="max-w-7xl mx-auto px-6 py-16 sm:py-24 lg:py-32 relative z-10">
          <div className="grid lg:grid-cols-[2fr,1fr] gap-12 lg:gap-16 items-center">
            
            <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-balance">
                Vamos dar o próximo passo juntos?
              </h2>
              <p className="font-light text-lg sm:text-xl lg:text-2xl text-drica-light/80 max-w-2xl mx-auto lg:mx-0 leading-relaxed text-pretty">
                A terapia é o maior investimento que pode fazer em si próprio. Entre em contacto para tirar dúvidas ou agendar a sua sessão.
              </p>
              <div className="pt-4 flex justify-center lg:justify-start">
                <a 
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 sm:gap-4 bg-drica-yellow text-drica-dark px-8 py-5 sm:px-10 sm:py-6 rounded-2xl sm:rounded-3xl font-black text-lg sm:text-xl lg:text-2xl hover:bg-white transition-all duration-300 hover:shadow-xl group w-full sm:w-auto"
                >
                  <MessageCircle size={28} className="sm:w-8 sm:h-8 transition-transform group-hover:scale-110" />
                  (19) 99745-9295
                </a>
              </div>
            </div>

            <div className="flex flex-col items-center lg:items-end space-y-6 lg:space-y-8 text-center lg:text-right lg:border-r-2 border-drica-light/10 lg:pr-8 py-4">
              <img 
                src={logoNegativo} 
                alt="Adriana Catalani Logo Negativo" 
                className="h-20 sm:h-24 lg:h-28 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
              />
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-drica-light/60 font-medium">
                <p>Psicóloga e Psicanalista | CRP 06/XXXXXX</p>
                <p>© {new Date().getFullYear()} Adriana Catalani.</p>
              </div>
            </div>

          </div>
        </div>
      </footer>
      
    </div>
  );
}