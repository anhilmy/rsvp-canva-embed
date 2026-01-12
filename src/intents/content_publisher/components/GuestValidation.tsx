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

    const handleSubmit = async () => {
        if (!inviteCode.trim()) {
            setError("Please enter your invite code");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await api.validateGuest(websiteId, inviteCode.trim());

            if (result.success && result.data) {
                onValidated(result.data);
            } else {
                setError("Invalid invite code. Please check your invitation.");
            }
        } catch (err) {
            setError("Failed to validate. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Rows spacing="2u">
            <Title size="medium">Welcome!</Title>
            <Text>Please enter your invite code to continue.</Text>

            {error && (
                <Alert tone="critical">{error}</Alert>
            )}

            <TextInput
                placeholder="Enter your invite code"
                value={inviteCode}
                onChange={(value) => setInviteCode(value.toUpperCase())}
                disabled={loading}
            />

            <Button
                variant="primary"
                onClick={handleSubmit}
                loading={loading}
                stretch
            >
                Continue
            </Button>

            <Text size="small" tone="tertiary">
                Your invite code can be found on your invitation card.
            </Text>
        </Rows>
    );
};
