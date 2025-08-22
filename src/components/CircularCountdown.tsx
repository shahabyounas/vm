import React from "react";

interface CircularCountdownProps {
  remainingTime: string;
  hoursRemaining: number;
  totalHours: number;
  size?: number;
  strokeWidth?: number;
  isComplete?: boolean;
}

const CircularCountdown: React.FC<CircularCountdownProps> = ({
  remainingTime,
  hoursRemaining,
  totalHours = 24,
  size = 120,
  strokeWidth = 8,
  isComplete = false,
}) => {
  const radius = (size - strokeWidth) / 2;

  // Calculate individual hand rotation angles
  const totalSeconds = hoursRemaining * 3600; // Convert hours to seconds
  const remainingHours = Math.floor(totalSeconds / 3600);
  const remainingMinutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  // Calculate hand angles (each hand moves at different speeds)
  // For countdown: start at 12 o'clock and move clockwise
  const hourAngle = ((24 - remainingHours) % 12) * 30; // 12 hours = 360 degrees
  const minuteAngle = ((60 - remainingMinutes) % 60) * 6; // 60 minutes = 360 degrees
  const secondAngle = ((60 - remainingSeconds) % 60) * 6; // 60 seconds = 360 degrees

  // Parse time components for better display
  const timeParts = remainingTime.split(" ");
  const hours = timeParts.find(part => part.includes("h")) || "0h";
  const minutes = timeParts.find(part => part.includes("m")) || "0m";
  const seconds = timeParts.find(part => part.includes("s")) || "0s";

  return (
    <div className="relative flex items-center justify-center">
      {/* Timer container with classic timer styling */}
      <div className={`relative ${isComplete ? "animate-bounce" : ""}`}>
        <svg width={size} height={size}>
          {/* Outer ring - timer border */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius + 4}
            stroke="rgba(239, 68, 68, 0.3)"
            strokeWidth={2}
            fill="none"
          />

          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Timer markers - hour indicators */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const x1 = size / 2 + (radius - 8) * Math.cos(angle);
            const y1 = size / 2 + (radius - 8) * Math.sin(angle);
            const x2 = size / 2 + (radius - 2) * Math.cos(angle);
            const y2 = size / 2 + (radius - 2) * Math.sin(angle);

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(239, 68, 68, 0.4)"
                strokeWidth={2}
              />
            );
          })}

          {/* Hour hand - moves slowly */}
          <g transform={`rotate(${hourAngle}, ${size / 2}, ${size / 2})`}>
            {/* Hour hand shadow */}
            <line
              x1={size / 2}
              y1={size / 2}
              x2={size / 2}
              y2={size / 2 - radius * 0.5}
              stroke="rgba(0, 0, 0, 0.5)"
              strokeWidth={8}
              strokeLinecap="round"
              transform="translate(2, 2)"
            />
            {/* Hour hand */}
            <line
              x1={size / 2}
              y1={size / 2}
              x2={size / 2}
              y2={size / 2 - radius * 0.5}
              stroke="url(#redGradient)"
              strokeWidth={6}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out drop-shadow-lg"
            />
          </g>

          {/* Minute hand - moves faster */}
          <g transform={`rotate(${minuteAngle}, ${size / 2}, ${size / 2})`}>
            {/* Minute hand shadow */}
            <line
              x1={size / 2}
              y1={size / 2}
              x2={size / 2}
              y2={size / 2 - radius * 0.7}
              stroke="rgba(0, 0, 0, 0.5)"
              strokeWidth={6}
              strokeLinecap="round"
              transform="translate(1, 1)"
            />
            {/* Minute hand */}
            <line
              x1={size / 2}
              y1={size / 2}
              x2={size / 2}
              y2={size / 2 - radius * 0.7}
              stroke="url(#redGradient)"
              strokeWidth={4}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out drop-shadow-lg"
            />
          </g>

          {/* Second hand - moves fastest */}
          <g transform={`rotate(${secondAngle}, ${size / 2}, ${size / 2})`}>
            {/* Second hand shadow */}
            <line
              x1={size / 2}
              y1={size / 2}
              x2={size / 2}
              y2={size / 2 - radius * 0.8}
              stroke="rgba(0, 0, 0, 0.5)"
              strokeWidth={4}
              strokeLinecap="round"
              transform="translate(1, 1)"
            />
            {/* Second hand */}
            <line
              x1={size / 2}
              y1={size / 2}
              x2={size / 2}
              y2={size / 2 - radius * 0.8}
              stroke="url(#redGradient)"
              strokeWidth={3}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out drop-shadow-lg"
            />
            {/* Second hand tip */}
            <circle
              cx={size / 2}
              cy={size / 2 - radius * 0.8}
              r={4}
              fill="url(#redGradient)"
              stroke="rgba(0, 0, 0, 0.3)"
              strokeWidth={1}
              className="transition-all duration-1000 ease-out"
            />
          </g>

          {/* Center dot */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={6}
            fill="url(#redGradient)"
            stroke="rgba(255, 255, 255, 0.5)"
            strokeWidth={2}
          />

          {/* Gradient definitions */}
          <defs>
            <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
          </defs>
        </svg>

        {/* Timer display - centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Main time display */}
          <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-3 border border-red-500/30 shadow-lg">
            <div className="text-2xl font-bold text-red-400 font-mono tracking-wider">
              {hours}
            </div>
            <div className="text-sm text-red-300 font-mono text-center">
              {minutes} {seconds}
            </div>
          </div>
        </div>
      </div>

      {/* Timer glow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500/20 to-red-600/20 blur-xl scale-110"></div>
    </div>
  );
};

export default CircularCountdown;
