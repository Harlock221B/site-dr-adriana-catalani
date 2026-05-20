import React from 'react';
import img2 from '../assets/imgs/Dr Adriana 2.jpeg'; // Fotografia principal (Poltrona / Sorrindo)
import img3 from '../assets/imgs/Dr Adriana 3.jpeg'; // Consultório
import novaFotoSeria from '../assets/imgs/Dr Adriana 4.jpeg'; // <-- NOVA FOTOGRAFIA (Expressão mais séria)

export default function About() {
  return (
    <section id="sobre" className="bg-drica-dark text-drica-light py-16 sm:py-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full bg-drica-orange/5 mix-blend-screen skew-x-12 translate-x-10 lg:translate-x-20"></div>
      
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
        
        {/* Lado Esquerdo: Imagens com animação de hover */}
        <div className="order-2 lg:order-1 relative mx-auto w-full max-w-sm lg:max-w-md mt-8 lg:mt-0 group">
          
          {/* FOTOGRAFIA PRINCIPAL (POLTRONA) */}
          <img 
            src={img2} 
            alt="Adriana Catalani" 
            className="w-full aspect-[4/5] object-cover object-center bg-drica-light/10 rounded-[2.5rem] lg:rounded-[3rem] rounded-tr-none border border-drica-orange shadow-2xl relative z-10 transition-transform duration-700 ease-in-out group-hover:scale-[1.02]"
          />
          
          {/* FOTOGRAFIA DA BOLINHA (EXPRESSÃO MAIS SÉRIA) */}
          <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 w-28 h-28 sm:w-36 sm:h-36 bg-drica-orange rounded-full p-1.5 shadow-2xl z-20 transition-transform duration-700 ease-in-out group-hover:-translate-y-2 group-hover:-translate-x-2 group-hover:scale-105">
            <img 
              src={novaFotoSeria} 
              alt="Adriana Catalani - Expressão séria" 
              className="w-full h-full object-cover object-center rounded-full"
            />
          </div>
        </div>
        
        {/* Lado Direito: Textos e Imagem Inferior */}
        <div className="order-1 lg:order-2 space-y-6 text-left flex flex-col items-start">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight uppercase">
            Sobre Mim
          </h2>
          
          <div className="space-y-4 text-base sm:text-lg font-light text-drica-light/80 leading-relaxed text-pretty">
            <p>
              Acredito que cada pessoa carrega uma história, dores silenciosas, inseguranças, medos e também desejos de mudança que muitas vezes nunca conseguiram ser realmente acolhidos.
            </p>
            <p>
              Foi essa percepção que me aproximou da Psicologia e da escuta clínica.
            </p>

            {/* Respiro no texto */}
            <div className="py-4 opacity-50">
               <div className="h-px w-20 bg-drica-orange"></div>
            </div>

            <p>
              Depois de muitos anos atuando em empresas multinacionais, escolhi seguir um caminho mais conectado ao meu propósito: oferecer um espaço seguro, humano e acolhedor para pessoas que desejam compreender a si mesmas com mais profundidade e leveza.
            </p>
            <p>
              Atendo desde 2013 e, ao longo dessa trajetória, acompanhei histórias de ansiedade, luto, dores emocionais, sobrecarga, dificuldades nos relacionamentos, autoestima fragilizada e processos de autoconhecimento. Cada encontro reforça aquilo em que acredito: <strong>ninguém deveria atravessar sua dor sozinho.</strong>
            </p>
            <p>
              Sou Psicóloga, com especialização em Psicanálise, e conduzo meu trabalho com sensibilidade, ética e presença verdadeira.
            </p>
            <p>
              Além da atuação clínica, também sou mãe — experiência que ampliou ainda mais meu olhar sobre cuidado, vínculos e as complexidades da vida emocional.
            </p>
          </div>
        </div>
        
      </div>
    </section>
  );
}