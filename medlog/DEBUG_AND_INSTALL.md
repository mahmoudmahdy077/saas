# MedLog SaaS Debug & Installation System

## Installation Script

### Quick Start

```bash
# Download
cd /root/.openclaw/workspace/saas-project/medlog

# Run (requires root)
sudo ./install-medlog.sh
```

### Features

**User-Friendly Interface:**
- ✅ Beautiful colored output with Unicode symbols
- ✅ Progress bars for long operations
- ✅ Interactive prompts (confirm before continuing)
- ✅ Step-by-step progress (11 steps total)
- ✅ Real-time status updates
- ✅ Clear error messages with recovery instructions

**Safety Features:**
- ✅ Pre-installation checklist
- ✅ System requirements check (RAM, disk, OS)
- ✅ Error handling with detailed logs
- ✅ Aborts on first error (won't break partial installs)
- ✅ Keeps existing Node.js if preferred

**What It Does:**

| Step | Action | Description |
|------|--------|-------------|
| 1 | Permissions | Verify root access |
| 2 | Requirements | Check RAM (2GB+), disk (10GB+), internet |
| 3 | Node.js | Install v20 LTS (or keep existing) |
| 4 | PM2 | Install process manager |
| 5 | Directories | Create /var/log/medlog, etc. |
| 6 | Repository | Setup/update code |
| 7 | Dependencies | npm install with progress |
| 8 | Build | Compile Next.js app |
| 9 | Security | Auto-fix vulnerabilities |
| 10 | Environment | Create .env.local template |
| 11 | Start | Configure PM2 cluster mode |

### Output Example

```
╔══════════════════════════════════════════════════════════╗
║     ★ MedLog SaaS Installation                          ║
║     Automated Setup with Error Checking              ║
╚══════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Step 1/11: Checking Permissions
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✓ Running as root

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Step 2/11: System Requirements
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  → Operating System: Ubuntu 24.04 LTS
  ✓ RAM: 16GB
  ✓ Disk Space: 280GB free
  ✓ Internet Connection: Active
```

### Error Handling

If installation fails, you'll see:

```
╔══════════════════════════════════════════════════════════╗
║          INSTALLATION FAILED                        ║
╚══════════════════════════════════════════════════════════╝

  ✗ Installation failed at line 234 (exit code: 1)

What went wrong:
  Check the detailed log file for error messages

Log file: /var/log/medlog/install-2026-03-27-093045.log

Next steps:
  1. View the log: tail -100 /var/log/medlog/install-*.log
  2. Fix the reported error
  3. Re-run: sudo ./install-medlog.sh

Need help?
  - Check documentation: DEBUG_AND_INSTALL.md
  - Review logs: /var/log/medlog/
```

### Log Files

- **Installation logs:** `/var/log/medlog/install-YYYY-MM-DD-HHMMSS.log`
- **Application logs:** `/var/log/medlog/error-*.log`, `/var/log/medlog/out-*.log`
- **Debug logs:** `/var/log/medlog/medlog-debug.log`

---

## Debug Log System

### Features

- **5 log levels:** debug, info, warn, error, critical
- **Auto-rotation:** Logs rotate at 10MB
- **Search:** Filter by level, module, date, message
- **Export:** Download logs as JSON or text
- **API access:** `/api/debug-logs` endpoint

### Usage in Code

```typescript
import logger from '@/lib/debug-logger';

// Basic logging
logger.info('module-name', 'Message here');
logger.debug('module-name', 'Debug info', { data: 'here' });
logger.warn('module-name', 'Warning message');
logger.error('module-name', 'Error occurred', error);
logger.critical('module-name', 'Critical failure', error);

// Log API requests
logger.logRequest('GET', '/api/users', 200, 45, 'user-123');

// Log database queries
logger.logQuery('SELECT * FROM users', [], 23);
```

### API Endpoints

#### Get Log Stats
```bash
curl http://localhost:8081/api/debug-logs?action=stats
```

#### Get Recent Logs
```bash
curl http://localhost:8081/api/debug-logs?action=recent&count=100
```

#### Search Logs
```bash
curl "http://localhost:8081/api/debug-logs?action=search&level=error&module=database&q=failed"
```

#### Export Logs
```bash
curl "http://localhost:8081/api/debug-logs?action=export&format=json" -o logs.json
```

#### Clear Logs
```bash
curl -X POST "http://localhost:8081/api/debug-logs?action=clear"
```

---

## Troubleshooting

### Installation Failed

1. Check the log file:
   ```bash
   cat /var/log/medlog/install-*.log
   ```

2. Fix the reported error

3. Re-run installation:
   ```bash
   sudo ./install-medlog.sh
   ```

### Application Not Starting

1. Check PM2 status:
   ```bash
   pm2 status medlog-saas
   ```

2. Check logs:
   ```bash
   pm2 logs medlog-saas
   ```

3. Check debug logs:
   ```bash
   cat /var/log/medlog/medlog-debug.log | tail -100
   ```

### Debug Log Issues

1. Check log directory permissions:
   ```bash
   ls -la /var/log/medlog/
   ```

2. Fix permissions:
   ```bash
   chmod 755 /var/log/medlog
   chmod 644 /var/log/medlog/*.log
   ```

---

## Files Created

```
medlog/
├── install-medlog.sh              # Installation script
├── web/
│   ├── lib/
│   │   └── debug-logger.ts        # Debug logging utility
│   └── app/
│       └── api/
│           └── debug-logs/
│               └── route.ts       # Debug log API
└── /var/log/medlog/               # Log directory
    ├── install-*.log              # Installation logs
    ├── medlog-debug.log           # Debug logs
    ├── error-*.log                # PM2 error logs
    └── out-*.log                  # PM2 output logs
```
