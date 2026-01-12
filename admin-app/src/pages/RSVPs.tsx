import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { rsvpApi, setApiKey, RSVP } from "../api";

export const RSVPs = () => {
  const { websiteId, apiKey } = useAuth();

  useEffect(() => {
    if (apiKey) {
      setApiKey(apiKey);
    }
  }, [apiKey]);

  const { data: rsvps, isLoading } = useQuery({
    queryKey: ["rsvps", websiteId],
    queryFn: () => rsvpApi.getAll(websiteId!),
    enabled: !!websiteId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const rsvpList = rsvps?.data || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">RSVPs</h1>

      {/* RSVP Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Guest
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Party Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Message
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rsvpList.map((rsvp: RSVP) => (
              <tr key={rsvp._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">
                    {rsvp.guestName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      rsvp.status === "attending"
                        ? "bg-green-100 text-green-800"
                        : rsvp.status === "maybe"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {rsvp.status === "attending"
                      ? "✓ Attending"
                      : rsvp.status === "maybe"
                      ? "? Maybe"
                      : "✗ Not Attending"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                  {rsvp.numberOfGuests} guest{rsvp.numberOfGuests > 1 ? "s" : ""}
                </td>
                <td className="px-6 py-4 max-w-xs truncate text-gray-600">
                  {rsvp.message || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(rsvp.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rsvpList.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No RSVPs yet. Share your event link with your guests!
          </div>
        )}
      </div>
    </div>
  );
};
