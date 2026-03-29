"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Zap, Shield, Users, ArrowRight, CheckCircle, MessageSquare } from "lucide-react";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, []);

  if (!mounted) {
    return null;
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a3a2a]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a8d5a8] mx-auto mb-4" />
          <p className="text-white/60">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a3a2a]">
      {/* Header */}
      <header className="bg-[#0d261a] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="Kobro" className="h-10 w-10" />
              <span className="text-xl font-bold text-white">Kobro</span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/auth/login"
                className="text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link 
                href="/auth/register"
                className="h-9 px-4 inline-flex items-center justify-center rounded-lg bg-[#a8d5a8] text-[#0d261a] text-sm font-semibold hover:bg-[#8fbc8f] transition-colors"
              >
                Comenzar
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d261a] via-[#1a3a2a] to-[#1a3a2a]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#a8d5a8]/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <img src="/logo-with-bg.svg" alt="Kobro" className="h-24 w-auto mx-auto mb-8" />
            
            <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Automatiza tus mensajes<br />
              <span className="text-[#a8d5a8]">de WhatsApp</span>
            </h1>
            <p className="text-lg lg:text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              La plataforma B2B para empresas que quieren comunicarse eficientemente con sus clientes, 
              enviar campañas automatizadas y validar pagos con OCR.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/auth/register"
                className="h-12 px-6 inline-flex items-center justify-center rounded-lg bg-[#a8d5a8] text-[#0d261a] font-semibold hover:bg-[#8fbc8f] transition-colors"
              >
                Comenzar gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link 
                href="/auth/login"
                className="h-12 px-6 inline-flex items-center justify-center rounded-lg border border-white/20 text-white font-medium hover:bg-white/10 transition-colors"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-[#0d261a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Todo lo que necesitás
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Herramientas completas para gestionar la comunicación con tus clientes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-[#a8d5a8]/20 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-[#a8d5a8]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Mensajes Automatizados
              </h3>
              <p className="text-white/60">
                Crea campañas promocionales y envía recordatorios automáticos a tus clientes en el momento justo.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-[#a8d5a8]/20 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-[#a8d5a8]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Validación con OCR
              </h3>
              <p className="text-white/60">
                Los clientes envían sus comprobantes y el sistema valida automáticamente los pagos usando OCR.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-[#a8d5a8]/20 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-[#a8d5a8]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                CRM Integrado
              </h3>
              <p className="text-white/60">
                Gestiona tus clientes, segmenándolos por etiquetas y manteniendo un historial completo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-[#1a3a2a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">
                ¿Por qué elegir Kobro?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#a8d5a8] mt-0.5" />
                  <div>
                    <p className="font-medium text-white">Fácil de usar</p>
                    <p className="text-sm text-white/60">Interfaz intuitiva que tu equipo adoptará rápidamente</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#a8d5a8] mt-0.5" />
                  <div>
                    <p className="font-medium text-white">Integración con WhatsApp</p>
                    <p className="text-sm text-white/60">Usa la API oficial de Meta para enviar mensajes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#a8d5a8] mt-0.5" />
                  <div>
                    <p className="font-medium text-white">Validación inteligente</p>
                    <p className="text-sm text-white/60">OCR que lee códigos de referencia automáticamente</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#a8d5a8] mt-0.5" />
                  <div>
                    <p className="font-medium text-white">Seguro y confiable</p>
                    <p className="text-sm text-white/60">Tus datos protegidos con las mejores prácticas</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[#a8d5a8]/10 rounded-2xl p-8 lg:p-12 border border-[#a8d5a8]/20">
              <div className="text-center">
                <p className="text-5xl font-bold text-[#a8d5a8] mb-2">100%</p>
                <p className="text-white/60 mb-6">Online y funcionando</p>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-white">+500</p>
                    <p className="text-sm text-white/60">Mensajes enviados</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">+100</p>
                    <p className="text-sm text-white/60">Clientes activos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#a8d5a8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-[#0d261a] mb-4">
            Empezá hoy mismo
          </h2>
          <p className="text-[#0d261a]/70 mb-8">
            Creá tu cuenta gratis y comenzá a automatizar tus mensajes en minutos.
          </p>
          <Link 
            href="/auth/register"
            className="h-12 px-8 inline-flex items-center justify-center rounded-lg bg-[#0d261a] text-[#a8d5a8] font-semibold hover:bg-[#0a1f12] transition-colors"
          >
            Crear cuenta gratuita
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-[#0d261a] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="Kobro" className="h-6 w-6" />
              <span className="text-sm font-medium text-white">Kobro</span>
            </div>
            <p className="text-sm text-white/50">
              © 2024 Kobro. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
