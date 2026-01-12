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
import { adminApi, api } from "../../../api/rsvp-client";

interface RSVPSummary {
  total: number;
  responded: number;
  pending: number;
  attending: number;
  notAttending: number;
  maybe: number;
}

interface RSVPEntry {
  _id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  guestId: {
    _id: string;
    name: string;
    email?: string;
  };
}

interface RSVPTabProps {
  websiteId: string;
}

export const RSVPTab = ({ websiteId }: RSVPTabProps) => {
  const [summary, setSummary] = useState<RSVPSummary | null>(null);
  const [rsvps, setRsvps] = useState<RSVPEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [summaryResult, rsvpsResult] = await Promise.all([
          api.getRSVPStatus(websiteId),
          adminApi.getRSVPs(websiteId),
        ]);

        if (summaryResult.success && summaryResult.data) {
          setSummary(summaryResult.data);
        }

        if (rsvpsResult.success && rsvpsResult.data) {
          setRsvps(rsvpsResult.data);
        }
      } catch (err) {
        setError("Failed to load RSVP data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [websiteId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "attending":
        return <Badge tone="positive" text="Attending" />;
      case "not_attending":
        return <Badge tone="critical" text="Not Attending" />;
      case "maybe":
        return <Badge tone="warn" text="Maybe" />;
      default:
        return <Badge tone="info" text="Unknown" />;
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

  if (loading) {
    return (
      <Box padding="2u">
        <Rows spacing="1u" align="center">
          <LoadingIndicator size="medium" />
          <Text>Loading RSVPs...</Text>
        </Rows>
      </Box>
    );
  }

  return (
    <Rows spacing="2u">
      <Title size="small">RSVP Dashboard</Title>

      {summary && (
        <Box padding="2u" background="neutralLow" borderRadius="large">
          <Rows spacing="2u">
            <Columns spacing="2u">
              <Box padding="1u" background="surface" borderRadius="standard">
                <Rows spacing="0.5u" align="center">
                  <Text size="large" variant="bold">
                    {summary.total}
                  </Text>
                  <Text size="small" tone="tertiary">Total Guests</Text>
                </Rows>
              </Box>
              <Box padding="1u" background="surface" borderRadius="standard">
                <Rows spacing="0.5u" align="center">
                  <Text size="large" variant="bold">
                    {summary.responded}
                  </Text>
                  <Text size="small" tone="tertiary">Responded</Text>
                </Rows>
              </Box>
              <Box padding="1u" background="surface" borderRadius="standard">
                <Rows spacing="0.5u" align="center">
                  <Text size="large" variant="bold">
                    {summary.pending}
                  </Text>
                  <Text size="small" tone="tertiary">Pending</Text>
                </Rows>
              </Box>
            </Columns>

            <Columns spacing="2u">
              <Rows spacing="0.5u" align="center">
                <Badge tone="positive" text={`${summary.attending} Attending`} />
              </Rows>
              <Rows spacing="0.5u" align="center">
                <Badge tone="warn" text={`${summary.maybe} Maybe`} />
              </Rows>
              <Rows spacing="0.5u" align="center">
                <Badge tone="critical" text={`${summary.notAttending} Not Attending`} />
              </Rows>
            </Columns>
          </Rows>
        </Box>
      )}

      <Title size="xsmall">Response History</Title>

      {rsvps.length === 0 ? (
        <Box padding="2u" background="neutralLow" borderRadius="large">
          <Text tone="tertiary">No responses yet.</Text>
        </Box>
      ) : (
        <Rows spacing="1u">
          {rsvps.map((rsvp) => (
            <Box
              key={rsvp._id}
              padding="2u"
              background="neutralLow"
              borderRadius="standard"
            >
              <Columns spacing="2u" alignY="center">
                <Rows spacing="0.5u">
                  <Text variant="bold">{rsvp.guestId?.name || "Unknown"}</Text>
                  {rsvp.guestId?.email && (
                    <Text size="small" tone="tertiary">
                      {rsvp.guestId.email}
                    </Text>
                  )}
                </Rows>
                <Box>{getStatusBadge(rsvp.status)}</Box>
                <Text size="small" tone="tertiary">
                  {formatDate(rsvp.createdAt)}
                </Text>
              </Columns>
            </Box>
          ))}
        </Rows>
      )}
    </Rows>
  );
};
