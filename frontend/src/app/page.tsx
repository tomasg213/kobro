"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Zap, Shield, Users, ArrowRight, CheckCircle } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push("/dashboard");
      }
    };
    checkAuth();
  }, [router]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#4a7c59] flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <span className="text-xl font-bold text-[#1a3a2a]">Kobro</span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/auth/login"
                className="text-sm font-medium text-[#4a7c59] hover:text-[#3a6347] transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link 
                href="/auth/register"
                className="h-9 px-4 inline-flex items-center justify-center rounded-lg bg-[#4a7c59] text-white text-sm font-semibold hover:bg-[#3a6347] transition-colors"
              >
                Comenzar
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-32 bg-gradient-to-b from-white to-[#f0f7f4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-6xl font-bold text-[#1a3a2a] leading-tight mb-6">
              Automatiza tus mensajes<br />
              <span className="text-[#4a7c59]">de WhatsApp</span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              La plataforma B2B para empresas que quieren comunicarse eficientemente con sus clientes, 
              enviar campañas automatizadas y validar pagos con OCR.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/auth/register"
                className="h-12 px-6 inline-flex items-center justify-center rounded-lg bg-[#4a7c59] text-white font-semibold hover:bg-[#3a6347] transition-colors"
              >
                Comenzar gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link 
                href="/auth/login"
                className="h-12 px-6 inline-flex items-center justify-center rounded-lg border-2 border-[#4a7c59] text-[#4a7c59] font-semibold hover:bg-[#f0f7f4] transition-colors"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#1a3a2a] mb-4">
              Todo lo que necesitás
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Herramientas completas para gestionar la comunicación con tus clientes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-gray-200 bg-[#f8fbf9] hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-[#4a7c59]/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-[#4a7c59]" />
              </div>
              <h3 className="text-xl font-semibold text-[#1a3a2a] mb-2">
                Mensajes Automatizados
              </h3>
              <p className="text-gray-600">
                Crea campañas promocionales y envía recordatorios automáticos a tus clientes en el momento justo.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 bg-[#f8fbf9] hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-[#4a7c59]/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-[#4a7c59]" />
              </div>
              <h3 className="text-xl font-semibold text-[#1a3a2a] mb-2">
                Validación con OCR
              </h3>
              <p className="text-gray-600">
                Los clientes envían sus comprobantes y el sistema valida automáticamente los pagos usando OCR.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 bg-[#f8fbf9] hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-[#4a7c59]/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-[#4a7c59]" />
              </div>
              <h3 className="text-xl font-semibold text-[#1a3a2a] mb-2">
                CRM Integrado
              </h3>
              <p className="text-gray-600">
                Gestiona tus clientes, segmenándolos por etiquetas y manteniendo un historial completo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-[#f8fbf9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#1a3a2a] mb-6">
                ¿Por qué elegir Kobro?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#4a7c59] mt-0.5" />
                  <div>
                    <p className="font-medium text-[#1a3a2a]">Fácil de usar</p>
                    <p className="text-sm text-gray-600">Interfaz intuitiva que tu equipo adoptará rápidamente</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#4a7c59] mt-0.5" />
                  <div>
                    <p className="font-medium text-[#1a3a2a]">Integración con WhatsApp</p>
                    <p className="text-sm text-gray-600">Usa la API oficial de Meta para enviar mensajes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#4a7c59] mt-0.5" />
                  <div>
                    <p className="font-medium text-[#1a3a2a]">Validación inteligente</p>
                    <p className="text-sm text-gray-600">OCR que lee códigos de referencia automáticamente</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#4a7c59] mt-0.5" />
                  <div>
                    <p className="font-medium text-[#1a3a2a]">Seguro y confiable</p>
                    <p className="text-sm text-gray-600">Tus datos protegidos con las mejores prácticas</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 lg:p-12 border border-gray-200 shadow-sm">
              <div className="text-center">
                <p className="text-5xl font-bold text-[#4a7c59] mb-2">100%</p>
                <p className="text-gray-600 mb-6">Online y funcionando</p>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-[#1a3a2a]">+500</p>
                    <p className="text-sm text-gray-600">Mensajes enviados</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1a3a2a]">+100</p>
                    <p className="text-sm text-gray-600">Clientes activos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#4a7c59]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Empezá hoy mismo
          </h2>
          <p className="text-white/80 mb-8">
            Creá tu cuenta gratis y comenzá a automatizar tus mensajes en minutos.
          </p>
          <Link 
            href="/auth/register"
            className="h-12 px-8 inline-flex items-center justify-center rounded-lg bg-white text-[#4a7c59] font-semibold hover:bg-gray-100 transition-colors"
          >
            Crear cuenta gratuita
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded bg-[#4a7c59] flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="text-sm font-medium text-[#1a3a2a]">Kobro</span>
            </div>
            <p className="text-sm text-gray-500">
              © 2024 Kobro. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
