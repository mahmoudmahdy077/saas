/**
 * Automated Route Fixer Script
 * Adds validation, auth, and audit logging to all API routes
 * Usage: npm run fix:routes
 */

import fs from 'fs'
import path from 'path'

const API_DIR = path.join(process.cwd(), 'src/app/api')
const OUTPUT_FILE = path.join(process.cwd(), 'routes-to-fix.md')

interface RouteInfo {
  path: string
  hasValidation: boolean
  hasAuth: boolean
  hasAudit: boolean
  hasStandardResponse: boolean
  priority: 'P0' | 'P1' | 'P2'
}

function checkRoute(filePath: string): RouteInfo {
  const content = fs.readFileSync(filePath, 'utf-8')
  
  return {
    path: filePath.replace(API_DIR, '/api'),
    hasValidation: content.includes('validateSafe') || content.includes('schema.parse'),
    hasAuth: content.includes('requireAuth') || content.includes('getCurrentUser') || content.includes('auth.getUser'),
    hasAudit: content.includes('logAudit'),
    hasStandardResponse: content.includes('successResponse') || content.includes('errorResponse') || content.includes('api.success'),
    priority: determinePriority(filePath, content),
  }
}

function determinePriority(filePath: string, content: string): 'P0' | 'P1' | 'P2' {
  // P0: Auth routes, user data, payments
  if (filePath.includes('auth') || filePath.includes('user') || filePath.includes('payment') || filePath.includes('subscription')) {
    return 'P0'
  }
  
  // P1: Core features (cases, analytics, institution)
  if (filePath.includes('cases') || filePath.includes('analytics') || filePath.includes('institution')) {
    return 'P1'
  }
  
  // P2: Everything else
  return 'P2'
}

function findRoutes(dir: string): string[] {
  const routes: string[] = []
  
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  
  for (const entry of entries) {
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      routes.push(...findRoutes(path.join(dir, entry.name)))
    } else if (entry.isFile() && entry.name === 'route.ts') {
      routes.push(path.join(dir, entry.name))
    }
  }
  
  return routes
}

function generateReport(routes: RouteInfo[]) {
  const p0 = routes.filter(r => r.priority === 'P0')
  const p1 = routes.filter(r => r.priority === 'P1')
  const p2 = routes.filter(r => r.priority === 'P2')
  
  const report = `# API Routes Fix Plan

**Generated:** ${new Date().toISOString()}
**Total Routes:** ${routes.length}

## Summary

| Priority | Total | Fixed | Remaining |
|----------|-------|-------|-----------|
| P0 (Critical) | ${p0.length} | ${p0.filter(r => r.hasValidation && r.hasAuth).length} | ${p0.filter(r => !r.hasValidation || !r.hasAuth).length} |
| P1 (High) | ${p1.length} | ${p1.filter(r => r.hasValidation && r.hasAuth).length} | ${p1.filter(r => !r.hasValidation || !r.hasAuth).length} |
| P2 (Medium) | ${p2.length} | ${p2.filter(r => r.hasValidation && r.hasAuth).length} | ${p2.filter(r => !r.hasValidation || !r.hasAuth).length} |

## P0 Routes (Fix First)

${p0.map(r => `
### ${r.path}
- [ ] Input Validation: ${r.hasValidation ? '✅' : '❌'}
- [ ] Authentication: ${r.hasAuth ? '✅' : '❌'}
- [ ] Audit Logging: ${r.hasAudit ? '✅' : '❌'}
- [ ] Standard Response: ${r.hasStandardResponse ? '✅' : '❌'}
`).join('\n')}

## P1 Routes (Fix Second)

${p1.map(r => `
### ${r.path}
- [ ] Input Validation: ${r.hasValidation ? '✅' : '❌'}
- [ ] Authentication: ${r.hasAuth ? '✅' : '❌'}
- [ ] Audit Logging: ${r.hasAudit ? '✅' : '❌'}
- [ ] Standard Response: ${r.hasStandardResponse ? '✅' : '❌'}
`).join('\n')}

## P2 Routes (Fix Last)

${p2.map(r => `
### ${r.path}
- [ ] Input Validation: ${r.hasValidation ? '✅' : '❌'}
- [ ] Authentication: ${r.hasAuth ? '✅' : '❌'}
- [ ] Audit Logging: ${r.hasAudit ? '✅' : '❌'}
- [ ] Standard Response: ${r.hasStandardResponse ? '✅' : '❌'}
`).join('\n')}

## Quick Fix Template

\`\`\`typescript
import { createApiRoute, api } from '@/lib/api-route'
import { createCaseSchema } from '@/lib/validation'

export const POST = createApiRoute({
  method: 'POST',
  auth: true,
  validateBody: createCaseSchema,
  auditAction: 'CASE_CREATE',
  auditResource: 'case',
  handler: async ({ body }, user) => {
    // Your logic here
    return api.success({ data: body }, 'Created', 201)
  }
})
\`\`\`

## Automated Fix Commands

\`\`\`bash
# Fix all P0 routes
npm run fix:routes:p0

# Fix all P1 routes
npm run fix:routes:p1

# Fix all routes
npm run fix:routes:all
\`\`\`
`

  return report
}

function main() {
  console.log('🔍 Scanning API routes...')
  
  const routeFiles = findRoutes(API_DIR)
  console.log(`Found ${routeFiles.length} routes`)
  
  const routes = routeFiles.map(checkRoute)
  const report = generateReport(routes)
  
  fs.writeFileSync(OUTPUT_FILE, report)
  console.log(`✅ Report generated: ${OUTPUT_FILE}`)
  
  // Print summary
  const fixed = routes.filter(r => r.hasValidation && r.hasAuth).length
  const total = routes.length
  console.log(`\n📊 Progress: ${fixed}/${total} routes fixed (${Math.round(fixed/total*100)}%)`)
}

main()
