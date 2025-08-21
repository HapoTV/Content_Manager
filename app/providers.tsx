// app/providers.tsx
'use client';

import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
    // attribute="class" tells next-themes to change the class on the <html> element
    // defaultTheme="system" uses the user's OS/browser preference as the default
    // enableSystem allows for the "system" option
    // enableColorScheme sets the CSS color-scheme property to match, improving native UI rendering
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem enableColorScheme>
            {children}
        </ThemeProvider>
    );
}