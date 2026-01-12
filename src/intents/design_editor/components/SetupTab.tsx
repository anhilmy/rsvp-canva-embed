import { useState } from "react";
import {
  Box,
  Rows,
  Text,
  Title,
  TextInput,
  Button,
  Alert,
} from "@canva/app-ui-kit";
import { adminApi } from "../../../api/rsvp-client";

interface WebsiteData {
  id: string;
  name: string;
  apiKey: string;
  canvaDesignId: string;
}

interface SetupTabProps {
  website: WebsiteData | null;
  onRegistered: (website: WebsiteData) => void;
}

export const SetupTab = ({ website, onRegistered }: SetupTabProps) => {
  const [eventName, setEventName] = useState("");
  const [designId, setDesignId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"register" | "connect">("register");

  const handleRegister = async () => {
    if (!eventName.trim() || !designId.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First set API key for admin operations
      const masterApiKey = process.env.API_KEY || apiKey;
      adminApi.setApiKey(masterApiKey);

      const result = await adminApi.registerWebsite(designId.trim(), eventName.trim());

      if (result.success && result.data) {
        onRegistered({
          id: result.data._id,
          name: result.data.name,
          apiKey: result.data.apiKey,
          canvaDesignId: result.data.canvaDesignId,
        });
      } else {
        setError(result.error || "Failed to register website");
      }
    } catch (err) {
      setError("Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!designId.trim() || !apiKey.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      adminApi.setApiKey(apiKey.trim());

      // Try to fetch the website to validate credentials
      const result = await adminApi.getGuests(designId.trim());

      if (result.success) {
        onRegistered({
          id: designId.trim(),
          name: "Connected Event",
          apiKey: apiKey.trim(),
          canvaDesignId: designId.trim(),
        });
      } else {
        setError("Invalid credentials or website not found");
      }
    } catch (err) {
      setError("Failed to connect. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  if (website) {
    return (
      <Rows spacing="2u">
        <Box padding="2u" background="neutral" borderRadius="large">
          <Rows spacing="1u">
            <Title size="small">✓ Website Connected</Title>
            <Text>Your RSVP system is set up and ready.</Text>
          </Rows>
        </Box>

        <Box padding="2u" background="neutralLow" borderRadius="large">
          <Rows spacing="1u">
            <Text variant="bold">Website ID:</Text>
            <Text size="small" tone="tertiary">{website.id}</Text>
            
            <Text variant="bold">API Key:</Text>
            <Text size="small" tone="tertiary">{website.apiKey}</Text>
            
            <Text variant="bold">Design ID:</Text>
            <Text size="small" tone="tertiary">{website.canvaDesignId}</Text>
          </Rows>
        </Box>

        <Box padding="2u" background="neutralLow" borderRadius="large">
          <Rows spacing="1u">
            <Title size="xsmall">Guest Link Format</Title>
            <Text size="small">
              Share this link format with guests (replace WEBSITE_ID):
            </Text>
            <Text size="small" tone="tertiary">
              your-domain.com/?wid={website.id}
            </Text>
          </Rows>
        </Box>

        <Button
          variant="secondary"
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
        >
          Disconnect
        </Button>
      </Rows>
    );
  }

  return (
    <Rows spacing="2u">
      <Title size="medium">RSVP Setup</Title>
      <Text>Register your event to start collecting RSVPs and wishes.</Text>

      {error && (
        <Alert tone="critical">{error}</Alert>
      )}

      <Box padding="1u">
        <Button
          variant={mode === "register" ? "primary" : "secondary"}
          onClick={() => setMode("register")}
        >
          New Event
        </Button>
        {" "}
        <Button
          variant={mode === "connect" ? "primary" : "secondary"}
          onClick={() => setMode("connect")}
        >
          Connect Existing
        </Button>
      </Box>

      {mode === "register" && (
        <Rows spacing="2u">
          <TextInput
            placeholder="Event Name (e.g., John & Jane's Wedding)"
            value={eventName}
            onChange={setEventName}
            disabled={loading}
          />

          <TextInput
            placeholder="Design ID (from Canva URL)"
            value={designId}
            onChange={setDesignId}
            disabled={loading}
          />

          <TextInput
            placeholder="Master API Key"
            value={apiKey}
            onChange={setApiKey}
            disabled={loading}
          />

          <Button
            variant="primary"
            onClick={handleRegister}
            loading={loading}
            stretch
          >
            Register Event
          </Button>
        </Rows>
      )}

      {mode === "connect" && (
        <Rows spacing="2u">
          <TextInput
            placeholder="Website ID"
            value={designId}
            onChange={setDesignId}
            disabled={loading}
          />

          <TextInput
            placeholder="API Key"
            value={apiKey}
            onChange={setApiKey}
            disabled={loading}
          />

          <Button
            variant="primary"
            onClick={handleConnect}
            loading={loading}
            stretch
          >
            Connect
          </Button>
        </Rows>
      )}

      <Text size="small" tone="tertiary">
        The Design ID can be found in the URL when editing your design in Canva.
      </Text>
    </Rows>
  );
};
