import { useState, useEffect } from "react";
import {
    Box,
    Rows,
    Columns,
    Text,
    Title,
    LoadingIndicator,
    Badge,
} from "@canva/app-ui-kit";
import { api, RSVPSummary } from "../../../api/rsvp-client";

interface RSVPStatusProps {
    websiteId: string;
}

export const RSVPStatus = ({ websiteId }: RSVPStatusProps) => {
    const [status, setStatus] = useState<RSVPSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const result = await api.getRSVPStatus(websiteId);
                if (result.success && result.data) {
                    setStatus(result.data);
                }
            } catch (err) {
                // Silently fail
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
    }, [websiteId]);

    if (loading) {
        return (
            <Box padding="1u">
                <LoadingIndicator size="small" />
            </Box>
        );
    }

    if (!status) {
        return null;
    }

    return (
        <Box padding="2u" background="neutralLow" borderRadius="large">
            <Rows spacing="1.5u">
                <Title size="xsmall">RSVP Status</Title>
                <Columns spacing="2u">
                    <Rows spacing="0.5u" align="center">
                        <Text size="large" variant="bold">
                            {status.attending}
                        </Text>
                        <Badge tone="positive" text="Attending" />
                    </Rows>
                    <Rows spacing="0.5u" align="center">
                        <Text size="large" variant="bold">
                            {status.maybe}
                        </Text>
                        <Badge tone="warn" text="Maybe" />
                    </Rows>
                    <Rows spacing="0.5u" align="center">
                        <Text size="large" variant="bold">
                            {status.notAttending}
                        </Text>
                        <Badge tone="critical" text="Not attending" />
                    </Rows>
                    <Rows spacing="0.5u" align="center">
                        <Text size="large" variant="bold">
                            {status.pending}
                        </Text>
                        <Badge tone="info" text="Pending" />
                    </Rows>
                </Columns>
            </Rows>
        </Box>
    );
};
