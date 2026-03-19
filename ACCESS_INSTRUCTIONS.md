# 🔧 MedLog SaaS - Access Instructions

## Server Status
✅ **Running:** PM2 cluster mode (6 instances)  
✅ **Port:** 8081  
✅ **Status:** Online  

---

## 🌐 ACCESS URLS

### Primary Access (Local Network)
```
http://localhost:8081/
```

### External Access (If firewall allows)
```
http://194.146.13.223:8081/
```

---

## 🔍 TROUBLESHOOTING

### If you can't access the site:

#### 1. Check if server is running:
```bash
pm2 status medlog-saas
```

#### 2. Check port is listening:
```bash
netstat -tlnp | grep 8081
```

#### 3. Test locally:
```bash
curl http://localhost:8081/
```

#### 4. Check firewall (if external access needed):
```bash
# On server, allow port 8081
ufw allow 8081/tcp
```

#### 5. Restart server:
```bash
cd /root/.openclaw/workspace/saas-project/medlog/web
pm2 restart medlog-saas
```

---

## 📱 PAGES AVAILABLE

| Page | URL |
|------|-----|
| Home | / |
| Dashboard | /dashboard |
| Cases | /cases |
| Settings | /settings |
| Analytics | /analytics |
| Video | /video |
| Billing | /billing |
| Admin | /admin |
| Notifications | /notifications |
| AI Scan | /ai-scan |
| Courses | /courses |
| Marketplace | /marketplace |
| Mentorship | /mentorship |
| Compliance | /compliance |
| SSO | /sso |
| Audit Log | /audit-log |
| Jobs | /jobs |
| Integrations | /integrations |
| I18n | /i18n |

---

## 🔧 MANAGEMENT COMMANDS

### View logs:
```bash
pm2 logs medlog-saas
```

### Restart:
```bash
pm2 restart medlog-saas
```

### Stop:
```bash
pm2 stop medlog-saas
```

### Monitor:
```bash
pm2 monit
```

---

## ✅ VERIFICATION

Run this to verify everything is working:
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/dashboard
# Should return: 200
```

---

**Last Updated:** March 19, 2026  
**Version:** 4.0.0
