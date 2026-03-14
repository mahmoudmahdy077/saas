#!/bin/bash
# Migrate console.* to logger in API routes

cd /root/.openclaw/workspace/saas-project/medlog/web/src/app/api

# Add logger import to files that have console.error
for file in $(grep -l "console.error" **/*.ts **/**/*.ts 2>/dev/null); do
  echo "Migrating $file..."
  
  # Add logger import if not present
  if ! grep -q "import { logger }" "$file"; then
    sed -i "1i import { logger } from '@/lib/logger'" "$file"
  fi
  
  # Replace console.error with logger.error (basic replacement)
  sed -i "s/console.error(\([^)]*\))/logger.error(\1, undefined, { route: '\/api\/$(basename $file .ts)'})/g" "$file"
  
  echo "  ✓ Migrated $file"
done

echo "Migration complete!"
