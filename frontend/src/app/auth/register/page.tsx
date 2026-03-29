"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Zap, Shield, Users } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      });

      if (error) {
        setError(error.message);
      } else if (data.user) {
        router.push("/auth/login?registered=true");
      }
    } catch {
      setError("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-[#4a7c59] flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center">
              <span className="text-white font-bold text-2xl">K</span>
            </div>
            <h1 className="text-3xl font-bold text-white">Kobro</h1>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Automatiza tus<br />mensajes de WhatsApp
            </h2>
            <p className="text-white/70 text-lg">
              La plataforma B2B para gestionar clientes, enviar campañas y validar pagos.
            </p>
          </div>

          <div className="grid gap-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Mensajes Automatizados</h3>
                <p className="text-sm text-white/60">Campañas promocionales y recordatorios</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Validación con OCR</h3>
                <p className="text-sm text-white/60">Confirma pagos automáticamente</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">CRM Integrado</h3>
                <p className="text-sm text-white/60">Gestiona tus clientes fácilmente</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-white/40">
          © 2024 Kobro. Todos los derechos reservados.
        </p>
      </div>

      {/* Right side - Register form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-lg bg-[#4a7c59] flex items-center justify-center">
              <span className="text-white font-bold text-xl">K</span>
            </div>
            <h1 className="text-2xl font-bold text-[#1a3a2a]">Kobro</h1>
          </div>

          <Card className="border border-gray-200 shadow-lg">
            <CardHeader className="space-y-1 pb-2">
              <CardTitle className="text-2xl text-center text-[#1a3a2a]">Crear cuenta</CardTitle>
              <CardDescription className="text-center text-gray-500">
                Completá tus datos para registrarte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center border border-red-200">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-[#1a3a2a]">Nombre completo</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Juan Pérez"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="h-11 border-gray-300 focus:border-[#4a7c59] focus:ring-[#4a7c59]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-[#1a3a2a]">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="h-11 border-gray-300 focus:border-[#4a7c59] focus:ring-[#4a7c59]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-[#1a3a2a]">Contraseña</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="h-11 border-gray-300 focus:border-[#4a7c59] focus:ring-[#4a7c59]"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 text-base font-medium bg-[#4a7c59] hover:bg-[#3a6347] text-white" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    "Crear cuenta"
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-400">
                    ¿Ya tenés cuenta?
                  </span>
                </div>
              </div>

              <Link href="/auth/login">
                <Button 
                  variant="outline" 
                  className="w-full h-11 border-[#4a7c59] text-[#4a7c59] hover:bg-[#f0f7f4]"
                >
                  Ingresar
                </Button>
              </Link>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-gray-400 lg:hidden">
            © 2024 Kobro. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
