import { useState, useEffect } from "react";
import {
  Box,
  Rows,
  Columns,
  Text,
  Title,
  Button,
  LoadingIndicator,
  Badge,
  Alert,
  EyeIcon,
} from "@canva/app-ui-kit";
import { adminApi } from "../../../api/rsvp-client";

interface Wish {
  _id: string;
  guestName: string;
  message: string;
  isPublic: boolean;
  isReported: boolean;
  isHidden: boolean;
  createdAt: string;
  guestId?: {
    _id: string;
    name: string;
    email?: string;
  };
}

interface WishesTabProps {
  websiteId: string;
}

export const WishesTab = ({ websiteId }: WishesTabProps) => {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "reported" | "hidden">("all");

  const fetchWishes = async () => {
    setLoading(true);
    try {
      const result = await adminApi.getAllWishes(websiteId);
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

  const handleToggleHide = async (wishId: string, currentlyHidden: boolean) => {
    try {
      const result = currentlyHidden
        ? await adminApi.unhideWish(wishId)
        : await adminApi.hideWish(wishId);

      if (result.success) {
        fetchWishes();
      } else {
        setError(result.error || "Failed to update wish");
      }
    } catch (err) {
      setError("Failed to update wish");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredWishes = wishes.filter((wish) => {
    if (filter === "reported") return wish.isReported;
    if (filter === "hidden") return wish.isHidden;
    return true;
  });

  const reportedCount = wishes.filter((w) => w.isReported && !w.isHidden).length;
  const hiddenCount = wishes.filter((w) => w.isHidden).length;

  if (loading) {
    return (
      <Box padding="2u">
        <Rows spacing="1u" align="center">
          <LoadingIndicator size="medium" />
          <Text>Loading wishes...</Text>
        </Rows>
      </Box>
    );
  }

  return (
    <Rows spacing="2u">
      <Columns spacing="1u" alignY="center">
        <Title size="small">Wishes ({wishes.length})</Title>
        {reportedCount > 0 && (
          <Badge tone="warn" text={`${reportedCount} reported`} />
        )}
      </Columns>

      {error && (
        <Alert tone="critical" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Columns spacing="1u">
        <Button
          variant={filter === "all" ? "primary" : "secondary"}
          onClick={() => setFilter("all")}
        >
          {`All (${wishes.length})`}
        </Button>
        <Button
          variant={filter === "reported" ? "primary" : "secondary"}
          onClick={() => setFilter("reported")}
        >
          {`Reported (${reportedCount})`}
        </Button>
        <Button
          variant={filter === "hidden" ? "primary" : "secondary"}
          onClick={() => setFilter("hidden")}
        >
          {`Hidden (${hiddenCount})`}
        </Button>
      </Columns>

      {filteredWishes.length === 0 ? (
        <Box padding="2u" background="neutralLow" borderRadius="large">
          <Text tone="tertiary">
            {filter === "all"
              ? "No wishes yet."
              : filter === "reported"
              ? "No reported wishes."
              : "No hidden wishes."}
          </Text>
        </Box>
      ) : (
        <Rows spacing="1u">
          {filteredWishes.map((wish) => (
            <Box
              key={wish._id}
              padding="2u"
              background="neutralLow"
              border={wish.isHidden ? "critical" : wish.isReported ? "standard" : "none"}
              borderRadius="standard"
            >
              <Rows spacing="1u">
                <Columns spacing="1u" alignY="center">
                  <Rows spacing="0.5u">
                    <Text variant="bold">{wish.guestName}</Text>
                    <Text size="small" tone="tertiary">
                      {formatDate(wish.createdAt)}
                    </Text>
                  </Rows>
                  <Box>
                    {wish.isReported && !wish.isHidden && (
                      <Badge tone="warn" text="Reported" />
                    )}
                    {wish.isHidden && (
                      <Badge tone="critical" text="Hidden" />
                    )}
                  </Box>
                  <Button
                    variant="tertiary"
                    icon={() => <EyeIcon />}
                    onClick={() => handleToggleHide(wish._id, wish.isHidden)}
                  >
                    {wish.isHidden ? "Show" : "Hide"}
                  </Button>
                </Columns>
                <Text>{wish.message}</Text>
              </Rows>
            </Box>
          ))}
        </Rows>
      )}
    </Rows>
  );
};
