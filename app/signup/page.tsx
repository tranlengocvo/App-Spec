'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    major: '',
    year: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await signUp(
        formData.email,
        formData.password,
        formData.name,
        formData.major || undefined,
        formData.year || undefined
      );
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#CFB991] py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mt-4 text-lg font-medium text-black">Check your email</h2>
              <p className="mt-2 text-sm text-black/80">
                We&apos;ve sent you a verification link. Please check your email and click the link to verify your account.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#CFB991] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <div className="bg-black p-4 rounded-lg shadow-lg">
              <div className="flex items-center space-x-4">
                {/* Left Speech Bubble - Graduation Cap */}
                <div className="relative">
                  <div className="w-12 h-8 bg-[#CFB991] rounded-lg relative">
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-[#CFB991]"></div>
                    <div className="absolute top-1 left-1/2 transform -translate-x-1/2">
                      <div className="w-6 h-4 bg-black rounded-sm"></div>
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-black"></div>
                      <div className="absolute top-0 right-0 w-1 h-3 bg-black"></div>
                    </div>
                  </div>
                </div>
                
                {/* Circular Arrows */}
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-6 h-6 border-2 border-[#CFB991] rounded-full flex items-center justify-center">
                    <div className="w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-[#CFB991] transform rotate-45"></div>
                  </div>
                  <div className="w-6 h-6 border-2 border-[#CFB991] rounded-full flex items-center justify-center">
                    <div className="w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-[#CFB991] transform -rotate-45"></div>
                  </div>
                </div>
                
                {/* Right Speech Bubble - Document */}
                <div className="relative">
                  <div className="w-12 h-8 bg-[#CFB991] rounded-lg relative">
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-[#CFB991]"></div>
                    <div className="absolute top-1 left-1/2 transform -translate-x-1/2">
                      <div className="w-8 h-6 bg-black rounded-sm relative">
                        <div className="absolute top-1 left-1 w-6 h-0.5 bg-[#CFB991]"></div>
                        <div className="absolute top-2 left-1 w-4 h-0.5 bg-[#CFB991]"></div>
                        <div className="absolute top-3 left-1 w-5 h-0.5 bg-[#CFB991]"></div>
                        <div className="absolute bottom-1 right-1 w-2 h-2 bg-[#CFB991] transform rotate-45"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-black">Class Swap</h1>
          <p className="mt-2 text-sm text-black/80">Create your account</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Create an account with your Purdue email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@purdue.edu"
                  required
                  className="mt-1 bg-white border-black"
                />
              </div>
              
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                  Full Name
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 bg-white border-black"
                />
              </div>
              
              <div>
                <label htmlFor="major" className="block text-sm font-semibold text-gray-700">
                  Major (optional)
                </label>
                <Input
                  id="major"
                  name="major"
                  type="text"
                  value={formData.major}
                  onChange={handleChange}
                  placeholder="Computer Science"
                  className="mt-1 bg-white border-black"
                />
              </div>
              
              <div>
                <label htmlFor="year" className="block text-sm font-semibold text-gray-700">
                  Year (optional)
                </label>
                <Input
                  id="year"
                  name="year"
                  type="text"
                  value={formData.year}
                  onChange={handleChange}
                  placeholder="Junior"
                  className="mt-1 bg-white border-black"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="mt-1 bg-white border-black"
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="mt-1 bg-white border-black"
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign Up
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/signin" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
