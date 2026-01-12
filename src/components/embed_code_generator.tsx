import { useState } from "react";
import {
    Box,
    Rows,
    Text,
    Title,
    Button,
    TextInput,
    Alert,
    Columns,
    Column,
} from "@canva/app-ui-kit";
import { useIntl } from "react-intl";
import type { Website } from "../api";

// Get the backend URL from webpack or default
declare const BACKEND_HOST: string | undefined;
const getBackendUrl = () => {
    return typeof BACKEND_HOST !== "undefined" ? BACKEND_HOST : "http://localhost:3001";
};

interface EmbedCodeGeneratorProps {
    website: Website;
}

export function EmbedCodeGenerator({ website }: EmbedCodeGeneratorProps) {
    const intl = useIntl();
    const [copiedType, setCopiedType] = useState<string | null>(null);

    const backendUrl = getBackendUrl();
    const publishId = website.publishId;

    // Generate embed codes
    const rsvpFormUrl = `${backendUrl}/api/embed/form/${publishId}`;
    const wishesWallUrl = `${backendUrl}/api/embed/wishes-wall/${publishId}`;

    const rsvpIframeCode = `<iframe src="${rsvpFormUrl}" width="100%" height="600" frameborder="0" style="border: none; max-width: 450px;"></iframe>`;
    const wishesIframeCode = `<iframe src="${wishesWallUrl}" width="100%" height="500" frameborder="0" style="border: none; max-width: 650px;"></iframe>`;

    const copyToClipboard = async (text: string, type: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedType(type);
            setTimeout(() => setCopiedType(null), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const openInNewTab = (url: string) => {
        window.open(url, "_blank");
    };

    return (
        <Box padding="2u" background="neutralLow" borderRadius="large">
            <Rows spacing="2u">
                <Title size="xsmall">
                    {intl.formatMessage({
                        defaultMessage: "Embed Codes",
                        description: "Embed codes section title",
                    })}
                </Title>

                <Text size="small" tone="tertiary">
                    {intl.formatMessage({
                        defaultMessage: "Copy these codes to embed the RSVP form and wishes wall on your website.",
                        description: "Embed codes description",
                    })}
                </Text>

                {/* RSVP Form Embed */}
                <Box padding="1u" background="neutralLow" borderRadius="standard">
                    <Rows spacing="1u">
                        <Text size="small">
                            <strong>{intl.formatMessage({
                                defaultMessage: "📝 RSVP Form",
                                description: "RSVP form embed label",
                            })}</strong>
                        </Text>
                        <Text size="xsmall" tone="tertiary">
                            {intl.formatMessage({
                                defaultMessage: "Collects guest name, attendance, number of guests, and optional wishes.",
                                description: "RSVP form description",
                            })}
                        </Text>
                        <TextInput
                            value={rsvpIframeCode}
                            onChange={() => { }}
                            disabled
                        />
                        <Columns spacing="1u">
                            <Column>
                                <Button
                                    variant="secondary"
                                    onClick={() => copyToClipboard(rsvpIframeCode, "rsvp")}
                                    stretch
                                >
                                    {copiedType === "rsvp"
                                        ? intl.formatMessage({ defaultMessage: "✓ Copied!", description: "Copied confirmation" })
                                        : intl.formatMessage({ defaultMessage: "Copy Code", description: "Copy code button" })}
                                </Button>
                            </Column>
                            <Column>
                                <Button
                                    variant="tertiary"
                                    onClick={() => openInNewTab(rsvpFormUrl)}
                                    stretch
                                >
                                    {intl.formatMessage({ defaultMessage: "Preview", description: "Preview button" })}
                                </Button>
                            </Column>
                        </Columns>
                    </Rows>
                </Box>

                {/* Wishes Wall Embed */}
                <Box padding="1u" background="neutralLow" borderRadius="standard">
                    <Rows spacing="1u">
                        <Text size="small">
                            <strong>{intl.formatMessage({
                                defaultMessage: "💝 Wishes Wall",
                                description: "Wishes wall embed label",
                            })}</strong>
                        </Text>
                        <Text size="xsmall" tone="tertiary">
                            {intl.formatMessage({
                                defaultMessage: "Displays approved wishes and messages from your guests.",
                                description: "Wishes wall description",
                            })}
                        </Text>
                        <TextInput
                            value={wishesIframeCode}
                            onChange={() => { }}
                            disabled
                        />
                        <Columns spacing="1u">
                            <Column>
                                <Button
                                    variant="secondary"
                                    onClick={() => copyToClipboard(wishesIframeCode, "wishes")}
                                    stretch
                                >
                                    {copiedType === "wishes"
                                        ? intl.formatMessage({ defaultMessage: "✓ Copied!", description: "Copied confirmation" })
                                        : intl.formatMessage({ defaultMessage: "Copy Code", description: "Copy code button" })}
                                </Button>
                            </Column>
                            <Column>
                                <Button
                                    variant="tertiary"
                                    onClick={() => openInNewTab(wishesWallUrl)}
                                    stretch
                                >
                                    {intl.formatMessage({ defaultMessage: "Preview", description: "Preview button" })}
                                </Button>
                            </Column>
                        </Columns>
                    </Rows>
                </Box>

                {/* Direct Links */}
                <Box padding="1u">
                    <Rows spacing="0.5u">
                        <Text size="xsmall">
                            <strong>{intl.formatMessage({
                                defaultMessage: "Direct Links",
                                description: "Direct links section title",
                            })}</strong>
                        </Text>
                        <Columns spacing="0.5u">
                            <Column>
                                <Button
                                    variant="tertiary"
                                    onClick={() => copyToClipboard(rsvpFormUrl, "rsvp-link")}
                                    stretch
                                >
                                    {copiedType === "rsvp-link"
                                        ? "✓ Copied!"
                                        : "Copy RSVP Link"}
                                </Button>
                            </Column>
                            <Column>
                                <Button
                                    variant="tertiary"
                                    onClick={() => copyToClipboard(wishesWallUrl, "wishes-link")}
                                    stretch
                                >
                                    {copiedType === "wishes-link"
                                        ? "✓ Copied!"
                                        : "Copy Wishes Link"}
                                </Button>
                            </Column>
                        </Columns>
                    </Rows>
                </Box>

                <Alert tone="info">
                    {intl.formatMessage({
                        defaultMessage: "Tip: Use the Canva website's 'Embed' element to add these iframes to your published site.",
                        description: "Embed tip message",
                    })}
                </Alert>
            </Rows>
        </Box>
    );
}
