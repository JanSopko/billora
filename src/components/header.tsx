"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSelector } from "./language-selector";
import { Link } from "../i18n/routing";
import { isUserAuthenticated, logout } from "../utils/auth";

export function Header() {
  const t = useTranslations("nav");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Set initial authentication state
    setIsLoggedIn(isUserAuthenticated());

    // Listen for auth state changes from other components
    const handleAuthStateChange = (event: CustomEvent) => {
      setIsLoggedIn(event.detail.authenticated);
    };

    window.addEventListener('authStateChanged', handleAuthStateChange as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('authStateChanged', handleAuthStateChange as EventListener);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-bold text-foreground">Billora</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              {t("home")}
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              {t("about")}
            </Link>
            <Link
              href="/catalogue"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              {t("catalogue")}
            </Link>
            <Link
              href="/invoices"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              {t("invoices")}
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              {t("contact")}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors"
              title="Sign out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">{t("signOut")}</span>
            </button>
          )}
          <ThemeToggle />
          <LanguageSelector />
        </div>
      </div>
    </header>
  );
}
