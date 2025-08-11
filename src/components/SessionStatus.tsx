import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Clock, Shield, AlertCircle } from "lucide-react";

const SessionStatus: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return null;
  }

  const formatTime = (timestamp: unknown) => {
    if (!timestamp) return "Never";
    try {
      // Handle Firestore Timestamp
      if (timestamp && typeof timestamp === "object" && "toDate" in timestamp) {
        const date = (timestamp as { toDate(): Date }).toDate();
        return date.toLocaleString();
      }
      // Handle regular Date objects or timestamps
      const date = new Date(timestamp as string | number | Date);
      return date.toLocaleString();
    } catch {
      return "Invalid date";
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black/80 backdrop-blur-sm rounded-lg p-3 border border-gray-700 max-w-xs">
      <div className="flex items-center space-x-2 mb-2">
        <Shield className="w-4 h-4 text-green-500" />
        <span className="text-xs font-semibold text-white">Session Status</span>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Status:</span>
          <Badge
            variant={user.isSessionValid ? "default" : "destructive"}
            className="text-xs"
          >
            {user.isSessionValid ? "Active" : "Invalid"}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-300">Last Login:</span>
          <span className="text-white">{formatTime(user.lastLoginAt)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-300">Session ID:</span>
          <span className="text-white font-mono text-xs">
            {user.sessionToken
              ? user.sessionToken.substring(0, 8) + "..."
              : "None"}
          </span>
        </div>

        {!user.isSessionValid && (
          <div className="flex items-center space-x-2 text-yellow-400">
            <AlertCircle className="w-3 h-3" />
            <span className="text-xs">
              Session invalidated from another device
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionStatus;
