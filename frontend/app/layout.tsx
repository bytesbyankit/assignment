import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Transcript Task Graph",
    description: "Visualize task dependencies from meeting transcripts",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
