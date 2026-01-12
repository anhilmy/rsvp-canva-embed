import { useState, useEffect } from "react";
import {
  Box,
  Rows,
  Columns,
  Column,
  Text,
  Title,
  LoadingIndicator,
} from "@canva/app-ui-kit";
import { api } from "../../../api/rsvp-client";

interface RSVPStats {
  attending: number;
  notAttending: number;
  maybe: number;
  pending: number;
  totalGuests: number;
}

interface RSVPStatusProps {
  websiteId: string;
}

export const RSVPStatus = ({ websiteId }: RSVPStatusProps) => {
  const [stats, setStats] = useState<RSVPStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await api.getRSVPStats(websiteId);
        if (result.success && result.data) {
          setStats(result.data);
        }
      } catch (err) {
        console.error("Failed to fetch RSVP stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [websiteId]);

  if (loading) {
    return (
      <Box padding="1u">
        <LoadingIndicator size="small" />
      </Box>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Box padding="2u" background="neutralLow" borderRadius="large">
      <Rows spacing="1.5u">
        <Title size="xsmall">RSVP Summary</Title>

        <Columns spacing="2u">
          <Column>
            <Box padding="1u" background="neutralLow" borderRadius="standard">
              <Rows spacing="0.5u" align="center">
                <Title size="small">✓ {stats.attending}</Title>
                <Text size="xsmall">Attending</Text>
              </Rows>
            </Box>
          </Column>

          <Column>
            <Box padding="1u" background="neutralLow" borderRadius="standard">
              <Rows spacing="0.5u" align="center">
                <Title size="small">? {stats.maybe}</Title>
                <Text size="xsmall">Maybe</Text>
              </Rows>
            </Box>
          </Column>

          <Column>
            <Box padding="1u" background="neutralLow" borderRadius="standard">
              <Rows spacing="0.5u" align="center">
                <Title size="small">✗ {stats.notAttending}</Title>
                <Text size="xsmall">Declined</Text>
              </Rows>
            </Box>
          </Column>
        </Columns>

        <Text size="xsmall" tone="tertiary" alignment="center">
          {stats.totalGuests} total guests expected
        </Text>
      </Rows>
    </Box>
  );
};
