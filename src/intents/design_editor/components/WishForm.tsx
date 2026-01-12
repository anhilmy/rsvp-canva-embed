import { useState } from "react";
import {
  Rows,
  Text,
  Title,
  Button,
  Alert,
  Box,
  MultilineInput,
} from "@canva/app-ui-kit";
import { api } from "../../../api/rsvp-client";

interface GuestData {
  id: string;
  name: string;
}

interface WishFormProps {
  guest: GuestData;
  websiteId: string;
  onSubmitted: () => void;
}

export const WishForm = ({ guest, websiteId, onSubmitted }: WishFormProps) => {
  const [wishMessage, setWishMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!wishMessage.trim()) {
      setError("Please write a wish or message");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await api.submitWish({
        websiteId,
        guestId: guest.id,
        message: wishMessage.trim(),
      });

      if (result.success) {
        setSuccess(true);
        setWishMessage("");
        setTimeout(() => {
          onSubmitted();
        }, 1500);
      } else {
        setError(result.error || "Failed to submit wish. Please try again.");
      }
    } catch (err) {
      setError("Failed to submit wish. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box padding="2u" background="neutralLow" borderRadius="large">
        <Rows spacing="1u">
          <Title size="small">✨ Thank you!</Title>
          <Text>Your wish has been submitted.</Text>
        </Rows>
      </Box>
    );
  }

  return (
    <Rows spacing="2u">
      <Title size="medium">Send Your Wishes</Title>
      <Text>Share a special message with the couple!</Text>

      {error && (
        <Alert tone="critical" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Rows spacing="1u">
        <Text size="small" tone="tertiary">
          Your message
        </Text>
        <MultilineInput
          placeholder="Write your wishes here..."
          value={wishMessage}
          onChange={setWishMessage}
          minRows={3}
          maxRows={6}
        />
        <Text size="xsmall" tone="tertiary">
          Your wish will be displayed publicly as "{guest.name}"
        </Text>
      </Rows>

      <Button
        variant="primary"
        onClick={handleSubmit}
        disabled={loading || !wishMessage.trim()}
        stretch
        loading={loading}
      >
        Send Wish
      </Button>
    </Rows>
  );
};
