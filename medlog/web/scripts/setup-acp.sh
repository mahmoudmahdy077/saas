#!/bin/bash
# ACP Hermes Agent Setup Script
# Usage: ./scripts/setup-acp.sh

set -e

echo "🔧 Setting up ACP with Hermes Agent..."

# Check if .opencode.json exists
if [ ! -f ".opencode.json" ]; then
  echo "❌ .opencode.json not found"
  exit 1
fi

# Validate configuration
echo "✓ Validating ACP configuration..."
if ! cat .opencode.json | python3 -m json.tool > /dev/null 2>&1; then
  echo "❌ Invalid JSON in .opencode.json"
  exit 1
fi

# Check ACP enabled
if ! grep -q '"enabled": true' .opencode.json; then
  echo "❌ ACP not enabled in configuration"
  exit 1
fi

# Check Hermes agent configured
if ! grep -q '"hermes"' .opencode.json; then
  echo "❌ Hermes agent not configured"
  exit 1
fi

echo "✅ ACP Configuration Valid"
echo ""
echo "📋 Configuration Summary:"
echo "  - Default Agent: Hermes"
echo "  - Model: bailian/qwen3.5-plus"
echo "  - Capabilities: code-review, testing, documentation, debugging"
echo "  - Sessions: Persistent"
echo ""
echo "🚀 Usage Examples:"
echo ""
echo "  # Spawn Hermes agent"
echo "  openclaw sessions spawn --agent=hermes --task='Your task'"
echo ""
echo "  # List active sessions"
echo "  openclaw sessions list"
echo ""
echo "  # Check session history"
echo "  openclaw sessions history <session-id>"
echo ""
echo "✅ ACP with Hermes Agent is ready!"
