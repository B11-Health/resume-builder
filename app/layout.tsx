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
        {/* Tailwind CSS CDN */}
        <script src="https://cdn.tailwindcss.com"></script>
        
        {/* Tailwind Configuration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                theme: {
                  extend: {
                    fontFamily: {
                      sans: ['Lato', 'sans-serif'],
                      serif: ['Playfair Display', 'serif'],
                    },
                    colors: {
                      'pr-blue': '#00509d',
                      'pr-dark-blue': '#00296b',
                      'pr-red': '#ef233c',
                      'slate-850': '#1e293b',
                    }
                  }
                }
              }
            `,
          }}
        />
        
        {/* Print Styles */}
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            @page {
              size: Letter;
              margin: 0.5in;
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
            #resume-preview, #resume-preview * {
              visibility: visible;
            }
            .no-print { display: none !important; }
            .print-only { display: block !important; }

            #resume-preview {
              width: calc(8.5in - 1in) !important;
              max-width: calc(8.5in - 1in) !important;
              min-height: calc(11in - 1in) !important;
              margin: 0 auto !important;
              box-shadow: none !important;
              visibility: visible;
              position: relative;
              top: auto;
              left: auto;
            }
          }
        `}} />
        
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;700&family=Lato:wght@300;400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-gray-100 text-slate-800">
        {children}
      </body>
    </html>
  );
}