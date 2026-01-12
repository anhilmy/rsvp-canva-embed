import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { rsvpApi, guestApi, wishApi, setApiKey } from "../api";
import { useEffect } from "react";

export const Dashboard = () => {
  const { websiteId, apiKey } = useAuth();

  useEffect(() => {
    if (apiKey) {
      setApiKey(apiKey);
    }
  }, [apiKey]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["rsvp-stats", websiteId],
    queryFn: () => rsvpApi.getStats(websiteId!),
    enabled: !!websiteId,
  });

  const { data: guests, isLoading: guestsLoading } = useQuery({
    queryKey: ["guests", websiteId],
    queryFn: () => guestApi.getAll(websiteId!),
    enabled: !!websiteId,
  });

  const { data: wishes, isLoading: wishesLoading } = useQuery({
    queryKey: ["wishes", websiteId],
    queryFn: () => wishApi.getAll(websiteId!),
    enabled: !!websiteId,
  });

  const isLoading = statsLoading || guestsLoading || wishesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const rsvpStats = stats?.data || {
    attending: 0,
    notAttending: 0,
    maybe: 0,
    pending: 0,
    totalGuests: 0,
  };

  const totalGuests = guests?.data?.length || 0;
  const totalWishes = wishes?.data?.length || 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Guests</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{totalGuests}</p>
        </div>
        <div className="bg-green-50 rounded-xl shadow p-6">
          <h3 className="text-sm font-medium text-green-600">Attending</h3>
          <p className="text-3xl font-bold text-green-700 mt-2">
            {rsvpStats.attending}
          </p>
          <p className="text-sm text-green-600 mt-1">
            {rsvpStats.totalGuests} total guests expected
          </p>
        </div>
        <div className="bg-yellow-50 rounded-xl shadow p-6">
          <h3 className="text-sm font-medium text-yellow-600">Maybe</h3>
          <p className="text-3xl font-bold text-yellow-700 mt-2">
            {rsvpStats.maybe}
          </p>
        </div>
        <div className="bg-red-50 rounded-xl shadow p-6">
          <h3 className="text-sm font-medium text-red-600">Not Attending</h3>
          <p className="text-3xl font-bold text-red-700 mt-2">
            {rsvpStats.notAttending}
          </p>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Response Rate
          </h3>
          <div className="flex items-center">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600"
                  style={{
                    width: `${
                      totalGuests > 0
                        ? ((totalGuests - rsvpStats.pending) / totalGuests) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
            <span className="ml-4 text-lg font-semibold text-gray-700">
              {totalGuests > 0
                ? Math.round(
                    ((totalGuests - rsvpStats.pending) / totalGuests) * 100
                  )
                : 0}
              %
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {rsvpStats.pending} guests haven't responded yet
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Wishes Received
          </h3>
          <p className="text-3xl font-bold text-purple-600">{totalWishes}</p>
          <p className="text-sm text-gray-500 mt-2">
            Messages from your guests
          </p>
        </div>
      </div>
    </div>
  );
};
