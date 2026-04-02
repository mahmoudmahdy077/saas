# ACP Configuration - Hermes Agent

## Overview

This project is configured to use ACP (Agent Communication Protocol) with the Hermes agent for automated development tasks.

## Agent Configuration

**Primary Agent:** Hermes
- **Model:** bailian/qwen3.5-plus
- **Capabilities:**
  - Code Review
  - Testing
  - Documentation
  - Debugging

**Workspace:** `/root/.openclaw/workspace/saas-project/medlog`
**Focus:** MedLog SaaS Development

## Usage

### Spawn Hermes Agent

```bash
# Using OpenClaw CLI
openclaw sessions spawn --agent=hermes --task="Review this code"

# Or programmatically
sessions_spawn({
  agentId: 'hermes',
  task: 'Your task here',
  runtime: 'acp'
})
```

### Task Routing

Tasks are automatically routed to Hermes:
- Code reviews → Hermes
- Testing → Hermes
- Documentation → Hermes
- Debugging → Hermes

### Session Management

Sessions are persistent and kept after completion for continuity.

## Configuration Files

- `.opencode.json` - ACP agent configuration
- `acp/` - ACP session storage (auto-created)

## Available Commands

```bash
# List active agents
openclaw agents list

# Spawn Hermes agent
openclaw sessions spawn --agent=hermes --task="Task description"

# Check session status
openclaw sessions list

# View session history
openclaw sessions history <session-id>
```

## Integration with MedLog SaaS

Hermes agent is configured to understand:
- MedLog SaaS codebase structure
- TypeScript/Next.js patterns
- Testing frameworks (Vitest, Playwright)
- Security best practices
- Enterprise requirements

## Example Tasks

```typescript
// Code Review
hermes.review('/src/app/api/cases/route.ts')

// Testing
hermes.test('Add unit tests for validation.ts')

// Documentation
hermes.document('Generate API documentation for /api/cases')

// Debugging
hermes.debug('Fix TypeScript errors in test files')
```

## Status

✅ ACP Enabled
✅ Hermes Agent Configured
✅ Task Routing Active
✅ Persistent Sessions

---

**Last Updated:** April 2, 2026
**Version:** 1.0.0
