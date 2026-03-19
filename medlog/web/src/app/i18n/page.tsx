'use client'

import { PageTransition, SlideUp } from '@/components/ui/page-transition'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Globe } from 'lucide-react'

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', progress: 100 },
  { code: 'es', name: 'Spanish', native: 'Español', progress: 80 },
  { code: 'fr', name: 'French', native: 'Français', progress: 60 },
  { code: 'de', name: 'German', native: 'Deutsch', progress: 40 },
  { code: 'zh', name: 'Chinese', native: '中文', progress: 30 },
  { code: 'ar', name: 'Arabic', native: 'العربية', progress: 20 },
]

export default function I18nPage() {
  return (
    <PageTransition>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Languages</h1>
          <p className="text-gray-500 mt-1">Multi-language support</p>
        </div>

        <SlideUp>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5" /> Available Languages</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {LANGUAGES.map((lang) => (
                <div key={lang.code} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <p className="font-medium">{lang.native}</p>
                    <p className="text-sm text-gray-500">{lang.name}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32">
                      <div className="text-xs text-gray-500 mb-1">{lang.progress}% translated</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${lang.progress}%` }} />
                      </div>
                    </div>
                    <Button variant={lang.progress === 100 ? 'default' : 'outline'} disabled={lang.progress < 100}>
                      {lang.progress === 100 ? 'Select' : `${lang.progress}%`}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </SlideUp>
      </div>
    </PageTransition>
  )
}
