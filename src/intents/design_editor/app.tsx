import { useState, useEffect } from "react";
import {
  Box,
  Rows,
  Text,
  Title,
  LoadingIndicator,
  Alert,
  TextInput,
  Button,
} from "@canva/app-ui-kit";
import { GuestValidation } from "./components/GuestValidation";
import { RSVPForm } from "./components/RSVPForm";
import { WishForm } from "./components/WishForm";
import { WishesList } from "./components/WishesList";
import { RSVPStatus } from "./components/RSVPStatus";
import { api } from "../../api/rsvp-client";
import "styles/components.css";

type View = "setup" | "validation" | "rsvp" | "wishes" | "success";

interface GuestData {
  id: string;
  name: string;
  hasRsvp: boolean;
  rsvpStatus: string | null;
}

export const App = () => {
  const [view, setView] = useState<View>("setup");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [websiteId, setWebsiteId] = useState<string | null>(null);
  const [websiteIdInput, setWebsiteIdInput] = useState("");
  const [guest, setGuest] = useState<GuestData | null>(null);

  // Check for stored website ID on mount
  useEffect(() => {
    const storedWebsiteId = localStorage.getItem("rsvp_website_id");
    if (storedWebsiteId) {
      validateAndSetWebsite(storedWebsiteId);
    } else {
      setLoading(false);
    }
  }, []);

  const validateAndSetWebsite = async (wid: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.validateWebsite(wid);
      if (result.success) {
        setWebsiteId(wid);
        localStorage.setItem("rsvp_website_id", wid);
        setView("validation");
      } else {
        setError("Invalid event code. Please check and try again.");
        localStorage.removeItem("rsvp_website_id");
      }
    } catch (err) {
      setError("Failed to validate event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSetupSubmit = () => {
    if (!websiteIdInput.trim()) {
      setError("Please enter an event code");
      return;
    }
    validateAndSetWebsite(websiteIdInput.trim());
  };

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

  const handleReset = () => {
    localStorage.removeItem("rsvp_website_id");
    setWebsiteId(null);
    setGuest(null);
    setWebsiteIdInput("");
    setView("setup");
  };

  if (loading) {
    return (
      <Box padding="3u">
        <Rows spacing="2u" align="center">
          <LoadingIndicator size="large" />
          <Text>Loading event...</Text>
        </Rows>
      </Box>
    );
  }

  return (
    <Box padding="3u">
      <Rows spacing="3u">
        {error && (
          <Alert tone="critical" onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}

        {view === "setup" && (
          <Rows spacing="2u">
            <Title size="medium">Welcome!</Title>
            <Text>Enter your event code to access the RSVP form.</Text>
            <TextInput
              placeholder="Enter event code"
              value={websiteIdInput}
              onChange={setWebsiteIdInput}
            />
            <Button variant="primary" onClick={handleSetupSubmit} stretch>
              Continue
            </Button>
          </Rows>
        )}

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
            <Box padding="2u" background="positive" borderRadius="large">
              <Rows spacing="1u">
                <Title size="small">Thank you!</Title>
                <Text>Your wish has been submitted successfully.</Text>
              </Rows>
            </Box>
            <RSVPStatus websiteId={websiteId} />
            <WishesList websiteId={websiteId} />
          </>
        )}

        {websiteId && (
          <Button variant="tertiary" onClick={handleReset}>
            Switch Event
          </Button>
        )}
      </Rows>
    </Box>
  );
};
            </Rows>
        </Box>
    );
};
