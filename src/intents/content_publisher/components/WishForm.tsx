import { useState } from "react";
import {
    Rows,
    Text,
    Title,
    Button,
    Alert,
    MultilineInput,
} from "@canva/app-ui-kit";
import { api } from "../../../api/rsvp-client";

interface GuestData {
    id: string;
    name: string;
    hasRsvp: boolean;
    rsvpStatus: string | null;
}

interface WishFormProps {
    guest: GuestData;
    websiteId: string;
    onSubmitted: () => void;
}

export const WishForm = ({ guest, websiteId, onSubmitted }: WishFormProps) => {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!message.trim()) {
            setError("Please write a message");
            return;
        }

        if (message.length > 1000) {
            setError("Message must be 1000 characters or less");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await api.submitWish(guest.id, message.trim());

            if (result.success) {
                setMessage("");
                onSubmitted();
            } else {
                setError(result.error || "Failed to submit wish");
            }
        } catch (err) {
            setError("Failed to submit. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Rows spacing="2u">
            <Title size="small">Leave a Wish</Title>
            <Text>Share your wishes and messages!</Text>

            {error && (
                <Alert tone="critical">{error}</Alert>
            )}

            <MultilineInput
                placeholder="Write your wishes here..."
                value={message}
                onChange={(value) => setMessage(value)}
                disabled={loading}
                maxRows={6}
            />

            <Text size="small" tone="tertiary">
                {message.length}/1000 characters
            </Text>

            <Button
                variant="primary"
                onClick={handleSubmit}
                loading={loading}
                disabled={!message.trim()}
                stretch
            >
                Send Wish
            </Button>
        </Rows>
    );
};
