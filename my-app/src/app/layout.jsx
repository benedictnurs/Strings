import './globals.css';
import { Inter } from 'next/font/google';
import StoreProvider from './StoreProvider';
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Strings",
  description: "Connect with Strings!",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <StoreProvider>
        <html lang="en">
          <head>
            <title>{metadata.title}</title>
            <meta name="description" content={metadata.description} />
          </head>
          <body className={inter.className}>{children}</body>
        </html>
      </StoreProvider>
    </ClerkProvider>

  );
}
