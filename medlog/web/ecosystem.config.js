module.exports = {
  apps: [{
    name: 'medlog-saas',
    script: 'npm',
    args: 'start',
    cwd: '/root/.openclaw/workspace/saas-project/medlog/web',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: '8081',
      HOSTNAME: '0.0.0.0'
    },
    error_file: '/var/log/medlog/error.log',
    out_file: '/var/log/medlog/out.log',
    log_file: '/var/log/medlog/combined.log',
    time: true
  }]
}
