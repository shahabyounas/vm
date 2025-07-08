import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import QRCode from "@/components/QRCode";
import { ArrowLeft } from 'lucide-react';
import Confetti from 'react-confetti';

// Add Tailwind keyframes for glowing ring animation
const ringAnimation = `
@keyframes ringPulse {
  0% { transform: scale(1); opacity: 0.7; }
  70% { transform: scale(2.5); opacity: 0.2; }
  100% { transform: scale(3); opacity: 0; }
}
`;

const Rewards = () => {
  const { user, useReward } = useAuth();
  const navigate = useNavigate();
  const [redeemed, setRedeemed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showRings, setShowRings] = useState(false);
  const [timer, setTimer] = useState(30);
  const [expired, setExpired] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [confettiBurst, setConfettiBurst] = useState(true);
  const confettiInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (!user.isRewardReady) {
      navigate('/dashboard');
    } else {
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 3000);
      // Start confetti bursts at intervals
      confettiInterval.current = setInterval(() => {
        setConfettiBurst(false);
        setTimeout(() => setConfettiBurst(true), 100);
      }, 3500);
    }
    return () => {
      if (confettiInterval.current) clearInterval(confettiInterval.current);
    };
  }, [user, navigate]);

  // Countdown timer effect
  useEffect(() => {
    if (!user || redeemed || expired) return;
    if (user.isRewardReady && timer > 0) {
      const interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && user.isRewardReady) {
      setExpired(true);
      setTimeout(() => {
        useReward();
        navigate('/dashboard');
      }, 2000);
    }
  }, [user, timer, redeemed, expired, useReward, navigate]);

  // Only show rings for 2.5s after scan/mark as used
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showRings) {
      timer = setTimeout(() => setShowRings(false), 2500);
    }
    return () => clearTimeout(timer);
  }, [showRings]);

  // Only show confetti for 2.5s after scan/mark as used
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showConfetti) {
      timer = setTimeout(() => setShowConfetti(false), 2500);
    }
    return () => clearTimeout(timer);
  }, [showConfetti]);

  if (!user || !user.isRewardReady) return null;

  if (expired) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-red-950">
        <div className="bg-gradient-to-r from-red-700/80 to-black/80 rounded-2xl p-10 shadow-2xl text-center">
          <div className="text-6xl mb-4">⏰</div>
          <h2 className="text-3xl font-bold text-white mb-2">Reward expired</h2>
          <p className="text-red-200 text-lg">Start collecting again.</p>
        </div>
      </div>
    );
  }

  const handleUseReward = () => {
    setShowRings(true);
    setShowConfetti(true);
    setTimeout(() => {
      setRedeemed(true);
      useReward();
    }, 2500); // Wait for animation before showing redeemed
  };

  if (redeemed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 flex flex-col items-center justify-center relative overflow-hidden">
        {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} numberOfPieces={400} recycle={false} />}
        <div className="bg-gradient-to-r from-green-600/80 to-green-400/80 backdrop-blur-sm border border-green-900/30 rounded-2xl p-10 shadow-2xl text-center">
          <div className="text-6xl mb-4">🥳</div>
          <h2 className="text-3xl font-bold text-white mb-2">Reward Redeemed!</h2>
          <p className="text-green-200 text-lg">Your reward has been used.</p>
          <p className="text-white/80 mt-2">Your scan count has been reset. Start earning your next reward!</p>
          <button
            className="mt-8 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg shadow-lg hover:from-red-700 hover:to-red-800 transition-all duration-300"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-black via-red-900 to-orange-900 animate-shimmer">
      {/* Keyframes for fire, shimmer, and lightning */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        .animate-shimmer {
          background-size: 200% 200%;
          animation: shimmer 8s linear infinite;
        }
        @keyframes fire {
          0% { transform: scaleY(1) translateY(0); opacity: 1; }
          50% { transform: scaleY(1.1) translateY(-10px); opacity: 0.85; }
          100% { transform: scaleY(1) translateY(0); opacity: 1; }
        }
        .fire-flame {
          animation: fire 1.2s infinite alternate cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes lightning {
          0%, 97%, 100% { opacity: 0; }
          98% { opacity: 1; }
          99% { opacity: 0.5; }
        }
        .lightning {
          animation: lightning 4s infinite;
        }
      `}</style>
      {/* Confetti burst at intervals */}
      {confettiBurst && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={180}
          recycle={false}
          colors={["#ef4444", "#fff", "#facc15", "#ff9800", "#a3e635"]}
          style={{ position: 'fixed', left: 0, top: 0, zIndex: 40 }}
        />
      )}
      {/* Lightning flashes */}
      <div className="pointer-events-none">
        <div className="absolute top-0 left-0 w-24 h-24 lightning" style={{boxShadow:'0 0 60px 20px #fff8'}} />
        <div className="absolute top-0 right-0 w-24 h-24 lightning" style={{boxShadow:'0 0 60px 20px #fff8'}} />
        <div className="absolute bottom-0 left-0 w-24 h-24 lightning" style={{boxShadow:'0 0 60px 20px #fff8'}} />
        <div className="absolute bottom-0 right-0 w-24 h-24 lightning" style={{boxShadow:'0 0 60px 20px #fff8'}} />
      </div>
      {/* Fire animation at the bottom */}
      <div className="absolute bottom-0 left-0 w-full flex justify-center items-end z-30 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="fire-flame"
            style={{
              width: `${16 + Math.random() * 16}px`,
              height: `${40 + Math.random() * 32}px`,
              marginLeft: 4,
              marginRight: 4,
              borderRadius: '50% 50% 40% 40%',
              background: `radial-gradient(circle at 50% 30%, #ff9800 60%, #ef4444 100%)`,
              opacity: 0.7 + Math.random() * 0.3,
              filter: 'blur(1.5px)',
              animationDelay: `${Math.random()}s`,
            }}
          />
        ))}
      </div>
      {/* Reward message */}
      <div className="relative z-20 bg-gradient-to-r from-red-700/80 to-black/80 rounded-2xl p-10 shadow-2xl text-center animate-bounceIn">
        <div className="text-6xl mb-4 animate-bounce">🎉</div>
        <h2 className="text-3xl font-extrabold text-white mb-2 animate-pulse drop-shadow-[0_0_16px_#ff9800]">You Got 20% OFF! 🎉</h2>
        <p className="text-red-200 text-lg mb-6 animate-fadeIn">Show this at checkout to redeem your reward.</p>
        <button
          className="mt-8 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg shadow-lg hover:from-red-700 hover:to-red-800 transition-all duration-300"
          onClick={() => {
            useReward();
            navigate('/dashboard');
          }}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Rewards;
