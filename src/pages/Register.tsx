import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Eye, EyeOff, Shield, AlertTriangle } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import {
  checkRateLimit,
  checkRequestThrottle,
  validatePasswordStrength,
  validateEmail,
  validatePhoneNumber,
  validateName,
  logSecurityEvent,
  getClientIdentifier,
} from "@/lib/security";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string[]>
  >({});
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);

  // Honeypot fields (hidden from users but visible to bots)
  const [honeypotWebsite, setHoneypotWebsite] = useState("");
  const [honeypotCompany, setHoneypotCompany] = useState("");

  const { register, user, loading } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    trackEvent("page_view", { page: "Register" });

    // Security: Log page visit
    logSecurityEvent("registration_page_visit", {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });
  }, []);

  // Real-time validation
  useEffect(() => {
    const validateField = (fieldName: string, value: string) => {
      let errors: string[] = [];

      switch (fieldName) {
        case "name": {
          const nameValidation = validateName(value);
          errors = nameValidation.errors;
          break;
        }
        case "email": {
          const emailValidation = validateEmail(value);
          errors = emailValidation.errors;
          break;
        }
        case "contactNumber": {
          const phoneValidation = validatePhoneNumber(value);
          errors = phoneValidation.errors;
          break;
        }
        case "password": {
          const passwordValidation = validatePasswordStrength(value);
          errors = passwordValidation.errors;
          break;
        }
        case "confirmPassword": {
          if (value && value !== password) {
            errors.push("Passwords do not match");
          }
          break;
        }
      }

      setValidationErrors(prev => ({
        ...prev,
        [fieldName]: errors,
      }));
    };

    // Debounced validation
    const timeouts: Record<string, NodeJS.Timeout> = {};

    const debouncedValidation = (fieldName: string, value: string) => {
      if (timeouts[fieldName]) {
        clearTimeout(timeouts[fieldName]);
      }

      timeouts[fieldName] = setTimeout(() => {
        validateField(fieldName, value);
      }, 500);
    };

    if (name) debouncedValidation("name", name);
    if (email) debouncedValidation("email", email.toLowerCase());
    if (contactNumber) debouncedValidation("contactNumber", contactNumber);
    if (password) debouncedValidation("password", password);
    if (confirmPassword)
      debouncedValidation("confirmPassword", confirmPassword);

    return () => {
      Object.values(timeouts).forEach(timeout => clearTimeout(timeout));
    };
  }, [name, email, contactNumber, password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const now = Date.now();
    const clientId = getClientIdentifier();

    // Security: Check honeypot fields
    if (honeypotWebsite.trim() !== "" || honeypotCompany.trim() !== "") {
      logSecurityEvent("honeypot_triggered", {
        honeypotWebsite,
        honeypotCompany,
        clientId,
      });

      toast({
        title: "Registration Blocked",
        description: "Suspicious activity detected. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    // Security: Check request throttling
    if (!checkRequestThrottle(clientId)) {
      logSecurityEvent("request_throttled", {
        clientId,
        timeSinceLastRequest: now - lastSubmissionTime,
      });

      toast({
        title: "Too Many Requests",
        description: "Please wait a few seconds before trying again.",
        variant: "destructive",
      });
      return;
    }

    // Security: Check rate limiting
    if (!checkRateLimit(clientId, "ip")) {
      logSecurityEvent("ip_rate_limit_exceeded", {
        clientId,
        timeSinceLastRequest: now - lastSubmissionTime,
      });

      toast({
        title: "Registration Limit Reached",
        description:
          "Too many registration attempts from this location. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    // Normalize email to lowercase for case-insensitive rate limiting
    const normalizedEmail = email.trim().toLowerCase();

    if (!checkRateLimit(normalizedEmail, "email")) {
      logSecurityEvent("email_rate_limit_exceeded", {
        email: normalizedEmail,
        clientId,
      });

      toast({
        title: "Email Already Used",
        description: "This email address has already been registered.",
        variant: "destructive",
      });
      return;
    }

    // Validation
    const nameValidation = validateName(name.trim());
    const emailValidation = validateEmail(normalizedEmail);
    const phoneValidation = validatePhoneNumber(contactNumber.trim());
    const passwordValidation = validatePasswordStrength(password);

    if (
      !nameValidation.isValid ||
      !emailValidation.isValid ||
      !phoneValidation.isValid ||
      !passwordValidation.isValid ||
      password !== confirmPassword
    ) {
      const allErrors = {
        name: nameValidation.errors,
        email: emailValidation.errors,
        contactNumber: phoneValidation.errors,
        password: passwordValidation.errors,
        confirmPassword:
          password !== confirmPassword ? ["Passwords do not match"] : [],
      };

      setValidationErrors(allErrors);

      logSecurityEvent("validation_failed", {
        clientId,
        errors: allErrors,
      });

      toast({
        title: "Validation Errors",
        description: "Please fix the errors in the form.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setLastSubmissionTime(now);

    try {
      // Security: Log registration attempt
      logSecurityEvent("registration_attempt", {
        email: normalizedEmail,
        clientId,
        timestamp: new Date().toISOString(),
      });

      trackEvent("register_attempt", { email: normalizedEmail });

      await register(
        name.trim(),
        normalizedEmail,
        password,
        contactNumber.trim()
      );

      // Security: Log successful registration
      logSecurityEvent("registration_success", {
        email: normalizedEmail,
        clientId,
        userId: user?.id,
        userRole: user?.role,
      });

      toast({
        title: "Welcome to Vape Master!",
        description: "Your loyalty card is ready!",
      });

      trackEvent("register_success", {
        user_id: user?.id,
        user_role: user?.role,
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

      // Security: Log failed registration
      logSecurityEvent("registration_failed", {
        email: normalizedEmail,
        clientId,
        error: message,
      });

      toast({
        title: "Registration Failed",
        description: message,
        variant: "destructive",
      });

      trackEvent("register_failed", { email: normalizedEmail, error: message });
    } finally {
      setIsLoading(false);
    }
  };

  const hasErrors = Object.values(validationErrors).some(
    errors => errors.length > 0
  );

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
                <div className="flex items-center justify-center mb-4">
                  <h1 className="text-3xl font-bold text-white">
                    Join the Club
                  </h1>
                </div>
              </div>

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                {/* Honeypot fields - hidden from users but visible to bots */}
                <div className="hidden">
                  <input
                    type="text"
                    name="website"
                    value={honeypotWebsite}
                    onChange={e => setHoneypotWebsite(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                  <input
                    type="text"
                    name="company"
                    value={honeypotCompany}
                    onChange={e => setHoneypotCompany(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className={`bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-red-500 ${
                      validationErrors.name?.length ? "border-red-500" : ""
                    }`}
                    required
                    autoComplete="name"
                  />
                  {validationErrors.name?.length > 0 && (
                    <div className="text-red-400 text-xs space-y-1">
                      {validationErrors.name.map((error, index) => (
                        <div key={index} className="flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {error}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className={`bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-red-500 ${
                      validationErrors.email?.length ? "border-red-500" : ""
                    }`}
                    required
                    autoComplete="email"
                  />
                  {validationErrors.email?.length > 0 && (
                    <div className="text-red-400 text-xs space-y-1">
                      {validationErrors.email.map((error, index) => (
                        <div key={index} className="flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {error}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                      className={`bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-red-500 pr-10 ${
                        validationErrors.password?.length
                          ? "border-red-500"
                          : ""
                      }`}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {validationErrors.password?.length > 0 && (
                    <div className="text-red-400 text-xs space-y-1">
                      {validationErrors.password.map((error, index) => (
                        <div key={index} className="flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {error}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className={`bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-red-500 pr-10 ${
                        validationErrors.confirmPassword?.length
                          ? "border-red-500"
                          : ""
                      }`}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {validationErrors.confirmPassword?.length > 0 && (
                    <div className="text-red-400 text-xs space-y-1">
                      {validationErrors.confirmPassword.map((error, index) => (
                        <div key={index} className="flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {error}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactNumber" className="text-white">
                    Contact Number
                  </Label>
                  <Input
                    id="contactNumber"
                    type="tel"
                    value={contactNumber}
                    onChange={e => setContactNumber(e.target.value)}
                    placeholder="Enter your contact number"
                    className={`bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-red-500 ${
                      validationErrors.contactNumber?.length
                        ? "border-red-500"
                        : ""
                    }`}
                    required
                    autoComplete="tel"
                  />
                  {validationErrors.contactNumber?.length > 0 && (
                    <div className="text-red-400 text-xs space-y-1">
                      {validationErrors.contactNumber.map((error, index) => (
                        <div key={index} className="flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {error}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  ref={submitButtonRef}
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading || hasErrors}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-400">
                  Already have an account?{" "}
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

export default Register;
