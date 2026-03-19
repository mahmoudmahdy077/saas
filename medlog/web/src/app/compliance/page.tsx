'use client'

import { PageTransition, SlideUp } from '@/components/ui/page-transition'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, Shield, FileCheck } from 'lucide-react'

export default function CompliancePage() {
  const compliances = [
    { name: 'HIPAA', status: 'Compliant', lastAudit: '2026-03-01' },
    { name: 'GDPR', status: 'Compliant', lastAudit: '2026-03-01' },
    { name: 'SOC 2 Type II', status: 'In Progress', lastAudit: 'Pending' },
    { name: 'HITECH', status: 'Compliant', lastAudit: '2026-03-01' },
  ]

  return (
    <PageTransition>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Compliance Center</h1>
          <p className="text-gray-500 mt-1">Regulatory compliance & certifications</p>
        </div>

        <SlideUp>
          <div className="grid gap-4 md:grid-cols-2">
            {compliances.map((comp) => (
              <Card key={comp.name}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    {comp.name}
                  </CardTitle>
                  <Badge variant={comp.status === 'Compliant' ? 'success' : 'warning'}>{comp.status}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">Last Audit: {comp.lastAudit}</p>
                  {comp.status === 'Compliant' && (
                    <div className="mt-4 flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">All requirements met</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </SlideUp>

        <SlideUp delay={0.1}>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><FileCheck className="w-5 h-5" /> Compliance Reports</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 border rounded">
                <div>
                  <p className="font-medium">HIPAA Compliance Report</p>
                  <p className="text-sm text-gray-500">Generated: 2026-03-01</p>
                </div>
                <Button variant="outline">Download PDF</Button>
              </div>
              <div className="flex justify-between items-center p-3 border rounded">
                <div>
                  <p className="font-medium">GDPR Data Processing Report</p>
                  <p className="text-sm text-gray-500">Generated: 2026-03-01</p>
                </div>
                <Button variant="outline">Download PDF</Button>
              </div>
            </CardContent>
          </Card>
        </SlideUp>
      </div>
    </PageTransition>
  )
}
