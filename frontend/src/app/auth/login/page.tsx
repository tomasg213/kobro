"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Loader2, MessageSquare, Shield, Zap, Users } from "lucide-react";

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
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-primary flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
              <MessageSquare className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-primary-foreground">Kobro</h1>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold text-primary-foreground leading-tight">
              Automatiza tus<br />mensajes de WhatsApp
            </h2>
            <p className="text-primary-foreground/70 text-lg">
              La plataforma B2B para gestionar clientes, enviar campañas y validar pagos.
            </p>
          </div>

          <div className="grid gap-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center flex-shrink-0">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-foreground">Mensajes Automatizados</h3>
                <p className="text-sm text-primary-foreground/60">Campañas promocionales y recordatorios</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-foreground">Validación con OCR</h3>
                <p className="text-sm text-primary-foreground/60">Confirma pagos automáticamente</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-foreground">CRM Integrado</h3>
                <p className="text-sm text-primary-foreground/60">Gestiona tus clientes fácilmente</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-primary-foreground/50">
          © 2024 Kobro. Todos los derechos reservados.
        </p>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Kobro</h1>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-1 pb-2">
              <CardTitle className="text-2xl text-center">Bienvenido</CardTitle>
              <CardDescription className="text-center">
                Ingresá tus credenciales para continuar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg text-center">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
                    <a href="#" className="text-sm text-primary hover:underline">
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-11 text-base font-medium" 
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
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    ¿No tenés cuenta?
                  </span>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full h-11"
                onClick={() => router.push('/auth/register')}
              >
                Crear cuenta
              </Button>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground lg:hidden">
            © 2024 Kobro. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
