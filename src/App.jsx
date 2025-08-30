import React, { useEffect, useState } from "react";
import Chat from "./components/Chat";

const App = () => {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOffline = () => {
      setOffline(true);
      console.log("offline");
    };

    const handleOnline = () => {
      setOffline(false);
      console.log("online");
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    // Cleanup
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (offline) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-100 text-red-800">
        <h1 className="text-2xl font-bold">No Internet Connection</h1>
        <p>Please check your network and try again.</p>
      </div>
    );
  }

  return (
    <div>
      <Chat />
    </div>
  );
};

export default App;
