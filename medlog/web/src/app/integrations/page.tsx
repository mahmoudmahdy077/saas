'use client'

import { PageTransition, SlideUp } from '@/components/ui/page-transition'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plug, CheckCircle } from 'lucide-react'

const INTEGRATIONS = [
  { name: 'Epic EHR', status: 'Available', category: 'EHR' },
  { name: 'Cerner', status: 'Available', category: 'EHR' },
  { name: 'PubMed', status: 'Available', category: 'Research' },
  { name: 'Orthobullets', status: 'Coming Soon', category: 'Education' },
  { name: 'Google Calendar', status: 'Available', category: 'Productivity' },
  { name: 'Slack', status: 'Coming Soon', category: 'Communication' },
]

export default function IntegrationsPage() {
  return (
    <PageTransition>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Integrations</h1>
          <p className="text-gray-500 mt-1">Connect your favorite tools</p>
        </div>

        <SlideUp>
          <div className="grid gap-4 md:grid-cols-3">
            {INTEGRATIONS.map((int) => (
              <Card key={int.name}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Plug className="w-5 h-5" />
                    {int.name}
                  </CardTitle>
                  <Badge variant={int.status === 'Available' ? 'success' : 'default'}>{int.status}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">{int.category}</p>
                  <Button className="w-full" variant={int.status === 'Available' ? 'default' : 'outline'} disabled={int.status !== 'Available'}>
                    {int.status === 'Available' ? <><CheckCircle className="w-4 h-4 mr-2" /> Connected</> : 'Notify When Ready'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </SlideUp>
      </div>
    </PageTransition>
  )
}
