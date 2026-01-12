import { useEffect } from "react";
import {
    Box,
    Rows,
    Alert,
    LoadingIndicator,
    Tabs,
    Tab,
    TabList,
    TabPanels,
    TabPanel,
} from "@canva/app-ui-kit";
import { useAppContext } from "../../context";
import { WebsiteSetup } from "../../components/website_setup";
import { GuestManagement } from "../../components/guest_management";
import { RSVPStatus } from "../../components/rsvp_status";
import { WishesManagement } from "../../components/wishes_management";
import * as styles from "styles/components.css";

export function App() {
    const { state, loadWebsites, setActiveView, clearError } = useAppContext();
    const { loading, error, currentWebsite, activeView } = state;

    // Load websites on mount
    useEffect(() => {
        loadWebsites();
    }, [loadWebsites]);

    // Map view to tab id
    const viewToTabId: Record<typeof activeView, string> = {
        setup: "setup",
        guests: "guests",
        rsvp: "rsvp",
        wishes: "wishes",
    };

    const handleTabChange = (tabId: string) => {
        // Only allow switching to other tabs if a website is selected (except setup)
        if (tabId !== "setup" && !currentWebsite) {
            return;
        }
        setActiveView(tabId as typeof activeView);
    };

    if (loading.websites && state.websites.length === 0) {
        return (
            <div className={styles.scrollContainer}>
                <Box padding="2u">
                    <Rows spacing="2u" align="center">
                        <LoadingIndicator size="medium" />
                    </Rows>
                </Box>
            </div>
        );
    }

    return (
        <div className={styles.scrollContainer}>
            <Rows spacing="0">
                {error && (
                    <Box padding="1u">
                        <Alert tone="critical" onDismiss={clearError}>
                            {error}
                        </Alert>
                    </Box>
                )}

                <Tabs activeId={viewToTabId[activeView]} onSelect={handleTabChange}>
                    <TabList>
                        <Tab id="setup">Setup</Tab>
                        <Tab id="guests">
                            Guests {!currentWebsite && "🔒"}
                        </Tab>
                        <Tab id="rsvp">
                            RSVPs {!currentWebsite && "🔒"}
                        </Tab>
                        <Tab id="wishes">
                            Wishes {!currentWebsite && "🔒"}
                        </Tab>
                    </TabList>

                    <TabPanels>
                        <TabPanel id="setup">
                            <WebsiteSetup />
                        </TabPanel>
                        <TabPanel id="guests">
                            <GuestManagement />
                        </TabPanel>
                        <TabPanel id="rsvp">
                            <RSVPStatus />
                        </TabPanel>
                        <TabPanel id="wishes">
                            <WishesManagement />
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Rows>
        </div>
    );
}