import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LifeGame',
  description: 'Você é o personagem. A vida é o mapa.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
