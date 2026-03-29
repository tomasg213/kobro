"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Zap, Shield, Users } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("fetch") || error.message.includes("network")) {
          setError("No se pudo conectar al servidor. Verificá tu conexión a internet.");
        } else {
          setError(error.message);
        }
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Ocurrió un error inesperado. Verificá que Supabase esté configurado.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-[#1a3a2a]">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-[#0d261a] flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Kobro" className="h-12 w-12" />
            <h1 className="text-3xl font-bold text-white">Kobro</h1>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Automatiza tus<br />mensajes de WhatsApp
            </h2>
            <p className="text-white/60 text-lg">
              La plataforma B2B para gestionar clientes, enviar campañas y validar pagos.
            </p>
          </div>

          <div className="grid gap-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <Zap className="h-5 w-5 text-[#a8d5a8]" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Mensajes Automatizados</h3>
                <p className="text-sm text-white/50">Campañas promocionales y recordatorios</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-[#a8d5a8]" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Validación con OCR</h3>
                <p className="text-sm text-white/50">Confirma pagos automáticamente</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 text-[#a8d5a8]" />
              </div>
              <div>
                <h3 className="font-semibold text-white">CRM Integrado</h3>
                <p className="text-sm text-white/50">Gestiona tus clientes fácilmente</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-white/30">
          © 2024 Kobro. Todos los derechos reservados.
        </p>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#1a3a2a]">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <img src="/logo.svg" alt="Kobro" className="h-10 w-10" />
            <h1 className="text-2xl font-bold text-white">Kobro</h1>
          </div>

          <Card className="bg-[#0d261a] border-white/10">
            <CardHeader className="space-y-1 pb-2">
              <CardTitle className="text-2xl text-center text-white">Bienvenido</CardTitle>
              <CardDescription className="text-center text-white/50">
                Ingresá tus credenciales para continuar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div className="bg-red-500/20 text-red-300 text-sm p-3 rounded-lg text-center">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium text-white">Contraseña</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-11 text-base font-medium bg-[#a8d5a8] hover:bg-[#8fbc8f] text-[#0d261a]" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Ingresando...
                    </>
                  ) : (
                    "Ingresar"
                  )}
                </Button>
              </form>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#0d261a] px-2 text-white/40">
                    ¿No tenés cuenta?
                  </span>
                </div>
              </div>

              <Link href="/auth/register">
                <Button 
                  variant="outline" 
                  className="w-full h-11 border-white/20 text-white hover:bg-white/10 bg-transparent"
                >
                  Crear cuenta
                </Button>
              </Link>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-white/40 lg:hidden">
            © 2024 Kobro. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
