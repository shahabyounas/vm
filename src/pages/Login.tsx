import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    trackEvent("page_view", { page: "Login" });
  }, []);

  // PublicRoute component handles redirects for authenticated users
  // No need for manual redirect logic here

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your email and password.",
        variant: "destructive",
      });
      trackEvent("login_missing_info");
      return;
    }
    setIsLoading(true);
    try {
      trackEvent("login_attempt", { email });
      const user = await login(email.trim(), password.trim());
      if (user) {
        toast({
          title: "Welcome back!",
          description: `Good to see you again, ${user.name}!`,
        });
        trackEvent("login_success", { user_id: user.id, user_role: user.role });
        // Redirect to the page they were trying to access, or dashboard
        const from = location.state?.from?.pathname || "/dashboard";
        navigate(from, { replace: true });
      } else {
        toast({
          title: "User Not Found",
          description:
            "No account found with this email. Please register first.",
          variant: "destructive",
        });
        trackEvent("login_user_not_found", { email });
      }
    } catch (error: unknown) {
      let message = "Please try again.";
      if (
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof (error as { message?: unknown }).message === "string"
      ) {
        message = (error as { message: string }).message;
      }
      toast({
        title: "Login Failed",
        description: message,
        variant: "destructive",
      });
      trackEvent("login_failed", { email, error: message });
    } finally {
      setIsLoading(false);
    }
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
        <div className="p-6">
          <Link
            to="/"
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-md">
            <div className="bg-gray-900/80 backdrop-blur-sm border border-red-900/30 rounded-2xl p-8 shadow-2xl">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                  Welcome Back
                </h1>
                <p className="text-gray-400">Sign in to your loyalty account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-red-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-red-500"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-400">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-red-400 hover:text-red-300 transition-colors font-semibold"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
