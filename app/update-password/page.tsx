"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";

export default function UpdatePasswordPage() {
    const supabase = createClient();
    const router = useRouter();

    // UI states
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // toggle visibility
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Ensure user has a valid reset session
    useEffect(() => {
        const checkSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session) {
                toast.error("Acceso denegado. El enlace de recuperación expiró o no es válido.");
                router.push("/sign-in");
            } else {
                setIsAuthenticated(true);
            }

            setIsLoading(false);
        };

        checkSession();
    }, [router, supabase.auth]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Las contraseñas no coinciden");
            return;
        }

        if (password.length < 6) {
            toast.error("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        setIsSubmitting(true);

        const { error } = await supabase.auth.updateUser({
            password: password,
        });

        if (error) {
            toast.error(error.message || "Error al actualizar la contraseña");
            setIsSubmitting(false);
            return;
        }

        toast.success("¡Contraseña actualizada correctamente!");

        setTimeout(() => {
            router.push("/sign-in");
        }, 2000);
    };

    if (isLoading) {
        return (
            <Card className="w-full max-w-md mx-auto mt-10">
                <CardContent className="flex items-center justify-center p-6">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <Card className="w-full max-w-md mx-auto mt-10 bg-[#1F1F22] text-white">
            <CardHeader className="space-y-1">
                <div className="flex items-center">
                    <img
                        src="/logoreal.webp"
                        alt="VitaeSpark Logo"
                        className="mr-2 h-10 w-10"
                    />
                    <CardTitle className="text-2xl font-bold">VitaeSpark</CardTitle>
                </div>
                <CardDescription className="text-gray-300">
                    Establece tu nueva contraseña
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Nueva contraseña */}
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-white">Nueva Contraseña</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isSubmitting}
                                required
                                className="bg-[#2A2A2D] border-[#3A3A3D] text-white pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 px-3 h-full text-gray-400 hover:text-white"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>

                    {/* Confirmar contraseña */}
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-white">Confirmar Contraseña</Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={isSubmitting}
                                required
                                className="bg-[#2A2A2D] border-[#3A3A3D] text-white pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 px-3 h-full text-gray-400 hover:text-white"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>

                    {/* Enviar */}
                    <Button
                        type="submit"
                        className="w-full bg-[#3A3A3D] hover:bg-[#4A4A4D]"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Actualizando...
                            </>
                        ) : (
                            "Actualizar Contraseña"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
