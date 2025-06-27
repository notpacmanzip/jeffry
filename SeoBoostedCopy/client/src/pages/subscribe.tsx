import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const SubscribeForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/billing",
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "You are now subscribed to the Pro plan!",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button type="submit" className="w-full" disabled={!stripe}>
        <Crown className="w-4 h-4 mr-2" />
        Subscribe to Pro - $29/month
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  useEffect(() => {
    if (isAuthenticated) {
      // Create PaymentIntent as soon as the page loads
      apiRequest("POST", "/api/create-subscription")
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
        })
        .catch((error) => {
          if (isUnauthorizedError(error)) {
            toast({
              title: "Unauthorized",
              description: "You are logged out. Logging in again...",
              variant: "destructive",
            });
            setTimeout(() => {
              window.location.href = "/api/login";
            }, 500);
            return;
          }
          toast({
            title: "Error",
            description: "Failed to initialize payment. Please try again.",
            variant: "destructive",
          });
        });
    }
  }, [isAuthenticated, toast]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!clientSecret) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            title="Subscribe to Pro" 
            subtitle="Upgrade your account to unlock premium features"
          />
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-2xl mx-auto">
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-slate-600">Initializing payment...</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Subscribe to Pro" 
          subtitle="Upgrade your account to unlock premium features"
        />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Link href="/billing">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Billing
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Plan Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-primary" />
                    Pro Plan Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-slate-900 mb-2">$29</div>
                      <div className="text-slate-600">per month</div>
                      <Badge className="mt-2">Most Popular</Badge>
                    </div>

                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-emerald-500" />
                        <span>3,000 AI-generated descriptions per month</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-emerald-500" />
                        <span>Advanced SEO optimization</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-emerald-500" />
                        <span>Bulk processing and uploads</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-emerald-500" />
                        <span>Custom templates and tone settings</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-emerald-500" />
                        <span>Detailed analytics dashboard</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-emerald-500" />
                        <span>Platform integrations (Shopify, WooCommerce)</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-emerald-500" />
                        <span>Priority email support</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-emerald-500" />
                        <span>Export and API access</span>
                      </li>
                    </ul>

                    <div className="bg-slate-50 p-4 rounded-lg">
                      <h4 className="font-medium text-slate-900 mb-2">What you get immediately:</h4>
                      <ul className="text-sm text-slate-600 space-y-1">
                        <li>• 3,000 monthly API credits</li>
                        <li>• Access to all premium features</li>
                        <li>• Cancel anytime</li>
                        <li>• 30-day money-back guarantee</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <SubscribeForm />
                  </Elements>
                  
                  <div className="mt-6 space-y-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                        </svg>
                        Secured by Stripe
                      </div>
                    </div>
                    
                    <div className="text-xs text-slate-500 text-center">
                      By subscribing, you agree to our Terms of Service and Privacy Policy. 
                      Your subscription will automatically renew monthly until canceled.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
