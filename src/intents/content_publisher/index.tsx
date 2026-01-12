import "@canva/app-ui-kit/styles.css";
import type { ContentPublisherIntent } from "@canva/intents/content";
import { AppI18nProvider } from "@canva/app-i18n-kit";
import { AppUiProvider } from "@canva/app-ui-kit";
import { createRoot } from "react-dom/client";
import { App } from "./app";

async function render() {
    const root = createRoot(document.getElementById("root") as Element);

    root.render(
        <AppI18nProvider>
            <AppUiProvider>
                <App />
            </AppUiProvider>
        </AppI18nProvider>
    );
}

const contentPublisher: ContentPublisherIntent = {
    previewUi: { render },
};

export default contentPublisher;

if (module.hot) {
    module.hot.accept("./app", render);
}
