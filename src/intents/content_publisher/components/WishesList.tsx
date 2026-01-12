import { useState, useEffect } from "react";
import {
    Box,
    Rows,
    Columns,
    Text,
    Title,
    LoadingIndicator,
    Button,
} from "@canva/app-ui-kit";
import { api, Wish } from "../../../api/rsvp-client";

interface WishesListProps {
    websiteId: string;
}

export const WishesList = ({ websiteId }: WishesListProps) => {
    const [wishes, setWishes] = useState<Wish[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWishes = async () => {
        try {
            const result = await api.getWishes(websiteId);
            if (result.success && result.data) {
                setWishes(result.data);
            }
        } catch (err) {
            setError("Failed to load wishes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishes();
    }, [websiteId]);

    const handleReport = async (wishId: string) => {
        try {
            await api.reportWish(wishId);
            // Optionally show success message
        } catch (err) {
            // Handle error silently
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    if (loading) {
        return (
            <Box padding="2u">
                <Rows spacing="1u" align="center">
                    <LoadingIndicator size="small" />
                    <Text size="small">Loading wishes...</Text>
                </Rows>
            </Box>
        );
    }

    if (error) {
        return (
            <Box padding="2u">
                <Text tone="critical">{error}</Text>
            </Box>
        );
    }

    if (wishes.length === 0) {
        return (
            <Box padding="2u">
                <Rows spacing="1u">
                    <Title size="small">Wishes</Title>
                    <Text tone="tertiary">No wishes yet. Be the first to share!</Text>
                </Rows>
            </Box>
        );
    }

    return (
        <Rows spacing="2u">
            <Title size="small">Wishes ({wishes.length})</Title>

            {wishes.map((wish) => (
                <Box key={wish._id} padding="2u" background="neutralLow" borderRadius="large">
                    <Rows spacing="1u">
                        <Columns spacing="1u">
                            <Text size="small" variant="bold">
                                {wish.guestName}
                            </Text>
                            <Text size="xsmall" tone="tertiary">
                                {formatDate(wish.createdAt)}
                            </Text>
                        </Columns>
                        <Text>{wish.message}</Text>
                        <Box>
                            <Button
                                variant="tertiary"
                                onClick={() => handleReport(wish._id)}
                            >
                                Report
                            </Button>
                        </Box>
                    </Rows>
                </Box>
            ))}
        </Rows>
    );
};
