/**
 * MedLog Debug Log System
 * Comprehensive logging utility for debugging and monitoring
 */

import * as fs from 'fs';
import * as path from 'path';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: any;
  stack?: string;
}

class DebugLogger {
  private logDir: string;
  private logFile: string;
  private maxLogSize: number;
  private maxLogs: number;
  private enabled: boolean;

  constructor(options?: {
    logDir?: string;
    logFile?: string;
    maxLogSize?: number; // in MB
    maxLogs?: number;
    enabled?: boolean;
  }) {
    this.logDir = options?.logDir || '/var/log/medlog';
    this.logFile = options?.logFile || 'medlog-debug.log';
    this.maxLogSize = options?.maxLogSize || 10; // 10MB
    this.maxLogs = options?.maxLogs || 5;
    this.enabled = options?.enabled ?? process.env.NODE_ENV !== 'production';

    this.ensureLogDirectory();
    this.rotateLogs();
  }

  private ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true, mode: 0o755 });
    }
  }

  private rotateLogs() {
    const logPath = path.join(this.logDir, this.logFile);
    
    if (!fs.existsSync(logPath)) {
      return;
    }

    const stats = fs.statSync(logPath);
    const sizeMB = stats.size / (1024 * 1024);

    if (sizeMB > this.maxLogSize) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const rotatedPath = path.join(this.logDir, `medlog-debug-${timestamp}.log`);
      fs.renameSync(logPath, rotatedPath);
      
      // Clean old logs
      this.cleanupOldLogs();
    }
  }

  private cleanupOldLogs() {
    const files = fs.readdirSync(this.logDir)
      .filter(f => f.startsWith('medlog-debug-') && f.endsWith('.log'))
      .sort()
      .reverse();

    files.slice(this.maxLogs).forEach(file => {
      fs.unlinkSync(path.join(this.logDir, file));
    });
  }

  private formatEntry(level: LogLevel, module: string, message: string, data?: any): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
    };

    if (data !== undefined) {
      entry.data = data;
    }

    return entry;
  }

  private write(entry: LogEntry) {
    if (!this.enabled) return;

    const logPath = path.join(this.logDir, this.logFile);
    const logLine = JSON.stringify(entry) + '\n';

    fs.appendFileSync(logPath, logLine, { mode: 0o644 });

    // Also log to console in development
    if (process.env.NODE_ENV !== 'production') {
      this.logToConsole(entry);
    }
  }

  private logToConsole(entry: LogEntry) {
    const colors = {
      debug: '\x1b[36m',    // Cyan
      info: '\x1b[32m',     // Green
      warn: '\x1b[33m',     // Yellow
      error: '\x1b[31m',    // Red
      critical: '\x1b[35m', // Magenta
    };

    const reset = '\x1b[0m';
    const color = colors[entry.level];
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();

    console.log(`${color}[${timestamp}][${entry.level.toUpperCase()}][${entry.module}]${reset} ${entry.message}`);

    if (entry.data) {
      console.log(color, entry.data, reset);
    }

    if (entry.stack) {
      console.log(color, entry.stack, reset);
    }
  }

  debug(module: string, message: string, data?: any) {
    this.write(this.formatEntry('debug', module, message, data));
  }

  info(module: string, message: string, data?: any) {
    this.write(this.formatEntry('info', module, message, data));
  }

  warn(module: string, message: string, data?: any) {
    const entry = this.formatEntry('warn', module, message, data);
    this.write(entry);
  }

  error(module: string, message: string, error?: Error | any) {
    const entry = this.formatEntry('error', module, message);
    
    if (error instanceof Error) {
      entry.data = {
        name: error.name,
        message: error.message,
      };
      entry.stack = error.stack;
    } else if (error) {
      entry.data = error;
    }

    this.write(entry);
  }

  critical(module: string, message: string, error?: Error | any) {
    const entry = this.formatEntry('critical', module, message);
    
    if (error instanceof Error) {
      entry.data = {
        name: error.name,
        message: error.message,
      };
      entry.stack = error.stack;
    } else if (error) {
      entry.data = error;
    }

    this.write(entry);
    
    // Also log to stderr for critical errors
    console.error(`[CRITICAL][${module}] ${message}`, error);
  }

  // Log API requests
  logRequest(method: string, url: string, statusCode: number, duration: number, userId?: string) {
    const level: LogLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    
    this.write({
      timestamp: new Date().toISOString(),
      level,
      module: 'http',
      message: `${method} ${url}`,
      data: {
        statusCode,
        duration: `${duration}ms`,
        userId: userId || 'anonymous',
      },
    });
  }

  // Log database queries
  logQuery(query: string, params: any[], duration: number, error?: Error) {
    const level: LogLevel = error ? 'error' : 'debug';
    
    this.write({
      timestamp: new Date().toISOString(),
      level,
      module: 'database',
      message: error ? 'Query failed' : 'Query executed',
      data: {
        query,
        params: params || [],
        duration: `${duration}ms`,
        error: error?.message,
      },
      stack: error?.stack,
    });
  }

  // Get recent logs
  getRecentLogs(count: number = 100): LogEntry[] {
    const logPath = path.join(this.logDir, this.logFile);
    
    if (!fs.existsSync(logPath)) {
      return [];
    }

    const content = fs.readFileSync(logPath, 'utf-8');
    const lines = content.trim().split('\n').filter(line => line.trim());
    
    return lines
      .slice(-count)
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter((entry): entry is LogEntry => entry !== null);
  }

  // Search logs
  searchLogs(query: {
    level?: LogLevel;
    module?: string;
    from?: Date;
    to?: Date;
    messageContains?: string;
  }): LogEntry[] {
    const logs = this.getRecentLogs(10000);

    return logs.filter(log => {
      if (query.level && log.level !== query.level) return false;
      if (query.module && log.module !== query.module) return false;
      if (query.from && new Date(log.timestamp) < query.from) return false;
      if (query.to && new Date(log.timestamp) > query.to) return false;
      if (query.messageContains && !log.message.includes(query.messageContains)) return false;
      return true;
    });
  }

  // Export logs
  exportLogs(format: 'json' | 'text' = 'json'): string {
    const logs = this.getRecentLogs(10000);

    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    }

    // Text format
    return logs.map(log => {
      const timestamp = new Date(log.timestamp).toLocaleString();
      return `[${timestamp}][${log.level.toUpperCase()}][${log.module}] ${log.message}`;
    }).join('\n');
  }

  // Clear logs
  clearLogs() {
    const logPath = path.join(this.logDir, this.logFile);
    if (fs.existsSync(logPath)) {
      fs.unlinkSync(logPath);
    }
  }

  // Get log stats
  getStats() {
    const logPath = path.join(this.logDir, this.logFile);
    
    if (!fs.existsSync(logPath)) {
      return {
        exists: false,
        size: 0,
        entries: 0,
      };
    }

    const stats = fs.statSync(logPath);
    const content = fs.readFileSync(logPath, 'utf-8');
    const lines = content.trim().split('\n').filter(line => line.trim());

    return {
      exists: true,
      size: stats.size,
      sizeMB: (stats.size / (1024 * 1024)).toFixed(2),
      entries: lines.length,
      path: logPath,
    };
  }
}

// Create singleton instance
export const logger = new DebugLogger();

// Export for use in API routes
export default logger;
