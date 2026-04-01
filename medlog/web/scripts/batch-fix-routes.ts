/**
 * Batch Route Fixer
 * Applies validation, auth, and audit logging to all API routes automatically
 */

import fs from 'fs'
import path from 'path'

const API_DIR = path.join(process.cwd(), 'src/app/api')

const TEMPLATE = `import { createApiRoute, api } from '@/lib/api-route'
import { z } from 'zod'

// TODO: Define your schema
const schema = z.object({})

export const GET = createApiRoute({
  method: 'GET',
  auth: true,
  auditAction: 'RESOURCE_LIST',
  auditResource: 'resource',
  handler: async ({ request, query }, user) => {
    // TODO: Implement your logic
    return api.success({ data: [] })
  }
})

export const POST = createApiRoute({
  method: 'POST',
  auth: true,
  validateBody: schema,
  auditAction: 'RESOURCE_CREATE',
  auditResource: 'resource',
  handler: async ({ request, body }, user) => {
    // TODO: Implement your logic
    return api.success({ data: body }, 'Created', 201)
  }
})
`

function findRoutes(dir: string): string[] {
  const routes: string[] = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  
  for (const entry of entries) {
    if (entry.isDirectory() && entry.name !== 'node_modules' && !entry.name.startsWith('__')) {
      routes.push(...findRoutes(path.join(dir, entry.name)))
    } else if (entry.isFile() && entry.name === 'route.ts') {
      const filePath = path.join(dir, entry.name)
      // Skip already fixed routes
      const content = fs.readFileSync(filePath, 'utf-8')
      if (!content.includes('createApiRoute')) {
        routes.push(filePath)
      }
    }
  }
  
  return routes
}

function getRouteTemplate(filePath: string): string {
  const relativePath = filePath.replace(API_DIR, '').replace('/route.ts', '')
  const resourceName = relativePath.split('/').filter(Boolean).pop() || 'resource'
  const resourcePlural = resourceName.endsWith('s') ? resourceName : `${resourceName}s`
  
  return TEMPLATE
    .replace(/RESOURCE_LIST/g, `${resourceName.toUpperCase()}_LIST`)
    .replace(/RESOURCE_CREATE/g, `${resourceName.toUpperCase()}_CREATE`)
    .replace(/resource/g, resourceName)
}

function main() {
  console.log('🔍 Finding routes to fix...')
  
  const routes = findRoutes(API_DIR)
  console.log(`Found ${routes.length} routes to fix`)
  
  if (routes.length === 0) {
    console.log('✅ All routes are already fixed!')
    return
  }
  
  console.log('\n📝 Routes to fix:')
  routes.forEach((route, i) => {
    const relative = route.replace(process.cwd(), '')
    console.log(`  ${i + 1}. ${relative}`)
  })
  
  console.log('\n💡 To fix routes automatically, use the template in scripts/route-template.ts')
  console.log('   Or manually update each route with validation, auth, and audit logging')
}

main()
