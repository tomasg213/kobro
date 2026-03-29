"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { MessageSquare, Zap, Shield, Users, ArrowRight, CheckCircle } from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Kobro</span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/auth/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link 
                href="/auth/register"
                className="h-9 px-4 inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Comenzar
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Automatiza tus mensajes<br />
              <span className="text-primary">de WhatsApp</span>
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              La plataforma B2B para empresas que quieren comunicarse eficientemente con sus clientes, 
              enviar campañas automatizadas y validar pagos con OCR.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/auth/register"
                className="h-12 px-6 inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                Comenzar gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link 
                href="/auth/login"
                className="h-12 px-6 inline-flex items-center justify-center rounded-lg border border-border text-foreground font-medium hover:bg-gray-100 transition-colors"
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
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Todo lo que necesitás
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Herramientas completas para gestionar la comunicación con tus clientes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-border bg-gray-50">
              <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Mensajes Automatizados
              </h3>
              <p className="text-muted-foreground">
                Crea campañas promocionales y envía recordatorios automáticos a tus clientes en el momento justo.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-gray-50">
              <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Validación con OCR
              </h3>
              <p className="text-muted-foreground">
                Los clientes envían sus comprobantes y el sistema valida automáticamente los pagos usando OCR.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-gray-50">
              <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                CRM Integrado
              </h3>
              <p className="text-muted-foreground">
                Gestiona tus clientes, segmenándolos por etiquetas y manteniendo un historial completo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                ¿Por qué elegir Kobro?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Fácil de usar</p>
                    <p className="text-sm text-muted-foreground">Interfaz intuitiva que tu equipo adoptará rápidamente</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Integración con WhatsApp</p>
                    <p className="text-sm text-muted-foreground">Usa la API oficial de Meta para enviar mensajes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Validación inteligente</p>
                    <p className="text-sm text-muted-foreground">OCR que lee códigos de referencia automáticamente</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Seguro y confiable</p>
                    <p className="text-sm text-muted-foreground">Tus datos protegidos con las mejores prácticas</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-primary/10 rounded-2xl p-8 lg:p-12">
              <div className="text-center">
                <p className="text-5xl font-bold text-primary mb-2">100%</p>
                <p className="text-muted-foreground mb-6">Online y funcionando</p>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-foreground">+500</p>
                    <p className="text-sm text-muted-foreground">Mensajes enviados</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">+100</p>
                    <p className="text-sm text-muted-foreground">Clientes activos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Empezá hoy mismo
          </h2>
          <p className="text-primary-foreground/80 mb-8">
            Creá tu cuenta gratis y comenzá a automatizar tus mensajes en minutos.
          </p>
          <Link 
            href="/auth/register"
            className="h-12 px-8 inline-flex items-center justify-center rounded-lg bg-white text-primary font-medium hover:bg-gray-100 transition-colors"
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
              <div className="h-7 w-7 rounded bg-primary flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground">Kobro</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Kobro. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
