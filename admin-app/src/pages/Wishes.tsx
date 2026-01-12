import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { wishApi, setApiKey, Wish } from "../api";

export const Wishes = () => {
  const { websiteId, apiKey } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (apiKey) {
      setApiKey(apiKey);
    }
  }, [apiKey]);

  const { data: wishes, isLoading } = useQuery({
    queryKey: ["wishes", websiteId],
    queryFn: () => wishApi.getAll(websiteId!),
    enabled: !!websiteId,
  });

  const hideMutation = useMutation({
    mutationFn: (wishId: string) => wishApi.hide(wishId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishes", websiteId] });
    },
  });

  const unhideMutation = useMutation({
    mutationFn: (wishId: string) => wishApi.unhide(wishId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishes", websiteId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (wishId: string) => wishApi.delete(wishId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishes", websiteId] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const wishList = wishes?.data || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Wishes</h1>

      {/* Wishes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wishList.map((wish: Wish) => (
          <div
            key={wish._id}
            className={`bg-white rounded-xl shadow p-4 ${
              wish.isHidden ? "opacity-60" : ""
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium text-gray-800">{wish.guestName}</p>
                <p className="text-xs text-gray-500">
                  {formatDate(wish.createdAt)}
                </p>
              </div>
              {wish.reportCount > 0 && (
                <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded">
                  {wish.reportCount} reports
                </span>
              )}
            </div>

            <p className="text-gray-600 mb-4">{wish.message}</p>

            {wish.isHidden && (
              <p className="text-sm text-yellow-600 mb-2">⚠️ Hidden from public</p>
            )}

            <div className="flex gap-2 justify-end">
              {wish.isHidden ? (
                <button
                  onClick={() => unhideMutation.mutate(wish._id)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Show
                </button>
              ) : (
                <button
                  onClick={() => hideMutation.mutate(wish._id)}
                  className="text-sm text-yellow-600 hover:text-yellow-800"
                >
                  Hide
                </button>
              )}
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to delete this wish?")) {
                    deleteMutation.mutate(wish._id);
                  }
                }}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {wishList.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow text-gray-500">
          No wishes yet. Your guests can submit wishes after RSVPing.
        </div>
      )}
    </div>
  );
};
