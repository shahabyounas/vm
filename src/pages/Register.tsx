import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name, email, and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await register(
        name.trim(),
        email.trim(),
        password.trim(),
        feedback.trim() || null
      );
      toast({
        title: "Welcome to Vape Master!",
        description: "Your loyalty card is ready!",
      });
      navigate("/dashboard");
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
        title: "Registration Failed",
        description: message,
        variant: "destructive",
      });
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
        <div className="p-6 flex items-center">
          <Link
            to="/"
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="ml-4 text-2xl font-bold text-white">
            Join Vape Master
          </h1>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-sm border border-red-900/30 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Create Account
              </h2>
              <p className="text-gray-400">Get your loyalty card in seconds</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="bg-black/50 border-red-900/50 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="bg-black/50 border-red-900/50 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="bg-black/50 border-red-900/50 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback" className="text-white font-medium">
                  Feedback{" "}
                  <span className="text-gray-500 text-sm">(Optional)</span>
                </Label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us how we can improve..."
                  className="bg-black/50 border-red-900/50 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500 min-h-[100px] resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? "Creating Account..." : "Get My Loyalty Card"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-red-400 hover:text-red-300 font-medium"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
