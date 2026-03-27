#!/bin/bash
# Daily autopilot maintenance for MedLog SaaS

echo "=== MEDLOG AUTOPILOT ==="
echo "TypeScript check..."
npx tsc --noEmit --pretty 2>&1 | head -20

echo -e "\nBuild check..."
npm run build 2>&1 | tail -10

echo -e "\nSecurity audit..."
npm audit 2>&1 | tail -5

echo -e "\n=== DONE ==="