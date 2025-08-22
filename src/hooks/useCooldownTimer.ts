import { useState, useEffect } from "react";
import { Timestamp } from "firebase/firestore";

interface CooldownState {
  canScan: boolean;
  nextScanTime: string | null;
  remainingTime: string | null;
  hoursRemaining: number;
  isComplete: boolean;
}

export const useCooldownTimer = (lastScanAt?: Timestamp): CooldownState => {
  const [state, setState] = useState<CooldownState>({
    canScan: true,
    nextScanTime: null,
    remainingTime: null,
    hoursRemaining: 0,
    isComplete: false,
  });

  useEffect(() => {
    if (!lastScanAt) {
      setState({
        canScan: true,
        nextScanTime: null,
        remainingTime: null,
        hoursRemaining: 0,
        isComplete: false,
      });
      return;
    }

    const updateCooldown = () => {
      const lastScanTime = lastScanAt.toDate();
      const currentTime = new Date();
      
      // Get today's midnight (12:00 AM)
      const todayMidnight = new Date(currentTime);
      todayMidnight.setHours(0, 0, 0, 0);
      
      // Get tomorrow's midnight (12:00 AM)
      const tomorrowMidnight = new Date(todayMidnight);
      tomorrowMidnight.setDate(tomorrowMidnight.getDate() + 1);
      
      // Check if we're still in the same day as the last scan
      const lastScanDate = new Date(lastScanTime);
      lastScanDate.setHours(0, 0, 0, 0);
      
      const isSameDay = lastScanDate.getTime() === todayMidnight.getTime();
      
      if (isSameDay) {
        // Still in cooldown - calculate time until midnight
        const timeUntilMidnight = tomorrowMidnight.getTime() - currentTime.getTime();
        const hoursUntilMidnight = timeUntilMidnight / (1000 * 60 * 60);
        
        // Format remaining time
        const hours = Math.floor(hoursUntilMidnight);
        const minutes = Math.floor((hoursUntilMidnight - hours) * 60);
        const seconds = Math.floor(((hoursUntilMidnight - hours) * 60 - minutes) * 60);
        
        const remainingTimeStr = `${hours}h ${minutes}m ${seconds}s`;
        
        setState({
          canScan: false,
          nextScanTime: tomorrowMidnight.toLocaleString(),
          remainingTime: remainingTimeStr,
          hoursRemaining: Math.ceil(hoursUntilMidnight),
          isComplete: false,
        });
        
      } else {
        // New day - cooldown reset
        setState({
          canScan: true,
          nextScanTime: null,
          remainingTime: null,
          hoursRemaining: 0,
          isComplete: true,
        });
      }
    };

    // Update immediately
    updateCooldown();
    
    // Update every second for countdown
    const interval = setInterval(updateCooldown, 1000);
    
    return () => clearInterval(interval);
  }, [lastScanAt]);

  return state;
};
