import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/utils";
import { checkUserExistsByEmail } from "@/db/adapter";
import { trackPageView } from "@/lib/analytics";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    trackPageView("Forgot Password");
  }, []);

  // Clear error when user starts typing
  useEffect(() => {
    if (error) {
      setError("");
    }
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email.trim()) {
      setError("Please enter your email address.");
      trackEvent("forgot_password_missing_email");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      trackEvent("forgot_password_attempt", { email: email.trim() });

      // Check if user exists in our system
      const userExists = await checkUserExistsByEmail(email.trim());

      if (!userExists) {
        setError(
          "No account found with this email address. Please check your email or create a new account."
        );
        trackEvent("forgot_password_user_not_found", { email: email.trim() });
        return;
      }

      // User exists, send reset email
      await sendPasswordResetEmail(auth, email.trim());

      setSuccess(true);
      trackEvent("forgot_password_success", { email: email.trim() });
    } catch (error: unknown) {
      let message = "Unable to send reset email. Please try again.";

      if (
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof (error as { message?: unknown }).message === "string"
      ) {
        const errorMessage = (error as { message: string }).message;

        // Provide user-friendly error messages
        if (errorMessage.includes("user-not-found")) {
          message =
            "No account found with this email address. Please check your email or create a new account.";
        } else if (errorMessage.includes("invalid-email")) {
          message = "Please enter a valid email address.";
        } else if (errorMessage.includes("too-many-requests")) {
          message =
            "Too many reset attempts. Please wait a few minutes and try again.";
        } else if (errorMessage.includes("network")) {
          message =
            "Connection error. Please check your internet connection and try again.";
        } else {
          message = "Unable to send reset email. Please try again.";
        }
      }

      setError(message);
      trackEvent("forgot_password_failed", {
        email: email.trim(),
        error: (error as { message: string }).message,
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
        <div className="p-6">
          <Link
            to="/login"
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
                <div className="flex items-center justify-center mb-4">
                  <Mail className="w-12 h-12 text-red-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Reset Password
                </h1>
                <p className="text-gray-400">
                  Enter your email address and we'll send you a link to reset
                  your password.
                </p>
              </div>

              {!success ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Error Display */}
                  {error && (
                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                      <p className="text-red-300 text-sm">{error}</p>
                      {error.includes("No account found") && (
                        <div className="mt-3 pt-3 border-t border-red-500/30">
                          <p className="text-gray-300 text-sm mb-2">
                            Don't have an account yet?
                          </p>
                          <Link
                            to="/register"
                            className="text-red-400 hover:text-red-300 transition-colors font-semibold text-sm"
                          >
                            Create a new account
                          </Link>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className={`bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-red-500 ${
                        error ? "border-red-500" : ""
                      }`}
                      required
                      autoComplete="email"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>
              ) : (
                <div className="text-center space-y-6">
                  <div className="flex items-center justify-center mb-4">
                    <CheckCircle className="w-16 h-16 text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-2">
                      Check Your Email
                    </h2>
                    <p className="text-gray-300 mb-4">
                      We've sent a password reset link to:
                    </p>
                    <p className="text-red-400 font-medium mb-6">{email}</p>
                    <p className="text-gray-400 text-sm">
                      Click the link in the email to reset your password. The
                      link will expire in 1 hour.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={() => {
                        setSuccess(false);
                        setEmail("");
                      }}
                      className="w-full py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold"
                    >
                      Send to Different Email
                    </Button>

                    <Link
                      to="/login"
                      className="block w-full py-3 bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800/50 rounded-lg font-semibold transition-colors"
                    >
                      Back to Login
                    </Link>
                  </div>
                </div>
              )}

              <div className="mt-6 text-center">
                <p className="text-gray-400">
                  Remember your password?{" "}
                  <Link
                    to="/login"
                    className="text-red-400 hover:text-red-300 transition-colors font-semibold"
                  >
                    Sign in
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

export default ForgotPassword;
