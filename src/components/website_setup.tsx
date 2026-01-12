import { useState } from "react";
import {
    Box,
    Rows,
    Text,
    Title,
    Button,
    TextInput,
    MultilineInput,
    FormField,
    Alert,
    Select,
    LoadingIndicator,
} from "@canva/app-ui-kit";
import { useIntl } from "react-intl";
import { useAppContext } from "../context";

export function WebsiteSetup() {
    const intl = useIntl();
    const {
        state,
        createWebsite,
        updateWebsite,
        deleteWebsite,
        selectWebsite,
        setActiveView,
    } = useAppContext();
    const { websites, currentWebsite, loading } = state;

    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({
        publishId: "",
        name: "",
        description: "",
        eventDate: "",
    });
    const [submitLoading, setSubmitLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleCreateNew = () => {
        setIsCreating(true);
        setFormData({ publishId: "", name: "", description: "", eventDate: "" });
        selectWebsite(null);
    };

    const handleSelectWebsite = (value: string) => {
        if (value === "new") {
            handleCreateNew();
        } else {
            const website = websites.find((w) => w._id === value);
            if (website) {
                selectWebsite(website);
                setIsCreating(false);
                setFormData({
                    publishId: website.publishId,
                    name: website.name,
                    description: website.description || "",
                    eventDate: website.eventDate || "",
                });
            }
        }
    };

    const handleSubmit = async () => {
        setSubmitLoading(true);
        setSuccessMessage(null);
        try {
            if (isCreating) {
                const website = await createWebsite(formData);
                selectWebsite(website);
                setIsCreating(false);
                setSuccessMessage(
                    intl.formatMessage({
                        defaultMessage: "Website created successfully!",
                        description: "Success message after creating a website",
                    })
                );
            } else if (currentWebsite) {
                await updateWebsite(currentWebsite._id, formData);
                setSuccessMessage(
                    intl.formatMessage({
                        defaultMessage: "Website updated successfully!",
                        description: "Success message after updating a website",
                    })
                );
            }
        } catch {
            // Error is handled by context
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!currentWebsite) return;
        if (!window.confirm("Are you sure you want to delete this website? This will also delete all guests, RSVPs, and wishes.")) {
            return;
        }
        setSubmitLoading(true);
        try {
            await deleteWebsite(currentWebsite._id);
            setFormData({ publishId: "", name: "", description: "", eventDate: "" });
            setSuccessMessage(
                intl.formatMessage({
                    defaultMessage: "Website deleted successfully!",
                    description: "Success message after deleting a website",
                })
            );
        } catch {
            // Error is handled by context
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleContinue = () => {
        if (currentWebsite) {
            setActiveView("guests");
        }
    };

    const websiteOptions = [
        { value: "new", label: intl.formatMessage({ defaultMessage: "➕ Create New Website", description: "Create new website option" }) },
        ...websites.map((w) => ({ value: w._id, label: w.name })),
    ];

    const selectedValue = isCreating ? "new" : currentWebsite?._id || "";

    return (
        <Box padding="2u">
            <Rows spacing="2u">
                <Title size="small">
                    {intl.formatMessage({
                        defaultMessage: "Website Setup",
                        description: "Website setup section title",
                    })}
                </Title>

                <Text size="small" tone="tertiary">
                    {intl.formatMessage({
                        defaultMessage: "Register your Canva-published website to enable RSVP and wishes collection.",
                        description: "Website setup description",
                    })}
                </Text>

                {successMessage && (
                    <Alert tone="positive" onDismiss={() => setSuccessMessage(null)}>
                        {successMessage}
                    </Alert>
                )}

                {loading.websites ? (
                    <LoadingIndicator size="medium" />
                ) : (
                    <>
                        <FormField
                            label={intl.formatMessage({
                                defaultMessage: "Select Website",
                                description: "Website selector label",
                            })}
                            control={(props) => (
                                <Select
                                    {...props}
                                    options={websiteOptions}
                                    value={selectedValue}
                                    onChange={handleSelectWebsite}
                                    placeholder={intl.formatMessage({
                                        defaultMessage: "Choose a website or create new",
                                        description: "Website selector placeholder",
                                    })}
                                />
                            )}
                        />

                        {(isCreating || currentWebsite) && (
                            <>
                                <FormField
                                    label={intl.formatMessage({
                                        defaultMessage: "Publish ID",
                                        description: "Publish ID field label",
                                    })}
                                    description={intl.formatMessage({
                                        defaultMessage: "The unique identifier from your published Canva website URL (e.g., 'my-wedding' from https://my-wedding.canva.site)",
                                        description: "Publish ID field description",
                                    })}
                                    control={(props) => (
                                        <TextInput
                                            {...props}
                                            value={formData.publishId}
                                            onChange={(value) => setFormData({ ...formData, publishId: value })}
                                            placeholder="my-wedding"
                                            disabled={!isCreating}
                                        />
                                    )}
                                />

                                <FormField
                                    label={intl.formatMessage({
                                        defaultMessage: "Event Name",
                                        description: "Event name field label",
                                    })}
                                    control={(props) => (
                                        <TextInput
                                            {...props}
                                            value={formData.name}
                                            onChange={(value) => setFormData({ ...formData, name: value })}
                                            placeholder={intl.formatMessage({
                                                defaultMessage: "John & Jane's Wedding",
                                                description: "Event name placeholder",
                                            })}
                                        />
                                    )}
                                />

                                <FormField
                                    label={intl.formatMessage({
                                        defaultMessage: "Event Date (YYYY-MM-DD)",
                                        description: "Event date field label",
                                    })}
                                    control={(props) => (
                                        <TextInput
                                            {...props}
                                            value={formData.eventDate}
                                            onChange={(value) => setFormData({ ...formData, eventDate: value })}
                                            placeholder="2025-06-15"
                                        />
                                    )}
                                />

                                <FormField
                                    label={intl.formatMessage({
                                        defaultMessage: "Description (optional)",
                                        description: "Description field label",
                                    })}
                                    control={(props) => (
                                        <MultilineInput
                                            {...props}
                                            value={formData.description}
                                            onChange={(value) => setFormData({ ...formData, description: value })}
                                            placeholder={intl.formatMessage({
                                                defaultMessage: "Add a description for your event...",
                                                description: "Description placeholder",
                                            })}
                                            minRows={2}
                                        />
                                    )}
                                />

                                <Rows spacing="1u">
                                    <Button
                                        variant="primary"
                                        onClick={handleSubmit}
                                        loading={submitLoading}
                                        disabled={!formData.publishId || !formData.name}
                                        stretch
                                    >
                                        {isCreating
                                            ? intl.formatMessage({
                                                defaultMessage: "Create Website",
                                                description: "Create website button",
                                            })
                                            : intl.formatMessage({
                                                defaultMessage: "Update Website",
                                                description: "Update website button",
                                            })}
                                    </Button>

                                    {currentWebsite && (
                                        <>
                                            <Button
                                                variant="secondary"
                                                onClick={handleContinue}
                                                stretch
                                            >
                                                {intl.formatMessage({
                                                    defaultMessage: "Continue to Guests →",
                                                    description: "Continue to guests button",
                                                })}
                                            </Button>

                                            <Button
                                                variant="tertiary"
                                                onClick={handleDelete}
                                                loading={submitLoading}
                                                stretch
                                            >
                                                {intl.formatMessage({
                                                    defaultMessage: "Delete Website",
                                                    description: "Delete website button",
                                                })}
                                            </Button>
                                        </>
                                    )}
                                </Rows>
                            </>
                        )}
                    </>
                )}
            </Rows>
        </Box>
    );
}
