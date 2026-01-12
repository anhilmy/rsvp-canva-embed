import { useEffect } from "react";
import {
    Box,
    Rows,
    Columns,
    Column,
    Text,
    Title,
    LoadingIndicator,
    Alert,
    ProgressBar,
    Badge,
    Accordion,
    AccordionItem,
} from "@canva/app-ui-kit";
import { FormattedMessage } from "react-intl";
import { useAppContext } from "../context";

export function RSVPStatus() {
    const { state, loadRSVPStats, loadGuests } = useAppContext();
    const { currentWebsite, rsvpStats, guests, loading } = state;

    // Load data when website changes
    useEffect(() => {
        if (currentWebsite) {
            loadRSVPStats(currentWebsite._id);
            loadGuests(currentWebsite._id);
        }
    }, [currentWebsite, loadRSVPStats, loadGuests]);

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

    if (loading.rsvpStats) {
        return (
            <Box padding="2u">
                <Rows spacing="2u" align="center">
                    <LoadingIndicator size="medium" />
                </Rows>
            </Box>
        );
    }

    const stats = rsvpStats || {
        total: 0,
        attending: 0,
        notAttending: 0,
        maybe: 0,
        pending: 0,
        totalAttendees: 0,
    };

    const responseRate = stats.total > 0
        ? Math.round(((stats.attending + stats.notAttending + stats.maybe) / stats.total) * 100)
        : 0;

    const attendingPercent = stats.total > 0 ? (stats.attending / stats.total) * 100 : 0;

    // Separate guests by status
    const attendingGuests = guests.filter((g) => g.rsvp?.status === "attending");
    const notAttendingGuests = guests.filter((g) => g.rsvp?.status === "not_attending");
    const maybeGuests = guests.filter((g) => g.rsvp?.status === "maybe");
    const pendingGuests = guests.filter((g) => !g.rsvp);

    return (
        <Box padding="2u">
            <Rows spacing="2u">
                <Title size="small">
                    <FormattedMessage
                        defaultMessage="RSVP Overview"
                        description="RSVP overview title"
                    />
                </Title>

                {/* Stats Cards */}
                <Box background="neutral" borderRadius="standard" padding="2u">
                    <Rows spacing="1.5u">
                        <Columns spacing="2u">
                            <Column>
                                <Rows spacing="0.5u" align="center">
                                    <Text size="large" alignment="center">
                                        {stats.totalAttendees}
                                    </Text>
                                    <Text size="xsmall" tone="tertiary" alignment="center">
                                        <FormattedMessage
                                            defaultMessage="Total Attendees"
                                            description="Total attendees label"
                                        />
                                    </Text>
                                </Rows>
                            </Column>
                            <Column>
                                <Rows spacing="0.5u" align="center">
                                    <Text size="large" alignment="center">
                                        {responseRate}%
                                    </Text>
                                    <Text size="xsmall" tone="tertiary" alignment="center">
                                        <FormattedMessage
                                            defaultMessage="Response Rate"
                                            description="Response rate label"
                                        />
                                    </Text>
                                </Rows>
                            </Column>
                        </Columns>

                        <Rows spacing="0.5u">
                            <Columns spacing="1u" alignY="center">
                                <Column>
                                    <Text size="small">
                                        <FormattedMessage
                                            defaultMessage="Attending"
                                            description="Attending label"
                                        />
                                    </Text>
                                </Column>
                                <Column width="content">
                                    <Badge text={String(stats.attending)} tone="assist" />
                                </Column>
                            </Columns>
                            <ProgressBar value={attendingPercent} />
                        </Rows>
                    </Rows>
                </Box>

                {/* Status Breakdown */}
                <Rows spacing="1u">
                    <Columns spacing="1u">
                        <Column>
                            <Box background="neutral" borderRadius="standard" padding="1.5u">
                                <Rows spacing="0.5u" align="center">
                                    <Text size="large" alignment="center">
                                        ✓ {stats.attending}
                                    </Text>
                                    <Text size="xsmall" tone="tertiary" alignment="center">
                                        <FormattedMessage defaultMessage="Attending" description="Attending" />
                                    </Text>
                                </Rows>
                            </Box>
                        </Column>
                        <Column>
                            <Box background="neutral" borderRadius="standard" padding="1.5u">
                                <Rows spacing="0.5u" align="center">
                                    <Text size="large" alignment="center">
                                        ✗ {stats.notAttending}
                                    </Text>
                                    <Text size="xsmall" tone="tertiary" alignment="center">
                                        <FormattedMessage defaultMessage="Not Attending" description="Not attending" />
                                    </Text>
                                </Rows>
                            </Box>
                        </Column>
                    </Columns>

                    <Columns spacing="1u">
                        <Column>
                            <Box background="neutral" borderRadius="standard" padding="1.5u">
                                <Rows spacing="0.5u" align="center">
                                    <Text size="large" alignment="center">
                                        ? {stats.maybe}
                                    </Text>
                                    <Text size="xsmall" tone="tertiary" alignment="center">
                                        <FormattedMessage defaultMessage="Maybe" description="Maybe" />
                                    </Text>
                                </Rows>
                            </Box>
                        </Column>
                        <Column>
                            <Box background="neutral" borderRadius="standard" padding="1.5u">
                                <Rows spacing="0.5u" align="center">
                                    <Text size="large" alignment="center">
                                        ⏳ {stats.pending}
                                    </Text>
                                    <Text size="xsmall" tone="tertiary" alignment="center">
                                        <FormattedMessage defaultMessage="Pending" description="Pending" />
                                    </Text>
                                </Rows>
                            </Box>
                        </Column>
                    </Columns>
                </Rows>

                {/* Guest List by Status */}
                <Accordion>
                    <AccordionItem title={`✓ Attending (${attendingGuests.length})`}>
                        {attendingGuests.length === 0 ? (
                            <Text size="small" tone="tertiary">
                                <FormattedMessage defaultMessage="No guests attending yet" description="No attending guests" />
                            </Text>
                        ) : (
                            <Rows spacing="1u">
                                {attendingGuests.map((guest) => (
                                    <Columns key={guest._id} spacing="1u" alignY="center">
                                        <Column>
                                            <Text size="small">{guest.name}</Text>
                                        </Column>
                                        <Column width="content">
                                            <Text size="small" tone="tertiary">
                                                {guest.rsvp?.attendeeCount} people
                                            </Text>
                                        </Column>
                                    </Columns>
                                ))}
                            </Rows>
                        )}
                    </AccordionItem>

                    <AccordionItem title={`✗ Not Attending (${notAttendingGuests.length})`}>
                        {notAttendingGuests.length === 0 ? (
                            <Text size="small" tone="tertiary">
                                <FormattedMessage defaultMessage="No declines" description="No declined guests" />
                            </Text>
                        ) : (
                            <Rows spacing="1u">
                                {notAttendingGuests.map((guest) => (
                                    <Text key={guest._id} size="small">
                                        {guest.name}
                                    </Text>
                                ))}
                            </Rows>
                        )}
                    </AccordionItem>

                    <AccordionItem title={`? Maybe (${maybeGuests.length})`}>
                        {maybeGuests.length === 0 ? (
                            <Text size="small" tone="tertiary">
                                <FormattedMessage defaultMessage="No maybes" description="No maybe guests" />
                            </Text>
                        ) : (
                            <Rows spacing="1u">
                                {maybeGuests.map((guest) => (
                                    <Columns key={guest._id} spacing="1u" alignY="center">
                                        <Column>
                                            <Text size="small">{guest.name}</Text>
                                        </Column>
                                        <Column width="content">
                                            <Text size="small" tone="tertiary">
                                                {guest.rsvp?.attendeeCount} people
                                            </Text>
                                        </Column>
                                    </Columns>
                                ))}
                            </Rows>
                        )}
                    </AccordionItem>

                    <AccordionItem title={`⏳ Pending (${pendingGuests.length})`}>
                        {pendingGuests.length === 0 ? (
                            <Text size="small" tone="tertiary">
                                <FormattedMessage defaultMessage="All guests have responded!" description="All responded" />
                            </Text>
                        ) : (
                            <Rows spacing="1u">
                                {pendingGuests.map((guest) => (
                                    <Text key={guest._id} size="small">
                                        {guest.name}
                                    </Text>
                                ))}
                            </Rows>
                        )}
                    </AccordionItem>
                </Accordion>
            </Rows>
        </Box>
    );
}
