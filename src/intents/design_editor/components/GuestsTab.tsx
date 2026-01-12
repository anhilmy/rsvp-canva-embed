import { useState, useEffect } from "react";
import {
  Box,
  Rows,
  Columns,
  Text,
  Title,
  TextInput,
  Button,
  Alert,
  LoadingIndicator,
  Badge,
  TrashIcon,
  PlusIcon,
} from "@canva/app-ui-kit";
import { adminApi } from "../../../api/rsvp-client";

interface Guest {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  inviteCode: string;
  rsvpStatus: string;
  createdAt: string;
}

interface GuestsTabProps {
  websiteId: string;
}

export const GuestsTab = ({ websiteId }: GuestsTabProps) => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGuest, setNewGuest] = useState({ name: "", email: "", phone: "" });
  const [adding, setAdding] = useState(false);
  const [bulkInput, setBulkInput] = useState("");
  const [showBulkAdd, setShowBulkAdd] = useState(false);

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const result = await adminApi.getGuests(websiteId);
      if (result.success && result.data) {
        setGuests(result.data);
      } else {
        setError(result.error || "Failed to load guests");
      }
    } catch (err) {
      setError("Failed to load guests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, [websiteId]);

  const handleAddGuest = async () => {
    if (!newGuest.name.trim()) {
      setError("Guest name is required");
      return;
    }

    setAdding(true);
    setError(null);

    try {
      const result = await adminApi.addGuests(websiteId, [
        {
          name: newGuest.name.trim(),
          email: newGuest.email.trim() || undefined,
          phone: newGuest.phone.trim() || undefined,
        },
      ]);

      if (result.success) {
        setNewGuest({ name: "", email: "", phone: "" });
        setShowAddForm(false);
        fetchGuests();
      } else {
        setError(result.error || "Failed to add guest");
      }
    } catch (err) {
      setError("Failed to add guest");
    } finally {
      setAdding(false);
    }
  };

  const handleBulkAdd = async () => {
    const lines = bulkInput.split("\n").filter((line) => line.trim());
    if (lines.length === 0) {
      setError("Please enter at least one guest");
      return;
    }

    setAdding(true);
    setError(null);

    try {
      const guests = lines
        .map((line) => {
          const parts = line.split(",").map((p) => p.trim());
          return {
            name: parts[0] || "",
            email: parts[1] || undefined,
            phone: parts[2] || undefined,
          };
        })
        .filter((g) => g.name);

      const result = await adminApi.addGuests(websiteId, guests);

      if (result.success) {
        setBulkInput("");
        setShowBulkAdd(false);
        fetchGuests();
      } else {
        setError(result.error || "Failed to add guests");
      }
    } catch (err) {
      setError("Failed to add guests");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteGuest = async (guestId: string) => {
    if (!confirm("Are you sure you want to remove this guest?")) {
      return;
    }

    try {
      const result = await adminApi.deleteGuest(guestId);
      if (result.success) {
        fetchGuests();
      } else {
        setError(result.error || "Failed to delete guest");
      }
    } catch (err) {
      setError("Failed to delete guest");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "attending":
        return <Badge tone="positive" text="Attending" />;
      case "not_attending":
        return <Badge tone="critical" text="Not Attending" />;
      case "maybe":
        return <Badge tone="warn" text="Maybe" />;
      default:
        return <Badge tone="info" text="Pending" />;
    }
  };

  if (loading) {
    return (
      <Box padding="2u">
        <Rows spacing="1u" align="center">
          <LoadingIndicator size="medium" />
          <Text>Loading guests...</Text>
        </Rows>
      </Box>
    );
  }

  return (
    <Rows spacing="2u">
      <Columns spacing="1u" alignY="center">
        <Title size="small">Guests ({guests.length})</Title>
        <Box>
          <Button
            variant="secondary"
            icon={() => <PlusIcon />}
            onClick={() => {
              setShowAddForm(!showAddForm);
              setShowBulkAdd(false);
            }}
          >
            Add Guest
          </Button>
          {" "}
          <Button
            variant="tertiary"
            onClick={() => {
              setShowBulkAdd(!showBulkAdd);
              setShowAddForm(false);
            }}
          >
            Bulk Add
          </Button>
        </Box>
      </Columns>

      {error && (
        <Alert tone="critical" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      {showAddForm && (
        <Box padding="2u" background="neutralLow" borderRadius="large">
          <Rows spacing="1.5u">
            <Title size="xsmall">Add New Guest</Title>
            <TextInput
              placeholder="Name *"
              value={newGuest.name}
              onChange={(value) => setNewGuest({ ...newGuest, name: value })}
            />
            <TextInput
              placeholder="Email (optional)"
              value={newGuest.email}
              onChange={(value) => setNewGuest({ ...newGuest, email: value })}
            />
            <TextInput
              placeholder="Phone (optional)"
              value={newGuest.phone}
              onChange={(value) => setNewGuest({ ...newGuest, phone: value })}
            />
            <Columns spacing="1u">
              <Button
                variant="primary"
                onClick={handleAddGuest}
                loading={adding}
              >
                Add
              </Button>
              <Button
                variant="tertiary"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
            </Columns>
          </Rows>
        </Box>
      )}

      {showBulkAdd && (
        <Box padding="2u" background="neutralLow" borderRadius="large">
          <Rows spacing="1.5u">
            <Title size="xsmall">Bulk Add Guests</Title>
            <Text size="small">
              Enter one guest per line: Name, Email, Phone (comma separated)
            </Text>
            <textarea
              style={{
                width: "100%",
                minHeight: "120px",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                fontFamily: "inherit",
              }}
              placeholder={`John Doe, john@email.com, +1234567890
Jane Smith, jane@email.com
Guest Name`}
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
            />
            <Columns spacing="1u">
              <Button
                variant="primary"
                onClick={handleBulkAdd}
                loading={adding}
              >
                Add All
              </Button>
              <Button
                variant="tertiary"
                onClick={() => setShowBulkAdd(false)}
              >
                Cancel
              </Button>
            </Columns>
          </Rows>
        </Box>
      )}

      {guests.length === 0 ? (
        <Box padding="3u" background="neutralLow" borderRadius="large">
          <Rows spacing="1u" align="center">
            <Text>No guests added yet.</Text>
            <Text size="small" tone="tertiary">
              Add guests to start collecting RSVPs.
            </Text>
          </Rows>
        </Box>
      ) : (
        <Box>
          {guests.map((guest) => (
            <Box
              key={guest.id}
              padding="2u"
              background="neutralLow"
              borderRadius="standard"
            >
              <Columns spacing="2u" alignY="center">
                <Rows spacing="0.5u">
                  <Text variant="bold">{guest.name}</Text>
                  <Text size="small" tone="tertiary">
                    Code: {guest.inviteCode}
                  </Text>
                  {guest.email && (
                    <Text size="small" tone="tertiary">{guest.email}</Text>
                  )}
                </Rows>
                <Box>{getStatusBadge(guest.rsvpStatus)}</Box>
                <Button
                  variant="tertiary"
                  icon={() => <TrashIcon />}
                  onClick={() => handleDeleteGuest(guest.id)}
                />
              </Columns>
            </Box>
          ))}
        </Box>
      )}
    </Rows>
  );
};
