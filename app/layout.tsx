import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CV Genio - Creador de Currículums con IA',
  description: 'Generador de currículums profesionales impulsado por IA, diseñado para el mercado de Puerto Rico.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        {/* Código de Google Fonts para Montserrat (Ya incluido en el bloque de Fonts de abajo) */}
        {/* <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet" /> */}

        {/* Tailwind CSS CDN */}
        <script src="https://cdn.tailwindcss.com"></script>
        
        {/* Tailwind Configuration - CORREGIDO */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                theme: {
                  extend: {
                    fontFamily: {
                      // Fuentes originales del proyecto:
                      'sans-serif': ['Lato', 'sans-serif'], 
                      'serif': ['Playfair Display', 'serif'],
                      // ¡Añadir aquí la fuente PRO!
                      'pro-font': ['Montserrat', 'sans-serif'], 
                    },
                    // ... el resto de la configuración de colores (colors) sigue aquí ...
                  },
                },
              } // <--- CIERRE CORRECTO DE tailwind.config
            `,
          }} 
        />
        {/* FIN Tailwind Configuration */}

        {/* Print Styles - ESTABA CORRECTO, PERO ASEGURAMOS LA POSICIÓN */}
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            @page {
              size: 8.5in 11in;
              margin: 0;
            }
            html, body {
              width: 100%;
              min-height: 100%;
              background: white;
            }
            body {
              margin: 0;
              padding: 0;
              background: white;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            body * {
              visibility: hidden;
            }
            .no-print { display: none !important; }
            .print-only { display: block !important; }

            .print-preview-area {
              display: block !important;
              visibility: visible !important;
            }
            .print-preview-area * {
              visibility: visible !important;
            }

            #resume-preview {
              display: block !important;
              width: 8.5in !important;
              max-width: 8.5in !important;
              min-height: 11in !important;
              margin: 0 auto !important;
              box-shadow: none !important;
              position: absolute;
              top: 0;
              left: 0;
              padding-bottom: 0.5in;
              visibility: visible !important;
            }

            #resume-preview * {
              visibility: visible !important;
            }
          }
        `}} />
        
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;700&family=Lato:wght@300;400;700&display=swap&family=Montserrat:wght@400;700" rel="stylesheet" />
        {/* Nota: Incluí Montserrat en el último enlace de Google Fonts para optimizar. */}
      </head>
      <body className="bg-gray-100 text-slate-800">
        {children}
      </body>
    </html>
  );
}