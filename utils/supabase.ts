// utils/supabase.ts

import { createClient } from '@supabase/supabase-js';

// Usamos las claves de nuestro archivo .env.local
const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Creamos la instancia del cliente de Supabase
export const supabase = createClient(supabaseURL!, supabaseAnonKey!);
// Nota: El '!' le dice a TypeScript que confíe en que estas variables existen.
