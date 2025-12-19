// app/login/page.tsx

'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/utils/supabase'; // Importamos la conexión que acabas de crear
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Componente principal de la página de Login
export default function LoginPage() {
    const router = useRouter();

    // Redirigir si el usuario ya está conectado
    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                // Si hay un usuario, redirige a la página principal del constructor
                router.replace('/'); 
            }
        });

        // Escucha cambios en el estado de autenticación (login/logout)
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (session) {
                    router.replace('/');
                }
            }
        );
        return () => {
            authListener?.unsubscribe(); // Limpieza al desmontar
        };
    }, [router]);


    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-8 bg-white shadow-lg rounded-xl">
                <h2 className="text-center text-3xl font-extrabold text-gray-900">
                    Inicia Sesión o Regístrate
                </h2>
                <Auth
                    supabaseClient={supabase}
                    appearance={{ theme: ThemeSupa }}
                    providers={['google', 'github']} // Puedes agregar más o quitarlos
                    redirectTo={`${window.location.origin}/auth/callback`}
                    view="sign_in" // Muestra Sign In por defecto
                    magicLink={true} // Permite el login sin contraseña
                />
            </div>
        </div>
    );
}