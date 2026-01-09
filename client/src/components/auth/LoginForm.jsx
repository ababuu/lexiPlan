import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/Card";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Label } from "../ui/Label";
import useAuthStore from "../../store/useAuthStore";

const LoginForm = ({ onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { login, error, clearError } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();

    try {
      await login(formData);

      navigate("/", { replace: true });
    } catch (error) {
      // Error is already set in the store
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

  const handleSignUpClick = () => {
    clearError();
    onSwitchToRegister();
  };

  return (
    <div className="flex items-center justify-center bg-background">
      <Card className="w-full max-w-md bg-[hsl(var(--nav-background))] shadow-lg">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl sm:text-3xl">Welcome back</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {error && (
              <div className="text-xs sm:text-sm text-destructive bg-destructive/10 p-3 rounded-md break-words">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-10 sm:h-11"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>

            <div className="text-center text-xs sm:text-sm mt-6">
              Don't have an account?{" "}
              <span
                onClick={handleSignUpClick}
                className="text-primary hover:underline cursor-pointer font-medium"
              >
                Sign up
              </span>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
