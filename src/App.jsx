import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Approach from './components/Approach';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-drica-light font-sans text-drica-dark scroll-smooth selection:bg-drica-yellow selection:text-drica-dark flex flex-col overflow-x-hidden">
      <Header />
      <Hero />
      <About />
      <Approach />
      <Testimonials />
      <Footer />
    </div>
  );
}