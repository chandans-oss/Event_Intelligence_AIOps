import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("[Main] Starting application...");
createRoot(document.getElementById("root")!).render(<App />);
console.log("[Main] Render called.");
