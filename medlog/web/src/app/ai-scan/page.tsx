'use client'

import { useState } from 'react'
import { PageTransition, SlideUp } from '@/components/ui/page-transition'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Scan, CheckCircle } from 'lucide-react'

export default function AIScanPage() {
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleScan = async () => {
    setAnalyzing(true)
    // Simulate AI analysis
    setTimeout(() => {
      setResult({
        type: 'X-ray',
        body_part: 'Knee',
        findings: ['Joint space narrowing', 'Osteophyte formation'],
        confidence: 92,
        diagnosis: 'Osteoarthritis Grade II',
        cpt: '27447',
      })
      setAnalyzing(false)
    }, 2000)
  }

  return (
    <PageTransition>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">AI Image Analysis</h1>
          <p className="text-gray-500 mt-1">AI-powered X-ray and MRI analysis</p>
        </div>

        <SlideUp>
          <Card>
            <CardContent className="p-12 text-center">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12">
                <Scan className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 mb-4">Upload X-ray or MRI image for AI analysis</p>
                <Button onClick={handleScan} disabled={analyzing}>
                  <Upload className="w-4 h-4 mr-2" />
                  {analyzing ? 'Analyzing...' : 'Upload & Analyze'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </SlideUp>

        {result && (
          <SlideUp delay={0.1}>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /> Analysis Result</CardTitle></CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-medium">{result.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Body Part</p>
                    <p className="font-medium">{result.body_part}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Confidence</p>
                    <p className="font-medium">{result.confidence}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Suggested CPT</p>
                    <p className="font-medium">{result.cpt}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Findings</p>
                    <ul className="list-disc list-inside">{result.findings.map((f: string, i: number) => <li key={i}>{f}</li>)}</ul>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Suggested Diagnosis</p>
                    <p className="font-medium text-lg">{result.diagnosis}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </SlideUp>
        )}
      </div>
    </PageTransition>
  )
}
