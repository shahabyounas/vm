
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import QRCode from "@/components/QRCode";
import { ArrowLeft } from 'lucide-react';

const Rewards = () => {
  const { user, useReward } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (!user.isRewardReady) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (!user || !user.isRewardReady) return null;

  const handleUseReward = () => {
    useReward();
    toast({
      title: "Reward Used! 🎉",
      description: "Your points have been reset. Start earning your next reward!",
    });
    setTimeout(() => navigate('/dashboard'), 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 relative overflow-hidden">
      {/* Enhanced background effects for celebration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-red-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-20 right-10 w-40 h-40 bg-yellow-500 rounded-full blur-3xl animate-pulse delay-300"></div>
        <div className="absolute bottom-32 left-10 w-36 h-36 bg-red-600 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-yellow-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-red-700 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="p-6 flex items-center">
          <Link to="/dashboard" className="text-red-400 hover:text-red-300 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="ml-4 text-2xl font-bold text-white">Your Reward</h1>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-md mx-auto text-center space-y-6">
            {/* Celebration Header */}
            <div className="bg-gradient-to-r from-red-600/80 to-yellow-500/80 backdrop-blur-sm border border-red-900/30 rounded-2xl p-8 shadow-2xl">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Reward Unlocked!
              </h2>
              <p className="text-yellow-200 text-lg">
                Congratulations {user.name}!
              </p>
              <p className="text-white/80 mt-2">
                You've completed 5 purchases and earned your reward!
              </p>
            </div>

            {/* Reward QR Code */}
            <div className="bg-gray-900/80 backdrop-blur-sm border border-red-900/30 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Redemption Code</h3>
              <QRCode 
                value={`REWARD:${user.email}:${user.id}:${Date.now()}`}
                size={200}
              />
              <p className="text-gray-400 text-sm mt-4">
                Show this QR code to redeem your reward
              </p>
            </div>

            {/* Reward Details */}
            <div className="bg-gray-900/80 backdrop-blur-sm border border-red-900/30 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Your Reward</h3>
              <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-4 text-white">
                <div className="text-2xl font-bold mb-1">20% OFF</div>
                <p className="text-red-100">Your next purchase</p>
              </div>
            </div>

            {/* Action Button */}
            <div className="space-y-4">
              <Button
                onClick={handleUseReward}
                className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Mark as Used
              </Button>
              
              <p className="text-gray-400 text-sm">
                This will reset your point counter and start earning toward your next reward
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rewards;
