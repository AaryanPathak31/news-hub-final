import { useEffect } from "react";
import { Globe } from "lucide-react";

export function LanguageSelector() {
  // Styling overrides to make the Google Widget invisible but clickable
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
            /* COMPLETELY HIDE GOOGLE BRANDING */
            iframe.goog-te-banner-frame { display: none !important; }
            .goog-te-gadget-icon { display: none !important; }
            .goog-te-gadget-simple { 
                background-color: transparent !important; 
                padding: 0 !important; 
                border: none !important;
                font-size: 0 !important;
            }
            .goog-te-gadget-simple > span { display: none !important; }
            .goog-te-gadget-simple > img { display: none !important; }
            
            /* Hide the "Powered by Google" text and images */
            .goog-logo-link { display: none !important; }
            .goog-te-gadget { 
                color: transparent !important; 
                font-size: 0 !important; 
            }
            .goog-te-gadget img { display: none !important; }
            .goog-te-gadget > div { display: block !important; width: 100% !important; height: 100% !important; }
            
            /* Target the Select Element - MAKE IT CLICKABLE BUT INVISIBLE */
            .goog-te-combo {
                opacity: 0.001 !important;
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                display: block !important;
                cursor: pointer !important;
                z-index: 50 !important;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
                font-size: 16px !important;
                -webkit-appearance: none;
            }

            /* Container overrides */
            #google_translate_element {
                display: block !important;
                width: 100% !important;
                height: 100% !important;
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                z-index: 20 !important;
                overflow: hidden !important;
            }
            
            /* Hide top bar body shift */
            body { top: 0px !important; }
        `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    }
  }, []);

  return (
    <div className="relative group cursor-pointer mr-4">
      {/* Custom Icon UI */}
      <div className="flex items-center gap-2 px-2 py-1 text-primary-foreground/80 hover:text-white transition-colors">
        <Globe className="h-4 w-4" />
        <span className="text-xs font-medium">EN</span>
      </div>

      {/* Invisible Google Translate Wrapper */}
      <div
        id="google_translate_element"
        className="absolute inset-0 w-full h-full z-20"
      ></div>
    </div>
  );
}
