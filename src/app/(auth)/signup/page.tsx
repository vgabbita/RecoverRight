'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RoleSelector from '@/components/auth/RoleSelector';
import { createClient } from '@/lib/supabase/client';
import { UserRole } from '@/types';

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call our API route to handle signup (bypasses RLS)
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role,
          fullName,
          age: parseInt(age),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      // Sign in the user to establish session
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw new Error('Account created but failed to sign in. Please try signing in manually.');
      }

      // Redirect to dashboard
      if (data.user?.role) {
        router.push(`/${data.user.role}`);
      } else {
        router.push(`/${role}`);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center">
            <Activity className="h-12 w-12 text-primary" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-text-primary">
            Create Your Account
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Join RecoverRight to optimize your athletic performance
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-4">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
              step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              1
            </div>
            <div className={`h-0.5 w-16 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
              step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-center text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Step 1: Role Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <RoleSelector selectedRole={role} onRoleSelect={setRole} />
            <div className="flex justify-end">
              <Button
                onClick={() => setStep(2)}
                disabled={!role}
                size="lg"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Profile Information */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Tell us a bit about yourself
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="25"
                      min="16"
                      max="100"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <p className="text-xs text-text-secondary">
                    Must be at least 6 characters
                  </p>
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="text-center text-sm">
          <span className="text-text-secondary">Already have an account? </span>
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
