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
      const timeDifference = currentTime.getTime() - lastScanTime.getTime();
      const hoursDifference = timeDifference / (1000 * 60 * 60);
      
      if (hoursDifference < 24) {
        const remainingHours = 24 - hoursDifference;
        const nextScanDate = new Date(lastScanTime.getTime() + (24 * 60 * 60 * 1000));
        
        // Format remaining time
        const hours = Math.floor(remainingHours);
        const minutes = Math.floor((remainingHours - hours) * 60);
        const seconds = Math.floor(((remainingHours - hours) * 60 - minutes) * 60);
        
        const remainingTimeStr = `${hours}h ${minutes}m ${seconds}s`;
        
        setState({
          canScan: false,
          nextScanTime: nextScanDate.toLocaleString(),
          remainingTime: remainingTimeStr,
          hoursRemaining: Math.ceil(remainingHours),
          isComplete: false,
        });
      } else {
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
