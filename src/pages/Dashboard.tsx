
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import QRCode from "@/components/QRCode";
import { ArrowLeft } from 'lucide-react';

const Dashboard = () => {
  const { user, addPurchase, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  const progressPercentage = (user.purchases / 5) * 100;
  const purchasesRemaining = Math.max(0, 5 - user.purchases);

  const handleAddPurchase = () => {
    addPurchase();
    if (user.purchases + 1 >= 5) {
      toast({
        title: "Reward Unlocked! 🎉",
        description: "You've earned a reward! Check your rewards page.",
      });
      setTimeout(() => navigate('/rewards'), 1500);
    } else {
      toast({
        title: "Purchase Added!",
        description: `${4 - user.purchases} more purchases until your next reward!`,
      });
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "Thanks for visiting Vape Master!",
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-10 w-40 h-40 bg-red-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 left-10 w-32 h-32 bg-red-600 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-red-400 hover:text-red-300 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="ml-4 text-2xl font-bold text-white">Dashboard</h1>
          </div>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
          >
            Logout
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-6 pb-6">
          <div className="max-w-md mx-auto space-y-6">
            {/* Welcome Section */}
            <div className="bg-gray-900/80 backdrop-blur-sm border border-red-900/30 rounded-2xl p-6 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                Welcome, {user.name}!
              </h2>
              <p className="text-gray-400">Your loyalty card is ready to use</p>
            </div>

            {/* Progress Section */}
            <div className="bg-gray-900/80 backdrop-blur-sm border border-red-900/30 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Your Progress</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-white">
                  <span className="font-medium">Purchases</span>
                  <span className="text-red-400 font-bold">{user.purchases} of 5</span>
                </div>
                
                <Progress 
                  value={progressPercentage} 
                  className="h-3"
                />
                
                {purchasesRemaining > 0 ? (
                  <p className="text-gray-400 text-sm text-center">
                    {purchasesRemaining} more purchase{purchasesRemaining !== 1 ? 's' : ''} until your next reward!
                  </p>
                ) : (
                  <p className="text-red-400 font-semibold text-center">
                    🎉 Reward Ready! Visit the rewards page.
                  </p>
                )}
              </div>
            </div>

            {/* QR Code Section */}
            <div className="bg-gray-900/80 backdrop-blur-sm border border-red-900/30 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4 text-center">Your Loyalty Card</h3>
              <QRCode 
                value={`LOYALTY:${user.email}:${user.id}`}
                size={200}
              />
              <p className="text-gray-400 text-sm text-center mt-4">
                Show this QR code at checkout
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                onClick={handleAddPurchase}
                className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Add Purchase
              </Button>

              {user.isRewardReady && (
                <Link to="/rewards" className="block">
                  <Button 
                    variant="outline"
                    className="w-full py-4 text-lg font-semibold border-2 border-red-500 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 transform hover:scale-105"
                  >
                    View Reward 🎁
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
