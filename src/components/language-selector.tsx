"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "../i18n/routing";
import { ChevronDownIcon, GlobeAltIcon } from "@heroicons/react/24/outline";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "sk", name: "Slovenčina", flag: "🇸🇰" },
] as const;

export function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("common");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find((lang) => lang.code === locale);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (langCode: string) => {
    setIsOpen(false);
    
    // Save language preference to localStorage and cookies for future visits
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferredLocale', langCode);
      
      // Also set a cookie that the middleware can read
      document.cookie = `preferredLocale=${langCode}; path=/; max-age=31536000; samesite=strict`;
    }
    
    router.push(pathname, { locale: langCode });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg bg-muted hover:bg-accent transition-colors"
        aria-label={t("selectLanguage")}
      >
        <GlobeAltIcon className="w-5 h-5 text-foreground" />
        <span className="text-sm font-medium text-foreground hidden sm:inline">
          {currentLanguage?.flag} {currentLanguage?.name}
        </span>
        <span className="text-sm font-medium text-foreground sm:hidden">
          {currentLanguage?.flag}
        </span>
        <ChevronDownIcon
          className={`w-4 h-4 text-muted-foreground transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-background border border-border rounded-lg shadow-lg z-50">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-accent transition-colors ${
                locale === language.code ? "bg-accent text-accent-foreground" : "text-foreground"
              }`}
            >
              <span className="text-lg">{language.flag}</span>
              <span className="text-sm font-medium">{language.name}</span>
              {locale === language.code && (
                <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
