#!/bin/bash
# MedLog SaaS Production Start Script
cd /root/.openclaw/workspace/saas-project/medlog/web

# Set environment variables for external access
export NODE_ENV=production
export PORT=8081
export HOSTNAME=0.0.0.0

# Start with Next.js
exec npx next start -p 8081 -H 0.0.0.0
