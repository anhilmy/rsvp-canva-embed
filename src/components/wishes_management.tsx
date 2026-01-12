import { useEffect } from "react";
import {
    Box,
    Rows,
    Columns,
    Column,
    Text,
    Title,
    Button,
    LoadingIndicator,
    Alert,
    Badge,
} from "@canva/app-ui-kit";
import { FormattedMessage, useIntl } from "react-intl";
import { useAppContext } from "../context";

export function WishesManagement() {
    const intl = useIntl();
    const { state, loadWishes, toggleWishVisibility, toggleWishApproval } = useAppContext();
    const { currentWebsite, wishes, wishesPagination, loading } = state;

    // Load wishes when website changes
    useEffect(() => {
        if (currentWebsite) {
            loadWishes(currentWebsite._id);
        }
    }, [currentWebsite, loadWishes]);

    if (!currentWebsite) {
        return (
            <Box padding="2u">
                <Alert tone="info">
                    <FormattedMessage
                        defaultMessage="Please select or create a website first."
                        description="No website selected message"
                    />
                </Alert>
            </Box>
        );
    }

    const handleToggleVisibility = async (wishId: string) => {
        try {
            await toggleWishVisibility(wishId);
        } catch {
            // Error handled by context
        }
    };

    const handleToggleApproval = async (wishId: string) => {
        try {
            await toggleWishApproval(wishId);
        } catch {
            // Error handled by context
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Separate wishes by visibility status
    const visibleWishes = wishes.filter((w) => !w.isHidden && w.isApproved);
    const hiddenWishes = wishes.filter((w) => w.isHidden);
    const pendingWishes = wishes.filter((w) => !w.isApproved && !w.isHidden);

    return (
        <Box padding="2u">
            <Rows spacing="2u">
                <Columns spacing="1u" alignY="center">
                    <Column>
                        <Title size="small">
                            <FormattedMessage
                                defaultMessage="Wishes"
                                description="Wishes section title"
                            />
                        </Title>
                    </Column>
                    <Column width="content">
                        <Text size="small" tone="tertiary">
                            {wishes.length} total
                        </Text>
                    </Column>
                </Columns>

                {/* Stats */}
                <Columns spacing="1u">
                    <Column>
                        <Box background="neutral" borderRadius="standard" padding="1u">
                            <Rows spacing="0.5u" align="center">
                                <Text size="medium" alignment="center">
                                    {visibleWishes.length}
                                </Text>
                                <Text size="xsmall" tone="tertiary" alignment="center">
                                    <FormattedMessage defaultMessage="Visible" description="Visible wishes" />
                                </Text>
                            </Rows>
                        </Box>
                    </Column>
                    <Column>
                        <Box background="neutral" borderRadius="standard" padding="1u">
                            <Rows spacing="0.5u" align="center">
                                <Text size="medium" alignment="center">
                                    {pendingWishes.length}
                                </Text>
                                <Text size="xsmall" tone="tertiary" alignment="center">
                                    <FormattedMessage defaultMessage="Pending" description="Pending wishes" />
                                </Text>
                            </Rows>
                        </Box>
                    </Column>
                    <Column>
                        <Box background="neutral" borderRadius="standard" padding="1u">
                            <Rows spacing="0.5u" align="center">
                                <Text size="medium" alignment="center">
                                    {hiddenWishes.length}
                                </Text>
                                <Text size="xsmall" tone="tertiary" alignment="center">
                                    <FormattedMessage defaultMessage="Hidden" description="Hidden wishes" />
                                </Text>
                            </Rows>
                        </Box>
                    </Column>
                </Columns>

                {loading.wishes ? (
                    <LoadingIndicator size="medium" />
                ) : wishes.length === 0 ? (
                    <Box padding="2u" background="neutral" borderRadius="standard">
                        <Text alignment="center" tone="tertiary">
                            <FormattedMessage
                                defaultMessage="No wishes received yet."
                                description="No wishes message"
                            />
                        </Text>
                    </Box>
                ) : (
                    <Rows spacing="1.5u">
                        {wishes.map((wish) => (
                            <Box
                                key={wish._id}
                                border="standard"
                                borderRadius="standard"
                                padding="1.5u"
                                background={wish.isHidden ? "neutral" : undefined}
                            >
                                <Rows spacing="1u">
                                    <Columns spacing="1u" alignY="center">
                                        <Column>
                                            <Text size="small" variant="bold">
                                                {wish.guestName}
                                            </Text>
                                        </Column>
                                        <Column width="content">
                                            {wish.isHidden ? (
                                                <Badge text="Hidden" tone="assist" />
                                            ) : wish.isApproved ? (
                                                <Badge text="Visible" tone="assist" />
                                            ) : (
                                                <Badge text="Pending" tone="assist" />
                                            )}
                                        </Column>
                                    </Columns>

                                    <Text size="small">
                                        {wish.message}
                                    </Text>

                                    <Text size="xsmall" tone="tertiary">
                                        {formatDate(wish.createdAt)}
                                    </Text>

                                    <Columns spacing="0.5u">
                                        <Column>
                                            <Button
                                                variant={wish.isApproved ? "tertiary" : "secondary"}
                                                onClick={() => handleToggleApproval(wish._id)}
                                                stretch
                                            >
                                                {wish.isApproved
                                                    ? intl.formatMessage({ defaultMessage: "Unapprove", description: "Unapprove button" })
                                                    : intl.formatMessage({ defaultMessage: "Approve", description: "Approve button" })}
                                            </Button>
                                        </Column>
                                        <Column>
                                            <Button
                                                variant="tertiary"
                                                onClick={() => handleToggleVisibility(wish._id)}
                                                stretch
                                            >
                                                {wish.isHidden
                                                    ? intl.formatMessage({ defaultMessage: "Show", description: "Show button" })
                                                    : intl.formatMessage({ defaultMessage: "Hide", description: "Hide button" })}
                                            </Button>
                                        </Column>
                                    </Columns>
                                </Rows>
                            </Box>
                        ))}
                    </Rows>
                )}

                {wishesPagination && wishesPagination.pages > 1 && (
                    <Columns spacing="1u" align="center">
                        <Column width="content">
                            <Button
                                variant="tertiary"
                                disabled={wishesPagination.page <= 1}
                                onClick={() => loadWishes(currentWebsite._id, wishesPagination.page - 1)}
                            >
                                ← Prev
                            </Button>
                        </Column>
                        <Column width="content">
                            <Text size="small">
                                Page {wishesPagination.page} of {wishesPagination.pages}
                            </Text>
                        </Column>
                        <Column width="content">
                            <Button
                                variant="tertiary"
                                disabled={wishesPagination.page >= wishesPagination.pages}
                                onClick={() => loadWishes(currentWebsite._id, wishesPagination.page + 1)}
                            >
                                Next →
                            </Button>
                        </Column>
                    </Columns>
                )}
            </Rows>
        </Box>
    );
}
