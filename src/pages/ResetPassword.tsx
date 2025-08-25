import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff, Lock, CheckCircle } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/lib/utils";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const navigate = useNavigate();

  const oobCode = searchParams.get("oobCode");

  useEffect(() => {
    trackEvent("page_view", { page: "ResetPassword" });
  }, []);

  // Validate reset token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!oobCode) {
        setError("Invalid reset link. Please request a new password reset.");
        setIsValidating(false);
        return;
      }

      try {
        await verifyPasswordResetCode(auth, oobCode);
        setIsValidToken(true);
      } catch (error: unknown) {
        let message =
          "Invalid or expired reset link. Please request a new password reset.";

        if (
          error &&
          typeof error === "object" &&
          "message" in error &&
          typeof (error as { message?: unknown }).message === "string"
        ) {
          const errorMessage = (error as { message: string }).message;

          if (errorMessage.includes("expired")) {
            message =
              "This reset link has expired. Please request a new password reset.";
          } else if (errorMessage.includes("invalid")) {
            message =
              "Invalid reset link. Please request a new password reset.";
          }
        }

        setError(message);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [oobCode]);

  // Clear error when user starts typing
  useEffect(() => {
    if (error) {
      setError("");
    }
  }, [password, confirmPassword]);

  const validatePassword = (password: string) => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password.trim()) {
      setError("Please enter a new password.");
      return;
    }

    if (!confirmPassword.trim()) {
      setError("Please confirm your new password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setError(passwordErrors[0]);
      return;
    }

    setIsLoading(true);
    try {
      trackEvent("reset_password_attempt");

      await confirmPasswordReset(auth, oobCode!, password);

      setSuccess(true);
      trackEvent("reset_password_success");
    } catch (error: unknown) {
      let message = "Unable to reset password. Please try again.";

      if (
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof (error as { message?: unknown }).message === "string"
      ) {
        const errorMessage = (error as { message: string }).message;

        if (errorMessage.includes("expired")) {
          message =
            "This reset link has expired. Please request a new password reset.";
        } else if (errorMessage.includes("invalid")) {
          message = "Invalid reset link. Please request a new password reset.";
        } else if (errorMessage.includes("weak-password")) {
          message = "Password is too weak. Please choose a stronger password.";
        } else if (errorMessage.includes("network")) {
          message =
            "Connection error. Please check your internet connection and try again.";
        }
      }

      setError(message);
      trackEvent("reset_password_failed", {
        error: (error as { message: string }).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 relative overflow-hidden">
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-white text-lg">Validating reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 relative overflow-hidden">
        <div className="relative z-10 min-h-screen flex flex-col">
          <div className="p-6">
            <Link
              to="/login"
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
          </div>

          <div className="flex-1 flex items-center justify-center px-6">
            <div className="w-full max-w-md">
              <div className="bg-gray-900/80 backdrop-blur-sm border border-red-900/30 rounded-2xl p-8 shadow-2xl text-center">
                <div className="text-red-400 text-6xl mb-4">⚠️</div>
                <h1 className="text-2xl font-bold text-white mb-4">
                  Invalid Reset Link
                </h1>
                <p className="text-gray-300 mb-6">{error}</p>
                <Link
                  to="/forgot-password"
                  className="inline-block bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Request New Reset Link
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              {!success ? (
                <>
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                      <Lock className="w-12 h-12 text-red-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      Set New Password
                    </h1>
                    <p className="text-gray-400">
                      Enter your new password below.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Error Display */}
                    {error && (
                      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                        <p className="text-red-300 text-sm">{error}</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-white">
                        New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="Enter your new password"
                          className={`bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-red-500 pr-12 ${
                            error ? "border-red-500" : ""
                          }`}
                          required
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-white">
                        Confirm New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          placeholder="Confirm your new password"
                          className={`bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-red-500 pr-12 ${
                            error ? "border-red-500" : ""
                          }`}
                          required
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold"
                      disabled={isLoading}
                    >
                      {isLoading ? "Resetting..." : "Reset Password"}
                    </Button>
                  </form>
                </>
              ) : (
                <div className="text-center space-y-6">
                  <div className="flex items-center justify-center mb-4">
                    <CheckCircle className="w-16 h-16 text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-2">
                      Password Reset Successfully!
                    </h2>
                    <p className="text-gray-300 mb-6">
                      Your password has been updated. You can now sign in with
                      your new password.
                    </p>
                  </div>

                  <Link
                    to="/login"
                    className="inline-block w-full py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition-colors"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
