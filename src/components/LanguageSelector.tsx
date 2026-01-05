import { useEffect } from "react";

export function LanguageSelector() {
  // Styling overrides to make the Google Widget look decent
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
            /* Hide Google Branding */
            .goog-logo-link { display: none !important; }
            .goog-te-gadget { color: transparent !important; }
            
            /* Customize Dropdown */
            .goog-te-combo {
                background-color: transparent;
                border: 1px solid hsl(var(--input));
                border-radius: 6px;
                padding: 4px 8px;
                font-size: 14px;
                color: hsl(var(--foreground));
                outline: none;
                cursor: pointer;
            }
            
            /* Remove Google Top Bar */
            .skiptranslate.goog-te-banner-frame { display: none !important; } 
            body { top: 0px !important; }
        `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    }
  }, []);

  return (
    <div className="flex items-center">
      {/* Google Translate Wrapper */}
      <div id="google_translate_element" className="min-w-[120px]"></div>
    </div>
  );
}

