import React from "react";
import { createRoot } from "react-dom/client";
import ChatWidget from "./components/ChatWidget";
import axios from "axios";

// Nastavení CSRF tokenu pro Axios
axios.defaults.headers.common["X-CSRF-TOKEN"] = document
  .querySelector('meta[name="csrf-token"]')
  .getAttribute("content");

// Pokud používáte Sanctum, přidejte také:
axios.defaults.withCredentials = true;

const container = document.getElementById("chat-widget-container");
if (container) {
  const root = createRoot(container);
  root.render(<ChatWidget />);
}
