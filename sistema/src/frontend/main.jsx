/** Papel do módulo: Monta a aplicação React no elemento raiz e habilita verificações adicionais de desenvolvimento com StrictMode. */
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/index.css";
ReactDOM.createRoot(document.getElementById("root")).render(
  // StrictMode ajuda a revelar efeitos colaterais durante o desenvolvimento.
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
