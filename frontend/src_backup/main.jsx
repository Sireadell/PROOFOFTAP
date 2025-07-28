import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { WalletProvider } from "@/contexts/WalletContext";
import "@/styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <WalletProvider>
      <App />
    </WalletProvider>
  </React.StrictMode>
);
