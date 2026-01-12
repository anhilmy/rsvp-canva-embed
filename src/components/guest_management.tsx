import { useState, useEffect, useCallback } from "react";
import {
    Box,
    Rows,
    Columns,
    Column,
    Text,
    Title,
    Button,
    TextInput,
    NumberInput,
    FormField,
    Alert,
    LoadingIndicator,
    Badge,
    Accordion,
    AccordionItem,
    MultilineInput,
} from "@canva/app-ui-kit";
import { useIntl } from "react-intl";
import { useAppContext } from "../context";
import { generateInviteLink, type GuestWithRSVP } from "../api";

export function GuestManagement() {
    const intl = useIntl();
    const {
        state,
        loadGuests,
        createGuest,
        bulkCreateGuests,
        deleteGuest,
    } = useAppContext();
    const { currentWebsite, guests, guestsPagination, loading } = state;

    const [showAddForm, setShowAddForm] = useState(false);
    const [showBulkForm, setShowBulkForm] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        maxAttendees: 2,
    });
    const [bulkData, setBulkData] = useState("");
    const [submitLoading, setSubmitLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    // Load guests when website changes
    useEffect(() => {
        if (currentWebsite) {
            loadGuests(currentWebsite._id);
        }
    }, [currentWebsite, loadGuests]);

    const handleAddGuest = async () => {
        setSubmitLoading(true);
        try {
            await createGuest({
                name: formData.name,
                email: formData.email || undefined,
                phone: formData.phone || undefined,
                maxAttendees: formData.maxAttendees,
            });
            setFormData({ name: "", email: "", phone: "", maxAttendees: 2 });
            setShowAddForm(false);
            setSuccessMessage(
                intl.formatMessage({
                    defaultMessage: "Guest added successfully!",
                    description: "Success message after adding a guest",
                })
            );
        } catch {
            // Error handled by context
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleBulkAdd = async () => {
        setSubmitLoading(true);
        try {
            // Parse bulk data (one guest per line, format: name,email,phone,maxAttendees)
            const lines = bulkData.split("\n").filter((line) => line.trim());
            const newGuests = lines.map((line) => {
                const parts = line.split(",").map((p) => p.trim());
                return {
                    name: parts[0] || "",
                    email: parts[1] || undefined,
                    phone: parts[2] || undefined,
                    maxAttendees: parts[3] ? parseInt(parts[3], 10) : 2,
                };
            }).filter((g) => g.name);

            if (newGuests.length === 0) {
                throw new Error("Please enter at least one guest name");
            }

            await bulkCreateGuests(newGuests);
            setBulkData("");
            setShowBulkForm(false);
            setSuccessMessage(
                intl.formatMessage(
                    {
                        defaultMessage: "{count} guests added successfully!",
                        description: "Success message after bulk adding guests",
                    },
                    { count: newGuests.length }
                )
            );
        } catch {
            // Error handled by context
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDeleteGuest = async (guestId: string) => {
        if (!window.confirm("Are you sure you want to delete this guest?")) {
            return;
        }
        try {
            await deleteGuest(guestId);
        } catch {
            // Error handled by context
        }
    };

    const handleCopyLink = useCallback((guest: GuestWithRSVP) => {
        if (!currentWebsite) return;

        // Generate invite link (using placeholder URL for now)
        const websiteUrl = `https://${currentWebsite.publishId}.canva.site`;
        const link = generateInviteLink(websiteUrl, guest.uniqueCode, guest.name);

        navigator.clipboard.writeText(link).then(() => {
            setCopiedCode(guest.uniqueCode);
            setTimeout(() => setCopiedCode(null), 2000);
        });
    }, [currentWebsite]);

    const handleCopyCode = useCallback((code: string) => {
        navigator.clipboard.writeText(code).then(() => {
            setCopiedCode(code);
            setTimeout(() => setCopiedCode(null), 2000);
        });
    }, []);

    const getRSVPBadge = (guest: GuestWithRSVP) => {
        if (!guest.rsvp) {
            return <Badge text="Pending" tone="assist" />;
        }
        switch (guest.rsvp.status) {
            case "attending":
                return <Badge text={`Attending (${guest.rsvp.attendeeCount})`} tone="assist" />;
            case "not_attending":
                return <Badge text="Not Attending" tone="assist" />;
            case "maybe":
                return <Badge text="Maybe" tone="assist" />;
            default:
                return <Badge text="Unknown" tone="assist" />;
        }
    };

    if (!currentWebsite) {
        return (
            <Box padding="2u">
                <Alert tone="info">
                    {intl.formatMessage({
                        defaultMessage: "Please select or create a website first.",
                        description: "No website selected message",
                    })}
                </Alert>
            </Box>
        );
    }

    return (
        <Box padding="2u">
            <Rows spacing="2u">
                <Columns spacing="1u" alignY="center">
                    <Column>
                        <Title size="small">
                            {intl.formatMessage({
                                defaultMessage: "Guest List",
                                description: "Guest list section title",
                            })}
                        </Title>
                    </Column>
                    <Column width="content">
                        <Text size="small" tone="tertiary">
                            {guests.length} guests
                        </Text>
                    </Column>
                </Columns>

                {successMessage && (
                    <Alert tone="positive" onDismiss={() => setSuccessMessage(null)}>
                        {successMessage}
                    </Alert>
                )}

                <Rows spacing="1u">
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setShowAddForm(!showAddForm);
                            setShowBulkForm(false);
                        }}
                        stretch
                    >
                        {intl.formatMessage({
                            defaultMessage: "➕ Add Guest",
                            description: "Add guest button",
                        })}
                    </Button>
                    <Button
                        variant="tertiary"
                        onClick={() => {
                            setShowBulkForm(!showBulkForm);
                            setShowAddForm(false);
                        }}
                        stretch
                    >
                        {intl.formatMessage({
                            defaultMessage: "📋 Bulk Import",
                            description: "Bulk import button",
                        })}
                    </Button>
                </Rows>

                {showAddForm && (
                    <Box border="standard" borderRadius="standard" padding="2u">
                        <Rows spacing="1.5u">
                            <Text size="small" tone="tertiary">
                                {intl.formatMessage({
                                    defaultMessage: "Add a new guest",
                                    description: "Add guest form title",
                                })}
                            </Text>

                            <FormField
                                label={intl.formatMessage({ defaultMessage: "Name *", description: "Name field label" })}
                                control={(props) => (
                                    <TextInput
                                        {...props}
                                        value={formData.name}
                                        onChange={(value) => setFormData({ ...formData, name: value })}
                                        placeholder="John Doe"
                                    />
                                )}
                            />

                            <FormField
                                label={intl.formatMessage({ defaultMessage: "Email", description: "Email field label" })}
                                control={(props) => (
                                    <TextInput
                                        {...props}
                                        value={formData.email}
                                        onChange={(value) => setFormData({ ...formData, email: value })}
                                        placeholder="john@example.com"
                                    />
                                )}
                            />

                            <FormField
                                label={intl.formatMessage({ defaultMessage: "Phone", description: "Phone field label" })}
                                control={(props) => (
                                    <TextInput
                                        {...props}
                                        value={formData.phone}
                                        onChange={(value) => setFormData({ ...formData, phone: value })}
                                        placeholder="+1 234 567 8900"
                                        type="tel"
                                    />
                                )}
                            />

                            <FormField
                                label={intl.formatMessage({ defaultMessage: "Max Attendees", description: "Max attendees field label" })}
                                control={(props) => (
                                    <NumberInput
                                        {...props}
                                        value={formData.maxAttendees}
                                        onChange={(value) => setFormData({ ...formData, maxAttendees: value ?? 1 })}
                                        min={1}
                                        max={20}
                                        step={1}
                                        hasSpinButtons
                                        incrementAriaLabel="Increase"
                                        decrementAriaLabel="Decrease"
                                    />
                                )}
                            />

                            <Columns spacing="1u">
                                <Column>
                                    <Button
                                        variant="primary"
                                        onClick={handleAddGuest}
                                        loading={submitLoading}
                                        disabled={!formData.name}
                                        stretch
                                    >
                                        {intl.formatMessage({ defaultMessage: "Add", description: "Add button" })}
                                    </Button>
                                </Column>
                                <Column>
                                    <Button
                                        variant="tertiary"
                                        onClick={() => setShowAddForm(false)}
                                        stretch
                                    >
                                        {intl.formatMessage({ defaultMessage: "Cancel", description: "Cancel button" })}
                                    </Button>
                                </Column>
                            </Columns>
                        </Rows>
                    </Box>
                )}

                {showBulkForm && (
                    <Box border="standard" borderRadius="standard" padding="2u">
                        <Rows spacing="1.5u">
                            <Text size="small" tone="tertiary">
                                {intl.formatMessage({
                                    defaultMessage: "Add multiple guests at once. One guest per line.",
                                    description: "Bulk import description",
                                })}
                            </Text>
                            <Text size="xsmall" tone="tertiary">
                                {intl.formatMessage({
                                    defaultMessage: "Format: Name, Email (optional), Phone (optional), Max Attendees (optional)",
                                    description: "Bulk import format",
                                })}
                            </Text>

                            <FormField
                                label={intl.formatMessage({ defaultMessage: "Guest List", description: "Guest list field label" })}
                                control={(props) => (
                                    <MultilineInput
                                        {...props}
                                        value={bulkData}
                                        onChange={setBulkData}
                                        placeholder={`John Doe, john@email.com, +1234567890, 2
Jane Smith, jane@email.com
Bob Wilson`}
                                        minRows={5}
                                    />
                                )}
                            />

                            <Columns spacing="1u">
                                <Column>
                                    <Button
                                        variant="primary"
                                        onClick={handleBulkAdd}
                                        loading={submitLoading}
                                        disabled={!bulkData.trim()}
                                        stretch
                                    >
                                        {intl.formatMessage({ defaultMessage: "Import", description: "Import button" })}
                                    </Button>
                                </Column>
                                <Column>
                                    <Button
                                        variant="tertiary"
                                        onClick={() => setShowBulkForm(false)}
                                        stretch
                                    >
                                        {intl.formatMessage({ defaultMessage: "Cancel", description: "Cancel button" })}
                                    </Button>
                                </Column>
                            </Columns>
                        </Rows>
                    </Box>
                )}

                {loading.guests ? (
                    <LoadingIndicator size="medium" />
                ) : guests.length === 0 ? (
                    <Box padding="2u" background="neutral" borderRadius="standard">
                        <Text alignment="center" tone="tertiary">
                            {intl.formatMessage({
                                defaultMessage: "No guests yet. Add your first guest above!",
                                description: "No guests message",
                            })}
                        </Text>
                    </Box>
                ) : (
                    <Accordion>
                        {guests.map((guest) => (
                            <AccordionItem
                                key={guest._id}
                                title={guest.name}
                            >
                                <Rows spacing="1u">
                                    <Columns spacing="1u" alignY="center">
                                        <Column>
                                            <Text size="small" tone="tertiary">Status:</Text>
                                        </Column>
                                        <Column>
                                            {getRSVPBadge(guest)}
                                        </Column>
                                    </Columns>

                                    <Columns spacing="1u">
                                        <Column>
                                            <Text size="small" tone="tertiary">Code:</Text>
                                        </Column>
                                        <Column>
                                            <Text size="small">{guest.uniqueCode}</Text>
                                        </Column>
                                    </Columns>

                                    {guest.email && (
                                        <Columns spacing="1u">
                                            <Column>
                                                <Text size="small" tone="tertiary">Email:</Text>
                                            </Column>
                                            <Column>
                                                <Text size="small">{guest.email}</Text>
                                            </Column>
                                        </Columns>
                                    )}

                                    {guest.phone && (
                                        <Columns spacing="1u">
                                            <Column>
                                                <Text size="small" tone="tertiary">Phone:</Text>
                                            </Column>
                                            <Column>
                                                <Text size="small">{guest.phone}</Text>
                                            </Column>
                                        </Columns>
                                    )}

                                    <Columns spacing="1u">
                                        <Column>
                                            <Text size="small" tone="tertiary">Max Attendees:</Text>
                                        </Column>
                                        <Column>
                                            <Text size="small">{guest.maxAttendees}</Text>
                                        </Column>
                                    </Columns>

                                    <Rows spacing="0.5u">
                                        <Button
                                            variant="secondary"
                                            onClick={() => handleCopyLink(guest)}
                                            stretch
                                        >
                                            {copiedCode === guest.uniqueCode
                                                ? intl.formatMessage({ defaultMessage: "✓ Copied!", description: "Copied confirmation" })
                                                : intl.formatMessage({ defaultMessage: "📋 Copy Invite Link", description: "Copy invite link button" })}
                                        </Button>
                                        <Button
                                            variant="tertiary"
                                            onClick={() => handleCopyCode(guest.uniqueCode)}
                                            stretch
                                        >
                                            {intl.formatMessage({ defaultMessage: "Copy Code Only", description: "Copy code button" })}
                                        </Button>
                                        <Button
                                            variant="tertiary"
                                            onClick={() => handleDeleteGuest(guest._id)}
                                            stretch
                                        >
                                            {intl.formatMessage({ defaultMessage: "🗑️ Delete", description: "Delete guest button" })}
                                        </Button>
                                    </Rows>
                                </Rows>
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}

                {guestsPagination && guestsPagination.pages > 1 && (
                    <Columns spacing="1u" align="center">
                        <Column width="content">
                            <Button
                                variant="tertiary"
                                disabled={guestsPagination.page <= 1}
                                onClick={() => loadGuests(currentWebsite._id, guestsPagination.page - 1)}
                            >
                                ← Prev
                            </Button>
                        </Column>
                        <Column width="content">
                            <Text size="small">
                                Page {guestsPagination.page} of {guestsPagination.pages}
                            </Text>
                        </Column>
                        <Column width="content">
                            <Button
                                variant="tertiary"
                                disabled={guestsPagination.page >= guestsPagination.pages}
                                onClick={() => loadGuests(currentWebsite._id, guestsPagination.page + 1)}
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
