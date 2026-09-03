import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircleIcon, Loader2Icon } from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '../components/ui/Button';
import { FieldError, Input, Label } from '../components/ui/Field';
import { useAuth } from '../contexts/AuthContext';
import { roleMeta } from '../data/taxonomy';

export function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.includes('@') || password.length < 1) {
      setError('Enter your email and password.');
      return;
    }

    setPending(true);

    try {
      const user = await signIn(email, password);

      navigate(roleMeta[user.role].home, {
        replace: true,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to sign in.'
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to report problems, collaborate on solutions, or manage the platform."
    >
      <form onSubmit={submit} noValidate>
        <div className="space-y-5">

          <div>
            <Label htmlFor="email">
              Email address
            </Label>

            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <Label htmlFor="password">
              Password
            </Label>

            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

        </div>

        {error && (
          <div
            role="alert"
            className="mt-5 flex gap-2 rounded-card border border-clay-100 bg-clay-50 p-3 text-sm text-clay-600"
          >
            <AlertCircleIcon className="h-4 w-4" />

            <FieldError>
              {error}
            </FieldError>
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="mt-7 w-full"
          disabled={pending}
        >
          {pending && (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          )}

          {pending ? 'Signing in' : 'Sign in'}
        </Button>

        <p className="mt-5 text-sm text-ink-soft">
          No account yet?{' '}
          <Link
            to="/signup"
            className="font-semibold text-forest-700"
          >
            Create one
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}