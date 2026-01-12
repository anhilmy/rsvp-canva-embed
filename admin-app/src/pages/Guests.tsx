import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { guestApi, setApiKey, Guest } from "../api";

export const Guests = () => {
  const { websiteId, apiKey } = useAuth();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGuests, setNewGuests] = useState("");

  useEffect(() => {
    if (apiKey) {
      setApiKey(apiKey);
    }
  }, [apiKey]);

  const { data: guests, isLoading } = useQuery({
    queryKey: ["guests", websiteId],
    queryFn: () => guestApi.getAll(websiteId!),
    enabled: !!websiteId,
  });

  const addMutation = useMutation({
    mutationFn: (guestList: Array<{ name: string }>) =>
      guestApi.add(websiteId!, guestList),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guests", websiteId] });
      setShowAddModal(false);
      setNewGuests("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (guestId: string) => guestApi.delete(guestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guests", websiteId] });
    },
  });

  const handleAddGuests = () => {
    const guestList = newGuests
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((name) => ({ name }));

    if (guestList.length > 0) {
      addMutation.mutate(guestList);
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const guestList = guests?.data || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Guest List</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Guests
        </button>
      </div>

      {/* Guest Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Invite Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {guestList.map((guest: Guest) => (
              <tr key={guest._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{guest.name}</div>
                  {guest.email && (
                    <div className="text-sm text-gray-500">{guest.email}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                      {guest.inviteCode}
                    </code>
                    <button
                      onClick={() => copyInviteCode(guest.inviteCode)}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                      title="Copy code"
                    >
                      📋
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {guest.hasRsvp ? (
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        guest.rsvpStatus === "attending"
                          ? "bg-green-100 text-green-800"
                          : guest.rsvpStatus === "maybe"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {guest.rsvpStatus}
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => deleteMutation.mutate(guest._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {guestList.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No guests yet. Click "Add Guests" to get started.
          </div>
        )}
      </div>

      {/* Add Guest Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Add Guests</h2>
            <p className="text-sm text-gray-500 mb-4">
              Enter guest names, one per line. Invite codes will be generated
              automatically.
            </p>
            <textarea
              value={newGuests}
              onChange={(e) => setNewGuests(e.target.value)}
              placeholder="John Smith&#10;Jane Doe&#10;Bob Johnson"
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddGuests}
                disabled={addMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {addMutation.isPending ? "Adding..." : "Add Guests"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
