'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Scan, 
  ArrowLeft,
  Clock,
  Mail,
  Bell,
  Crown
} from "lucide-react"
import Link from 'next/link'

export default function OcrPDFPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tools
          </Link>
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
              <Scan className="h-8 w-8 text-slate-700 dark:text-slate-300" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">OCR PDF</h1>
              <p className="text-slate-600 dark:text-slate-400">Convert scanned PDFs into editable text</p>
              <div className="flex items-center mt-2">
                <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium Feature
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle className="text-2xl text-slate-900 dark:text-white">Coming Soon</CardTitle>
              <CardDescription className="text-lg text-slate-600 dark:text-slate-400">
                The OCR PDF tool is currently under development
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  We're developing an advanced OCR (Optical Character Recognition) tool that will convert your scanned PDFs and images into searchable and editable text. This premium feature will be available soon!
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <Scan className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                    <p className="font-medium text-slate-900 dark:text-white">Text Extraction</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">From scanned PDFs</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <Scan className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                    <p className="font-medium text-slate-900 dark:text-white">Multiple Languages</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Global support</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <Scan className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                    <p className="font-medium text-slate-900 dark:text-white">High Accuracy</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Advanced AI</p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-6 border border-amber-200 dark:border-amber-800">
                <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-4 flex items-center">
                  <Crown className="h-5 w-5 mr-2" />
                  Premium Feature
                </h3>
                <p className="text-amber-700 dark:text-amber-300 mb-4">
                  The OCR PDF tool will be available as part of our Premium subscription. Get early access and exclusive benefits by signing up for notifications.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Get Notified When Available
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Be the first to know when the OCR PDF tool launches. Sign up for notifications and we'll send you an email as soon as it's ready, along with special launch offers.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                  />
                  <Button className="bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600">
                    <Mail className="h-4 w-4 mr-2" />
                    Notify Me
                  </Button>
                </div>
              </div>

              <div className="text-center">
                <Button asChild variant="outline">
                  <Link href="/">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to All Tools
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}