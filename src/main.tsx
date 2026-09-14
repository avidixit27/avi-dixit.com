import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Expected the application root element to exist.");
}

const bootstrapElement = document.getElementById("app-bootstrap");
void document.fonts.ready.then(() => {
  window.requestAnimationFrame(() => bootstrapElement?.remove());
});

ReactDOM.createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
