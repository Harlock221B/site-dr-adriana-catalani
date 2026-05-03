import React from 'react';
import img2 from '../assets/imgs/Dr Adriana 2.jpeg';
import img3 from '../assets/imgs/Dr Adriana 3.jpeg';
import img4 from '../assets/imgs/Dr Adriana 4.jpeg';

export default function About() {
  return (
    <section id="sobre" className="bg-drica-dark text-drica-light py-16 sm:py-24 relative overflow-hidden">
      {/* Fundo decorativo */}
      <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full bg-drica-orange/5 mix-blend-screen skew-x-12 translate-x-10 lg:translate-x-20"></div>
      
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
        
        {/* Lado Esquerdo: Imagens com animação de hover */}
        <div className="order-2 lg:order-1 relative mx-auto w-full max-w-sm lg:max-w-md mt-8 lg:mt-0 group">
          
          <img 
            src={img2} 
            alt="Dra Adriana Catalani" 
            className="w-full aspect-[4/5] object-cover object-center bg-drica-light/10 rounded-[2.5rem] lg:rounded-[3rem] rounded-tr-none border border-drica-light/20 shadow-2xl relative z-10 transition-transform duration-700 ease-in-out group-hover:scale-[1.02]"
          />
          
          <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 w-28 h-28 sm:w-36 sm:h-36 bg-drica-orange rounded-full p-1.5 shadow-2xl z-20 transition-transform duration-700 ease-in-out group-hover:-translate-y-2 group-hover:-translate-x-2 group-hover:scale-105">
            <img 
              src={img4} 
              alt="Detalhe consultório" 
              className="w-full h-full object-cover object-center rounded-full"
            />
          </div>
        </div>
        
        {/* Lado Direito: Textos e Imagem Inferior */}
        <div className="order-1 lg:order-2 space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance leading-tight">
            A luz que guia o processo.
          </h2>
          
          <div className="space-y-4 text-base sm:text-lg font-light text-drica-light/80 leading-relaxed text-pretty">
            <p>
              Inspirada pelo conceito de uma luminária de mesa, a minha prática procura trazer foco para os seus sentimentos. Acredito que a terapia é o ambiente seguro onde podemos direcionar a luz para as questões que precisam ser vistas e compreendidas.
            </p>
            <p>
              Trabalho com psicanálise integrativa, utilizando a escuta ativa para construir um espaço livre de julgamentos, onde você é o centro da sua própria jornada de cura e autoconhecimento.
            </p>
          </div>
          
          {/* CORREÇÃO DEFINITIVA: Div externa pro espaçamento (pt-6) e div interna como máscara redonda */}
          <div className="pt-6 w-full">
            <div className="overflow-hidden rounded-2xl sm:rounded-[2rem] shadow-lg border border-drica-light/10">
              <img 
                src={img3} 
                alt="Ambiente do consultório" 
                className="w-full h-48 sm:h-64 object-cover object-center opacity-90 transition-all duration-700 ease-in-out hover:opacity-100 hover:scale-105"
              />
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
}