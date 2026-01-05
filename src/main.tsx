import { createRoot } from "react-dom/client";
import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/500.css";
import "@fontsource/playfair-display/600.css";
import "@fontsource/playfair-display/700.css";
import "@fontsource/playfair-display/800.css";
import "@fontsource/source-sans-3/300.css";
import "@fontsource/source-sans-3/400.css";
import "@fontsource/source-sans-3/500.css";
import "@fontsource/source-sans-3/600.css";
import "@fontsource/source-sans-3/700.css";
import App from "./App.tsx";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
    throw new Error("Failed to find the root element");
}

try {
    createRoot(rootElement).render(<App />);
} catch (error) {
    console.error("Failed to mount app:", error);
    rootElement.innerHTML = `<div style="padding: 20px; color: red;"><h1>Failed to mount app</h1><pre>${error instanceof Error ? error.message : String(error)}</pre></div>`;
}
