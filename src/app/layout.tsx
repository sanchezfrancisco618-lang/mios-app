import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';
import { InitStore } from '@/components/layout/InitStore';

const manrope = Manrope({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'MIOS - MEP Operations Intelligence',
    description: 'Enterprise MEP Operations Platform',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">

            <body className={`${manrope.className} bg-[#0a0c14] text-slate-100 font-sans min-h-screen`}>
                <InitStore />
                <AppShell>{children}</AppShell>
            </body>
        </html>
    );
}
