'use client'

import { PageTransition, SlideUp } from '@/components/ui/page-transition'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, CheckCircle } from 'lucide-react'

export default function SSOPage() {
  const providers = [
    { name: 'Google Workspace', enabled: false },
    { name: 'Microsoft Azure AD', enabled: false },
    { name: 'Okta', enabled: false },
    { name: 'OneLogin', enabled: false },
  ]

  return (
    <PageTransition>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Single Sign-On (SSO)</h1>
          <p className="text-gray-500 mt-1">Enterprise authentication integration</p>
        </div>

        <SlideUp>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                SSO Providers
              </CardTitle>
              <CardDescription>Connect your identity provider</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {providers.map((provider) => (
                <div key={provider.name} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{provider.name}</p>
                    <p className="text-sm text-gray-500">SAML 2.0 / OIDC</p>
                  </div>
                  <Button variant={provider.enabled ? 'default' : 'outline'}>
                    {provider.enabled ? 'Connected' : 'Connect'}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </SlideUp>

        <SlideUp delay={0.1}>
          <Card>
            <CardHeader><CardTitle>SSO Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Entity ID</label>
                <input className="w-full p-2 border rounded mt-1" value="https://medlog.com/saml/entity" readOnly />
              </div>
              <div>
                <label className="text-sm font-medium">ACS URL</label>
                <input className="w-full p-2 border rounded mt-1" value="https://medlog.com/api/auth/saml/callback" readOnly />
              </div>
              <Button>Download Metadata</Button>
            </CardContent>
          </Card>
        </SlideUp>
      </div>
    </PageTransition>
  )
}
