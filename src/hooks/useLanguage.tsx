import { createContext, useContext, useEffect, ReactNode, useState } from "react";

// Google Translate Global Definition
declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

type LanguageContextType = {
  // We can expose status like "loaded"
  isLoaded: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Add Google Translate Script
    const addScript = document.createElement("script");
    addScript.setAttribute(
      "src",
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
    );
    addScript.async = true;
    document.body.appendChild(addScript);

    // Initialize callback
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,es,fr,de,it,pt,zh-CN,ja,ko,ar,hi,ru", // Match your list
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        "google_translate_element"
      );
      setIsLoaded(true);
    };

    return () => {
      // Cleanup if necessary (rarely needed for google translate)
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ isLoaded }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
