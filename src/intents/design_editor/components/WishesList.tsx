import { useState, useEffect } from "react";
import {
  Box,
  Rows,
  Text,
  Title,
  LoadingIndicator,
  Alert,
  Button,
} from "@canva/app-ui-kit";
import { api } from "../../../api/rsvp-client";

interface Wish {
  id: string;
  guestName: string;
  message: string;
  createdAt: string;
}

interface WishesListProps {
  websiteId: string;
}

export const WishesList = ({ websiteId }: WishesListProps) => {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWishes = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await api.getPublicWishes(websiteId);

      if (result.success && result.data) {
        setWishes(result.data);
      } else {
        setError(result.error || "Failed to load wishes");
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
          <Text size="small" tone="tertiary">
            Loading wishes...
          </Text>
        </Rows>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert tone="warn">
        <Text>{error}</Text>
        <Button variant="tertiary" onClick={fetchWishes}>
          Retry
        </Button>
      </Alert>
    );
  }

  if (wishes.length === 0) {
    return (
      <Box padding="2u" background="neutralLow" borderRadius="large">
        <Text alignment="center" tone="tertiary">
          No wishes yet. Be the first to send your wishes!
        </Text>
      </Box>
    );
  }

  return (
    <Rows spacing="2u">
      <Title size="small">Wishes from Guests</Title>

      <Rows spacing="1.5u">
        {wishes.map((wish) => (
          <Box
            key={wish.id}
            padding="2u"
            background="neutralLow"
            borderRadius="large"
          >
            <Rows spacing="1u">
              <Text>{wish.message}</Text>
              <Rows spacing="0.5u">
                <Text size="small" tone="secondary">
                  — {wish.guestName}
                </Text>
                <Text size="xsmall" tone="tertiary">
                  {formatDate(wish.createdAt)}
                </Text>
              </Rows>
            </Rows>
          </Box>
        ))}
      </Rows>

      <Button variant="tertiary" onClick={fetchWishes}>
        Refresh Wishes
      </Button>
    </Rows>
  );
};
