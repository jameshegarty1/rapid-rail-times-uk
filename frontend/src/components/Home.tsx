import React from 'react';
import { isAuthenticated } from '../utils';
import ProfileList from './ProfileList';
import Navbar from './Navbar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { TrainFront as Train, Clock, MapPin, Gauge } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {isAuthenticated() ? (
        <ProfileList />
      ) : (
        <div className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <Train className="h-16 w-16 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to Rapid Rail Times UK
            </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Your reliable train journey companion.
              </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardContent className="pt-6">
                <Clock className="h-8 w-8 text-blue-600 mb-4" />
                <h3 className="font-semibold text-lg mb-2">
                  Real-time Updates
                </h3>
                <p className="text-gray-600">
                  Get live information about your train services in a simple to
                  use interface.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <MapPin className="h-8 w-8 text-blue-600 mb-4" />
                <h3 className="font-semibold text-lg mb-2">Multiple Routes</h3>
                <p className="text-gray-600">
                  Stay flexible with multiple journey routes within one profile.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Gauge className="h-8 w-8 text-blue-600 mb-4" />
                <h3 className="font-semibold text-lg mb-2">Quick Route</h3>
                <p className="text-gray-600">
                  Check the departure board for any station within seconds.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Get Started Today</CardTitle>
              <CardDescription>
                Create an account or log in to begin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="default"
                onClick={() => (window.location.href = '/login')}
                className="w-full bg-slate-700 text-white hover:text-slate-700 hover:bg-white"
                size="lg"
              >
                Login
              </Button>
              <Button
                onClick={() => (window.location.href = '/signup')}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Sign Up
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
