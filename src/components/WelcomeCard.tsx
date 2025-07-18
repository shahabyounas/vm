import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User as UserIcon } from "lucide-react";

interface WelcomeCardProps {
  user: { name: string };
  lastUpdateTime?: Date;
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({ user, lastUpdateTime }) => (
  <Card className="mb-6 bg-gray-900/80 backdrop-blur-sm border border-red-900/30 text-center relative overflow-hidden">
    {/* Subtle radial gradient accent */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          "radial-gradient(circle at 50% 0%, rgba(239,68,68,0.15) 0%, transparent 70%)",
      }}
    />
    <CardHeader className="relative z-10 flex flex-col items-center">
      <Avatar className="mb-2 h-16 w-16 border-2 border-red-500 shadow-lg">
        {/* If user has an avatar image, use AvatarImage here */}
        <AvatarFallback className="text-2xl bg-red-900/80 text-white">
          {user.name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase() || <UserIcon />}
        </AvatarFallback>
      </Avatar>
      <CardTitle className="text-white">Welcome, {user.name}!</CardTitle>
      <CardDescription>Your loyalty card is ready to use</CardDescription>
    </CardHeader>
    <CardContent className="relative z-10">
      {lastUpdateTime && (
        <div className="mt-2 flex items-center justify-center text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          Last updated: {lastUpdateTime.toLocaleTimeString()}
        </div>
      )}
    </CardContent>
  </Card>
);

export default WelcomeCard;
