import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, KeyRound } from 'lucide-react';
import { signUp, isAuthenticated } from '../utils';


export default function SignUp() {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = async () => {
    // Password confirmation validation
    if (password !== passwordConfirmation) setError('Passwords do not match');
    else {
      setError('');
      try {
        const data = await signUp(username, password, passwordConfirmation);

        if (data) {
          navigate('/');
        }
      } catch (err) {
        if (err instanceof Error) {
          // handle errors thrown from frontend
          setError(err.message);
        } else {
          // handle errors thrown from backend
          setError(String(err));
        }
      }
    }
  };

  if (isAuthenticated()) {
    return <Navigate to="/" />;
  }

  return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Sign Up</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                    id="username"
                    type="username"
                    value={username}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setUsername(e.currentTarget.value)
                    }
                    className="pl-9"
                    placeholder="Enter your username"
                    required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPassword(e.currentTarget.value)
                    }
                    className="pl-9"
                    placeholder="Enter your password"
                    required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordConfirmation">Confirm Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                    id="passwordConfirmation"
                    type="password"
                    value={passwordConfirmation}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPasswordConfirmation(e.currentTarget.value)
                    }
                    className="pl-9"
                    placeholder="Confirm your password"
                    required
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={handleSubmit} className="w-full">
                Sign Up
              </Button>
              <Button
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="w-full"
              >
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}