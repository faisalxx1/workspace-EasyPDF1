'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Star, 
  Crown, 
  Zap, 
  Scan, 
  PenTool, 
  Layers,
  FileText,
  Check,
  X,
  ArrowRight,
  CreditCard,
  Shield,
  Database,
  Users,
  Headphones,
  Download
} from "lucide-react"

interface Feature {
  name: string
  description: string
  icon: React.ReactNode
  free?: boolean
  pro?: boolean
}

const features: Feature[] = [
  {
    name: "Basic PDF Tools",
    description: "Merge, split, compress, convert, rotate, unlock, watermark",
    icon: <FileText className="h-6 w-6" />,
    free: true
  },
  {
    name: "OCR (Optical Character Recognition)",
    description: "Convert scanned PDFs into searchable and editable text",
    icon: <Scan className="h-6 w-6" />,
    pro: true
  },
  {
    name: "E-Signatures",
    description: "Add legally binding digital signatures to your documents",
    icon: <PenTool className="h-6 w-6" />,
    pro: true
  },
  {
    name: "Batch Processing",
    description: "Process multiple files simultaneously with one click",
    icon: <Layers className="h-6 w-6" />,
    pro: true
  },
  {
    name: "Advanced Compression",
    description: "Intelligent compression algorithms for maximum file size reduction",
    icon: <Zap className="h-6 w-6" />,
    pro: true
  },
  {
    name: "Priority Processing",
    description: "Your files are processed first in the queue",
    icon: <Crown className="h-6 w-6" />,
    pro: true
  },
  {
    name: "Cloud Storage",
    description: "10GB secure cloud storage for your files",
    icon: <Database className="h-6 w-6" />,
    pro: true
  },
  {
    name: "Priority Support",
    description: "24/7 dedicated customer support with faster response times",
    icon: <Headphones className="h-6 w-6" />,
    pro: true
  }
]

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for occasional users",
    features: [
      "Basic PDF tools",
      "Up to 3 files per day",
      "Max 50MB per file",
      "Standard processing speed",
      "Community support"
    ],
    cta: "Current Plan",
    popular: false,
    disabled: true
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "per month",
    description: "For professionals and power users",
    features: [
      "All PDF tools including premium features",
      "Unlimited files per day",
      "Max 500MB per file",
      "Priority processing speed",
      "OCR and E-signatures",
      "Batch processing",
      "10GB cloud storage",
      "Priority support",
      "Advanced compression"
    ],
    cta: "Upgrade to Pro",
    popular: true,
    disabled: false
  },
  {
    name: "Team",
    price: "$29.99",
    period: "per month",
    description: "For teams and businesses",
    features: [
      "Everything in Pro",
      "Up to 5 team members",
      "50GB cloud storage",
      "Team management dashboard",
      "Advanced analytics",
      "API access",
      "Custom branding",
      "SSO integration",
      "Dedicated account manager"
    ],
    cta: "Contact Sales",
    popular: false,
    disabled: false
  }
]

export default function Premium() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState('pro')
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleUpgrade = async (plan: string) => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    setIsUpgrading(true)
    setMessage(null)

    try {
      // In a real application, this would integrate with Stripe or another payment processor
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Upgrade successful! Welcome to Pro!' })
        // Redirect to dashboard or show success state
        setTimeout(() => router.push('/dashboard'), 2000)
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.error || 'Upgrade failed' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred during upgrade' })
    } finally {
      setIsUpgrading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Crown className="h-8 w-8 text-purple-600 mr-2" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Premium Features</h1>
            </div>
            <Button variant="outline" onClick={() => router.push('/')}>
              Back to Tools
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {message && (
          <Alert className={`mb-8 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
            <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Star className="w-4 h-4 mr-1" />
            Premium Features
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Unlock the Full Power of EasyPDF Tools
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Get access to advanced features, priority processing, and unlimited usage with our premium plans.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-3" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
              View Pricing Plans
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              <Download className="mr-2 h-5 w-5" />
              Compare Features
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Premium Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.filter(f => f.pro).map((feature, index) => (
              <Card key={index} className="relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="text-center relative z-10">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-lg flex items-center justify-center gap-2">
                    {feature.name}
                    <Badge variant="secondary" className="text-xs">
                      <Crown className="w-3 h-3 mr-1" />
                      Pro
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center relative z-10">
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Feature Comparison
          </h3>
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-3">
                {/* Header */}
                <div className="p-6 border-b bg-gray-50 dark:bg-gray-800">
                  <h4 className="font-semibold">Features</h4>
                </div>
                <div className="p-6 border-b border-l bg-blue-50 dark:bg-blue-900/20 text-center">
                  <h4 className="font-semibold text-blue-600 dark:text-blue-300">Free Plan</h4>
                </div>
                <div className="p-6 border-b border-l bg-purple-50 dark:bg-purple-900/20 text-center">
                  <h4 className="font-semibold text-purple-600 dark:text-purple-300">Pro Plan</h4>
                </div>

                {/* Feature Rows */}
                {features.map((feature, index) => (
                  <>
                    <div className="p-6 border-b">
                      <div className="flex items-center gap-3">
                        {feature.icon}
                        <div>
                          <p className="font-medium">{feature.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 border-b border-l text-center">
                      {feature.free ? (
                        <Check className="h-6 w-6 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-6 w-6 text-gray-400 mx-auto" />
                      )}
                    </div>
                    <div className="p-6 border-b border-l text-center">
                      <Check className="h-6 w-6 text-green-500 mx-auto" />
                    </div>
                  </>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Plans */}
        <div id="pricing" className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Choose Your Plan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'ring-2 ring-purple-500 shadow-lg' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-500 text-white px-4 py-1">
                      <Star className="w-4 h-4 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-500 dark:text-gray-400">/{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full mt-6 ${plan.popular ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                    disabled={plan.disabled || isUpgrading}
                    onClick={() => !plan.disabled && handleUpgrade(plan.name.toLowerCase())}
                  >
                    {isUpgrading && selectedPlan === plan.name.toLowerCase() ? 'Upgrading...' : plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-12 text-white">
          <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of professionals who trust EasyPDF Tools for their document management needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => handleUpgrade('pro')}>
              <CreditCard className="mr-2 h-5 w-5" />
              Upgrade to Pro
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
              Start Free Trial
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}