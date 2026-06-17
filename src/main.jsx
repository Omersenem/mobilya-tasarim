import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "./styles.css";

// StrictMode kapalı: WebGL/Babylon motoru tek bir canvas'a bağlı olduğundan,
// StrictMode'un effect'i iki kez çalıştırması iki motor + GUI texture'ı yaratıp
// dispose yarışına yol açıyor. 3D kök bileşende StrictMode kullanılmaz.
createRoot(document.getElementById("root")).render(<App />);
