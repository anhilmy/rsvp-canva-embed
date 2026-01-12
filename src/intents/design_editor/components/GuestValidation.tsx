import { useState } from "react";
import {
  Box,
  Rows,
  Text,
  Title,
  TextInput,
  Button,
  Alert,
  LoadingIndicator,
} from "@canva/app-ui-kit";
import { api } from "../../../api/rsvp-client";

interface GuestData {
  id: string;
  name: string;
  hasRsvp: boolean;
  rsvpStatus: string | null;
}

interface GuestValidationProps {
  websiteId: string;
  onValidated: (guest: GuestData) => void;
}

export const GuestValidation = ({
  websiteId,
  onValidated,
}: GuestValidationProps) => {
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleValidate = async () => {
    if (!inviteCode.trim()) {
      setError("Please enter your invite code");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await api.validateInviteCode(
        websiteId,
        inviteCode.trim().toUpperCase()
      );

      if (result.success && result.data) {
        onValidated({
          id: result.data.id,
          name: result.data.name,
          hasRsvp: result.data.hasRsvp,
          rsvpStatus: result.data.rsvpStatus,
        });
      } else {
        setError(result.error || "Invalid invite code. Please check and try again.");
      }
    } catch (err) {
      setError("Failed to validate invite code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleValidate();
    }
  };

  return (
    <Rows spacing="2u">
      <Title size="medium">Enter Your Invite Code</Title>
      <Text>
        Please enter the unique invite code from your invitation to access the
        RSVP form.
      </Text>

      {error && (
        <Alert tone="critical" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TextInput
        placeholder="e.g., ABCD1234"
        value={inviteCode}
        onChange={(value) => setInviteCode(value.toUpperCase())}
        onKeyDown={handleKeyPress}
        disabled={loading}
      />

      <Button
        variant="primary"
        onClick={handleValidate}
        disabled={loading || !inviteCode.trim()}
        stretch
      >
        {loading ? (
          <Box padding="0.5u">
            <LoadingIndicator size="small" />
          </Box>
        ) : (
          "Validate & Continue"
        )}
      </Button>
    </Rows>
  );
};
