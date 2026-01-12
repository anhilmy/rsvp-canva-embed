import "@canva/app-ui-kit/styles.css";
import type { ContentPublisherIntent } from "@canva/intents/content";
import { AppUiProvider } from "@canva/app-ui-kit";
import { createRoot } from "react-dom/client";
import { App } from "./app";

async function render() {
  const root = createRoot(document.getElementById("root") as Element);

  root.render(
    <AppUiProvider>
      <App />
    </AppUiProvider>
  );
}

const contentPublisher: ContentPublisherIntent = { render };
export default contentPublisher;

if (module.hot) {
  module.hot.accept("./app", render);
}
