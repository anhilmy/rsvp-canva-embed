import { useState } from "react";
import {
  Rows,
  Text,
  Title,
  Button,
  Alert,
  SegmentedControl,
  TextInput,
} from "@canva/app-ui-kit";
import { api } from "../../../api/rsvp-client";

interface GuestData {
  id: string;
  name: string;
  hasRsvp: boolean;
  rsvpStatus: string | null;
}

interface RSVPFormProps {
  guest: GuestData;
  websiteId: string;
  onSubmitted: () => void;
}

type RSVPStatus = "attending" | "not_attending" | "maybe";

export const RSVPForm = ({ guest, websiteId, onSubmitted }: RSVPFormProps) => {
  const [status, setStatus] = useState<RSVPStatus>("attending");
  const [numberOfGuests, setNumberOfGuests] = useState("1");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await api.submitRSVP({
        websiteId,
        guestId: guest.id,
        status,
        numberOfGuests: parseInt(numberOfGuests, 10) || 1,
        message: message.trim() || undefined,
      });

      if (result.success) {
        onSubmitted();
      } else {
        setError(result.error || "Failed to submit RSVP. Please try again.");
      }
    } catch (err) {
      setError("Failed to submit RSVP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Rows spacing="2u">
      <Title size="medium">RSVP for {guest.name}</Title>
      <Text>Please let us know if you can attend!</Text>

      {error && (
        <Alert tone="critical" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Rows spacing="1u">
        <Text size="small" tone="tertiary">
          Will you attend?
        </Text>
        <SegmentedControl
          options={[
            { label: "Yes", value: "attending" },
            { label: "Maybe", value: "maybe" },
            { label: "No", value: "not_attending" },
          ]}
          value={status}
          onChange={(value) => setStatus(value as RSVPStatus)}
        />
      </Rows>

      {(status === "attending" || status === "maybe") && (
        <Rows spacing="1u">
          <Text size="small" tone="tertiary">
            Number of guests (including yourself)
          </Text>
          <SegmentedControl
            options={[
              { label: "1", value: "1" },
              { label: "2", value: "2" },
              { label: "3", value: "3" },
              { label: "4", value: "4" },
              { label: "5+", value: "5" },
            ]}
            value={numberOfGuests}
            onChange={setNumberOfGuests}
          />
        </Rows>
      )}

      <Rows spacing="1u">
        <Text size="small" tone="tertiary">
          Message (optional)
        </Text>
        <TextInput
          placeholder="Any dietary requirements or special requests?"
          value={message}
          onChange={setMessage}
        />
      </Rows>

      <Button
        variant="primary"
        onClick={handleSubmit}
        disabled={loading}
        stretch
        loading={loading}
      >
        Submit RSVP
      </Button>
    </Rows>
  );
};
