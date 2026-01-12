import { useState, useEffect } from "react";
import {
    Box,
    Rows,
    Text,
    Title,
    LoadingIndicator,
} from "@canva/app-ui-kit";
import { GuestValidation } from "./components/GuestValidation";
import { RSVPForm } from "./components/RSVPForm";
import { WishForm } from "./components/WishForm";
import { WishesList } from "./components/WishesList";
import { RSVPStatus } from "./components/RSVPStatus";
import { api } from "../../api/rsvp-client";
import "styles/components.css";

type View = "validation" | "rsvp" | "wishes" | "success";

interface GuestData {
    id: string;
    name: string;
    hasRsvp: boolean;
    rsvpStatus: string | null;
}

export const App = () => {
    const [view, setView] = useState<View>("validation");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [websiteId, setWebsiteId] = useState<string | null>(null);
    const [guest, setGuest] = useState<GuestData | null>(null);

    // Extract website ID from URL or Canva context
    useEffect(() => {
        const initWebsite = async () => {
            try {
                // In published web, the website ID should be passed via URL params
                const urlParams = new URLSearchParams(window.location.search);
                const wid = urlParams.get("wid");

                if (wid) {
                    // Validate website exists
                    const result = await api.validateWebsite(wid);
                    if (result.success) {
                        setWebsiteId(wid);
                    } else {
                        setError("This event page is not available.");
                    }
                } else {
                    setError("Invalid event link. Please check your invitation.");
                }
            } catch (err) {
                setError("Failed to load event page. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        initWebsite();
    }, []);

    const handleGuestValidated = (guestData: GuestData) => {
        setGuest(guestData);
        if (guestData.hasRsvp) {
            setView("wishes");
        } else {
            setView("rsvp");
        }
    };

    const handleRSVPSubmitted = () => {
        setView("wishes");
    };

    const handleWishSubmitted = () => {
        setView("success");
    };

    if (loading) {
        return (
            <Box padding="3u">
                <Rows spacing="2u" align="center">
                    <LoadingIndicator size="medium" />
                    <Text>Loading event...</Text>
                </Rows>
            </Box>
        );
    }

    if (error) {
        return (
            <Box padding="3u">
                <Rows spacing="2u">
                    <Title size="medium">Oops!</Title>
                    <Text>{error}</Text>
                </Rows>
            </Box>
        );
    }

    return (
        <Box padding="3u">
            <Rows spacing="3u">
                {view === "validation" && websiteId && (
                    <GuestValidation
                        websiteId={websiteId}
                        onValidated={handleGuestValidated}
                    />
                )}

                {view === "rsvp" && guest && websiteId && (
                    <RSVPForm
                        guest={guest}
                        websiteId={websiteId}
                        onSubmitted={handleRSVPSubmitted}
                    />
                )}

                {view === "wishes" && guest && websiteId && (
                    <>
                        <WishForm
                            guest={guest}
                            websiteId={websiteId}
                            onSubmitted={handleWishSubmitted}
                        />
                        <RSVPStatus websiteId={websiteId} />
                        <WishesList websiteId={websiteId} />
                    </>
                )}

                {view === "success" && websiteId && (
                    <>
                        <Box padding="2u" background="neutral" borderRadius="large">
                            <Rows spacing="1u">
                                <Title size="small">Thank you!</Title>
                                <Text>Your wish has been submitted successfully.</Text>
                            </Rows>
                        </Box>
                        <RSVPStatus websiteId={websiteId} />
                        <WishesList websiteId={websiteId} />
                    </>
                )}
            </Rows>
        </Box>
    );
};
