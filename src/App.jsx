import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Approach from './components/Approach';
import Specialties from './components/Specialties';
import Testimonials from './components/Testimonials';
import QuotesDivider from './components/QuotesDivider';
import FAQ from './components/FAQ';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-drica-light font-sans text-drica-dark scroll-smooth selection:bg-drica-yellow selection:text-drica-dark flex flex-col overflow-x-hidden">
      <Helmet>
        <title>Dra. Adriana Catalani | Psicóloga e Psicanalista</title>
        <meta name="description" content="Consultório de psicologia e psicanálise da Dra. Adriana Catalani. Um espaço seguro, ético e acolhedor para cuidar da sua saúde emocional e autoconhecimento." />
        <meta name="keywords" content="Psicóloga, Psicanalista, Terapia, Saúde Mental, Autoconhecimento, Psicologia, Adriana Catalani, Terapia Online, Terapia Presencial" />
        <meta property="og:title" content="Dra. Adriana Catalani | Psicologia e Psicanálise" />
        <meta property="og:description" content="Um espaço seguro, ético e acolhedor para cuidar da sua saúde emocional e autoconhecimento." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.adrianacatalani.com.br" />
      </Helmet>
      <Header />
      <Hero />
      <About />
      <Specialties />
      <Approach />
      <Testimonials />
      <FAQ />
      <QuotesDivider />
      <Footer />
    </div>
  );
} 