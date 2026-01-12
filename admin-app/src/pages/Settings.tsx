import { useAuth } from "../context/AuthContext";

export const Settings = () => {
  const { websiteId, apiKey } = useAuth();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

      <div className="bg-white rounded-xl shadow p-6 max-w-2xl">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Event Credentials
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Share the Website ID with your guests so they can access the RSVP
          form. Keep the API Key private - it's used to access admin features.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website ID (Event Code)
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-gray-100 px-4 py-2 rounded-lg text-sm font-mono">
                {websiteId}
              </code>
              <button
                onClick={() => copyToClipboard(websiteId || "")}
                className="px-4 py-2 text-blue-600 hover:text-blue-800"
              >
                Copy
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Share this with guests to access the RSVP form
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-gray-100 px-4 py-2 rounded-lg text-sm font-mono">
                {apiKey?.slice(0, 8)}...{apiKey?.slice(-8)}
              </code>
              <button
                onClick={() => copyToClipboard(apiKey || "")}
                className="px-4 py-2 text-blue-600 hover:text-blue-800"
              >
                Copy
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Keep this private - required for admin access
            </p>
          </div>
        </div>

        <hr className="my-6" />

        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Canva Integration
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          To set up the RSVP form in Canva:
        </p>
        <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
          <li>Open your Canva design</li>
          <li>Add the RSVP & Wishes app</li>
          <li>Enter your Website ID when prompted</li>
          <li>Publish your design as a website</li>
          <li>Share the link with your guests</li>
        </ol>
      </div>
    </div>
  );
};
