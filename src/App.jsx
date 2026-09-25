import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { Analytics } from '@vercel/analytics/react';

const ProtectedRoute = lazy(() => import('./components/admin/ProtectedRoute'));
const ScheduleDashboard = lazy(() => import('./components/admin/ScheduleDashboard'));
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

function LandingPage() {
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
      <Analytics />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Site público institucional */}
          <Route path="/" element={<LandingPage />} />

          {/* Área restrita da agenda exclusiva da Dra. Adriana */}
          <Route
            path="/agenda"
            element={
              <Suspense
                fallback={
                  <div className="min-h-screen bg-drica-light flex items-center justify-center p-6">
                    <div className="w-10 h-10 border-4 border-drica-orange/30 border-t-drica-orange rounded-full animate-spin"></div>
                  </div>
                }
              >
                <ProtectedRoute>
                  <ScheduleDashboard />
                </ProtectedRoute>
              </Suspense>
            }
          />
          <Route
            path="/admin"
            element={
              <Suspense
                fallback={
                  <div className="min-h-screen bg-drica-light flex items-center justify-center p-6">
                    <div className="w-10 h-10 border-4 border-drica-orange/30 border-t-drica-orange rounded-full animate-spin"></div>
                  </div>
                }
              >
                <ProtectedRoute>
                  <ScheduleDashboard />
                </ProtectedRoute>
              </Suspense>
            }
          />

          {/* Redirecionar rotas inexistentes de volta ao início */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}