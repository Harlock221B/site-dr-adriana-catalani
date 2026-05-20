import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Approach from './components/Approach';
import Specialties from './components/Specialties';
import QuotesDivider from './components/QuotesDivider';
import Testimonials from './components/Testimonials';
import ConsultorioBanner from './components/ConsultorioBanner';
import FAQ from './components/FAQ';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-drica-light font-sans text-drica-dark scroll-smooth selection:bg-drica-yellow selection:text-drica-dark flex flex-col overflow-x-hidden">
      <Helmet>
        <title>Dra. Adriana Catalani | Psicóloga e Psicanalista</title>
        <meta name="description" content="Consultório de psicologia e psicanálise da Dra. Adriana Catalani. Um espaço seguro, ético e acolhedor para cuidar da sua saúde emocional e autoconhecimento." />
      </Helmet>
      <Header />
      <Hero />
      <About />
      <Specialties />
      <QuotesDivider />
      <Approach />
      <Testimonials />
      <FAQ />
      <Footer />
    </div>
  );
}