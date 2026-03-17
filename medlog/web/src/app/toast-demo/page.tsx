'use client'

import { PageTransition } from '@/components/ui/page-transition'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

export default function ToastDemo() {
  const { toast } = useToast()

  const showToast = (type: string) => {
    switch (type) {
      case 'default':
        toast({
          title: 'Default Toast',
          description: 'This is a default notification.',
        })
        break
      case 'success':
        toast({
          title: 'Success!',
          description: 'Your action was completed successfully.',
          variant: 'success',
        })
        break
      case 'error':
        toast({
          title: 'Error',
          description: 'Something went wrong. Please try again.',
          variant: 'destructive',
        })
        break
      case 'warning':
        toast({
          title: 'Warning',
          description: 'Please review before continuing.',
          variant: 'warning',
        })
        break
      case 'info':
        toast({
          title: 'Information',
          description: 'Here is some useful information.',
          variant: 'info',
        })
        break
      case 'action':
        toast({
          title: 'Update Available',
          description: 'A new version is available. Would you like to update?',
          action: (
            <Button variant="outline" size="sm" onClick={() => toast({ title: 'Updating...' })}>
              Update
            </Button>
          ),
        })
        break
      case 'custom':
        toast({
          title: 'Custom Toast',
          description: 'This toast has custom duration.',
          duration: 10000,
        })
        break
    }
  }

  return (
    <PageTransition>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
            Toast Notifications
          </h1>
          <p className="text-gray-500 mt-2">
            Beautiful, animated toast notifications for user feedback
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Toasts */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Toasts</CardTitle>
              <CardDescription>Standard notification variants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={() => showToast('default')} className="w-full">
                <Info className="w-4 h-4 mr-2" />
                Default Toast
              </Button>
              <Button onClick={() => showToast('success')} variant="outline" className="w-full border-green-500 text-green-600 hover:bg-green-50">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Success Toast
              </Button>
              <Button onClick={() => showToast('error')} variant="outline" className="w-full border-red-500 text-red-600 hover:bg-red-50">
                <X className="w-4 h-4 mr-2" />
                Error Toast
              </Button>
              <Button onClick={() => showToast('warning')} variant="outline" className="w-full border-yellow-500 text-yellow-600 hover:bg-yellow-50">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Warning Toast
              </Button>
              <Button onClick={() => showToast('info')} variant="outline" className="w-full border-blue-500 text-blue-600 hover:bg-blue-50">
                <AlertCircle className="w-4 h-4 mr-2" />
                Info Toast
              </Button>
            </CardContent>
          </Card>

          {/* Advanced Toasts */}
          <Card>
            <CardHeader>
              <CardTitle>Advanced Toasts</CardTitle>
              <CardDescription>Interactive and custom toasts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={() => showToast('action')} className="w-full">
                Toast with Action
              </Button>
              <Button onClick={() => showToast('custom')} variant="outline" className="w-full">
                Custom Duration (10s)
              </Button>
              <Button 
                onClick={() => {
                  for (let i = 1; i <= 3; i++) {
                    setTimeout(() => {
                      toast({
                        title: `Toast ${i}`,
                        description: `This is toast number ${i}`,
                        variant: i === 1 ? 'success' : i === 2 ? 'warning' : 'info',
                      })
                    }, i * 300)
                  }
                }} 
                variant="outline" 
                className="w-full"
              >
                Show 3 Toasts
              </Button>
              <Button 
                onClick={() => {
                  toast({
                    title: 'Case Logged Successfully!',
                    description: 'Your surgical case has been recorded and verified.',
                    variant: 'success',
                  })
                }} 
                variant="outline" 
                className="w-full border-green-500 text-green-600"
              >
                MedLog Success Example
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Usage Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Examples</CardTitle>
            <CardDescription>How to use toasts in your components</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
{`// Import the hook
import { useToast } from '@/components/ui/use-toast'

// In your component
function MyComponent() {
  const { toast } = useToast()

  // Show success toast
  const handleSuccess = () => {
    toast({
      title: 'Success!',
      description: 'Your action was completed.',
      variant: 'success',
    })
  }

  // Show error toast
  const handleError = () => {
    toast({
      title: 'Error',
      description: 'Something went wrong.',
      variant: 'destructive',
    })
  }

  // Toast with action
  const handleAction = () => {
    toast({
      title: 'Update Available',
      description: 'New version ready.',
      action: <Button>Update</Button>,
    })
  }
}`}
            </pre>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <h3 className="font-bold mb-2">Auto-Dismiss</h3>
                <p className="text-sm text-gray-500">Toasts automatically dismiss after 5 seconds</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                <h3 className="font-bold mb-2">Stackable</h3>
                <p className="text-sm text-gray-500">Multiple toasts stack beautifully</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Info className="w-12 h-12 mx-auto mb-4 text-purple-500" />
                <h3 className="font-bold mb-2">Accessible</h3>
                <p className="text-sm text-gray-500">Full keyboard navigation support</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  )
}
