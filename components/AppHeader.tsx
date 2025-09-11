import React, { useState, useEffect } from "react";
import { User } from "../types";

interface AppHeaderProps {
  user: User;
  onLogout: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ user, onLogout }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <header className="bg-red-500 text-white p-3 flex justify-between items-center rounded-t-lg">
      <div className="text-left font-semibold">
        <div>{formatDate(currentTime)}</div>
        <div className="text-2xl">{formatTime(currentTime)}</div>
      </div>

      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-4xl font-bold">REMA</h1>
        </div>
      </div>

      <div className="text-right flex items-center gap-4">
        <div className="font-semibold">
          <div>{user.camion}</div>
          <div>{user.service}</div>
        </div>
        <button
          onClick={onLogout}
          className="bg-red-700 text-white font-semibold p-2 text-sm rounded-full hover:bg-red-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-500"
          aria-label="Se déconnecter"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V5h10a1 1 0 100-2H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default AppHeader;
