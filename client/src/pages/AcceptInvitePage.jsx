import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Label } from "../components/ui/Label";
import { CheckCircle, AlertCircle } from "lucide-react";
import useAuthStore from "../store/useAuthStore";
import { authApi } from "../lib/api";

const AcceptInvitePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, clearError } = useAuthStore();

  const [token, setToken] = useState("");
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    // Clear any auth store errors
    clearError();

    // Extract token from URL
    const urlToken = searchParams.get("token");
    if (!urlToken) {
      setError("Invalid invite link. No token provided.");
    } else {
      setToken(urlToken);
    }
  }, [searchParams, clearError]);

  const validatePasswords = () => {
    setPasswordError("");

    if (formData.password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswords()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.acceptInvite({
        token,
        password: formData.password,
      });

      // Set user in auth store (user is now logged in)
      setUser(response.data.user);

      // Redirect to dashboard
      navigate("/", { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Failed to accept invite. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (!token && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm sm:text-base text-muted-foreground">
                Loading invite...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-[hsl(var(--nav-background))] shadow-lg">
        <CardHeader className="space-y-2 pb-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
            <CardTitle className="text-xl sm:text-2xl">
              Accept Your Invitation
            </CardTitle>
          </div>
          <CardDescription className="text-sm sm:text-base">
            Set your password to activate your account and get started
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {error ? (
            <div className="space-y-4">
              <div className="flex items-start gap-2 sm:gap-3 text-destructive bg-destructive/10 p-3 sm:p-4 rounded-md">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm sm:text-base">
                    Invalid Invite
                  </p>
                  <p className="text-xs sm:text-sm mt-1 break-words">{error}</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full h-10 sm:h-11"
                onClick={() => navigate("/login")}
              >
                Go to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password (min. 6 characters)"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              {passwordError && (
                <div className="text-xs sm:text-sm text-destructive bg-destructive/10 p-3 rounded-md break-words">
                  {passwordError}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-10 sm:h-11"
                disabled={isLoading}
              >
                {isLoading
                  ? "Setting up your account..."
                  : "Accept Invite & Login"}
              </Button>

              <p className="text-[10px] sm:text-xs text-muted-foreground text-center mt-4 leading-relaxed">
                By accepting this invitation, you agree to join the organization
                and will have immediate access to your assigned resources.
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvitePage;
