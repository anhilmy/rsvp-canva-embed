import { useState } from "react";
import {
    Box,
    Rows,
    Text,
    Title,
    Button,
    Alert,
    SegmentedControl,
} from "@canva/app-ui-kit";
import { api, RSVPStatusType } from "../../../api/rsvp-client";

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

export const RSVPForm = ({ guest, websiteId, onSubmitted }: RSVPFormProps) => {
    const [status, setStatus] = useState<RSVPStatusType>("attending");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await api.submitRSVP(guest.id, status);

            if (result.success) {
                onSubmitted();
            } else {
                setError(result.error || "Failed to submit RSVP");
            }
        } catch (err) {
            setError("Failed to submit RSVP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Rows spacing="2u">
            <Title size="medium">Hi, {guest.name}!</Title>
            <Text>Will you be attending?</Text>

            {error && (
                <Alert tone="critical">{error}</Alert>
            )}

            <SegmentedControl
                options={[
                    { value: "attending", label: "Yes, I'll be there!" },
                    { value: "maybe", label: "Maybe" },
                    { value: "not_attending", label: "Sorry, can't make it" },
                ]}
                value={status}
                onChange={(value) => setStatus(value as RSVPStatusType)}
            />

            <Button
                variant="primary"
                onClick={handleSubmit}
                loading={loading}
                stretch
            >
                Submit RSVP
            </Button>
        </Rows>
    );
};
