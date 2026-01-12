import "@canva/app-ui-kit/styles.css";
import { AppI18nProvider } from "@canva/app-i18n-kit";
import { AppUiProvider } from "@canva/app-ui-kit";
import type { DesignEditorIntent } from "@canva/intents/design";
import { createRoot } from "react-dom/client";
import { App } from "./app";
import { AppProvider } from "../../context";

async function render() {
    const rootElement = document.getElementById("root");
    if (!rootElement) {
        throw new Error("Unable to find element with id of 'root'");
    }

    const root = createRoot(rootElement);
    root.render(
        <AppI18nProvider>
            <AppUiProvider>
                <AppProvider>
                    <App />
                </AppProvider>
            </AppUiProvider>
        </AppI18nProvider>
    );
}

const designEditor: DesignEditorIntent = { render };
export default designEditor;
