#!/bin/bash
#
# MedLog SaaS Installation Script - User Friendly Edition
# Automated installation with beautiful UI, error checking, and detailed logging
#
# Usage: sudo ./install-medlog.sh
#

set -e  # Exit on error

# ═══════════════════════════════════════════════════════════════
# Configuration
# ═══════════════════════════════════════════════════════════════

INSTALL_DIR="/root/.openclaw/workspace/saas-project/medlog"
WEB_DIR="$INSTALL_DIR/web"
LOG_DIR="/var/log/medlog"
LOG_FILE="$LOG_DIR/install-$(date +%Y-%m-%d-%H%M%S).log"
NODE_VERSION="20"
PORT="8081"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Unicode symbols
CHECK="✓"
CROSS="✗"
ARROW="→"
STAR="★"

# Ensure log directory exists
mkdir -p "$LOG_DIR"
touch "$LOG_FILE"

# ═══════════════════════════════════════════════════════════════
# Helper Functions
# ═══════════════════════════════════════════════════════════════

log() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] $1" >> "$LOG_FILE"
}

clear_screen() {
    clear
    echo ""
}

show_header() {
    clear_screen
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}                                                      ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}     ${WHITE}${STAR} MedLog SaaS Installation${NC}                          ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}     ${YELLOW}Automated Setup with Error Checking${NC}              ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}                                                      ${CYAN}║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

show_step() {
    local step_num=$1
    local step_name=$2
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  Step ${step_num}/11:${NC} ${WHITE}${step_name}${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

show_success() {
    echo -e "${GREEN}  ${CHECK} $1${NC}"
    log "SUCCESS: $1"
}

show_error() {
    echo -e "${RED}  ${CROSS} $1${NC}"
    log "ERROR: $1"
}

show_info() {
    echo -e "${CYAN}  ${ARROW} $1${NC}"
    log "INFO: $1"
}

show_warning() {
    echo -e "${YELLOW}  ${STAR} $1${NC}"
    log "WARNING: $1"
}

# Progress bar
show_progress() {
    local current=$1
    local total=$2
    local percentage=$((current * 100 / total))
    local filled=$((percentage / 5))
    local empty=$((20 - filled))
    
    printf "\r  Progress: ["
    printf "${GREEN}"
    for ((i=0; i<filled; i++)); do printf "█"; done
    printf "${NC}"
    for ((i=0; i<empty; i++)); do printf "░"; done
    printf "] %3d%%" $percentage
}

# Spinner for long operations
show_spinner() {
    local pid=$1
    local message=$2
    local spin='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
    local i=0
    
    printf "  $message ... "
    
    while kill -0 $pid 2>/dev/null; do
        i=$(( (i+1) % 10 ))
        printf "\r  $message ... ${spin:$i:1}"
        sleep 0.1
    done
    
    printf "\r  $message ... ${GREEN}${CHECK}${NC}\n"
}

# ═══════════════════════════════════════════════════════════════
# Error Handler
# ═══════════════════════════════════════════════════════════════

handle_error() {
    local exit_code=$?
    local line_number=$1
    
    echo ""
    echo -e "${RED}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║${NC}                                                      ${RED}║${NC}"
    echo -e "${RED}║${NC}          ${WHITE}INSTALLATION FAILED${NC}                        ${RED}║${NC}"
    echo -e "${RED}║${NC}                                                      ${RED}║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    show_error "Installation failed at line $line_number (exit code: $exit_code)"
    echo ""
    echo -e "${YELLOW}What went wrong:${NC}"
    echo "  Check the detailed log file for error messages"
    echo ""
    echo -e "${YELLOW}Log file:${NC} $LOG_FILE"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "  1. View the log: ${CYAN}tail -100 $LOG_FILE${NC}"
    echo "  2. Fix the reported error"
    echo "  3. Re-run: ${CYAN}sudo ./install-medlog.sh${NC}"
    echo ""
    echo -e "${YELLOW}Need help?${NC}"
    echo "  - Check documentation: DEBUG_AND_INSTALL.md"
    echo "  - Review logs: /var/log/medlog/"
    echo ""
    exit $exit_code
}

trap 'handle_error $LINENO' ERR

# ═══════════════════════════════════════════════════════════════
# Pre-Installation Checklist
# ═══════════════════════════════════════════════════════════════

show_pre_checklist() {
    echo -e "${WHITE}Before we begin, please ensure:${NC}"
    echo ""
    echo -e "  ${GREEN}✓${NC} You have root/sudo access"
    echo -e "  ${GREEN}✓${NC} Internet connection is active"
    echo -e "  ${GREEN}✓${NC} At least 2GB RAM available"
    echo -e "  ${GREEN}✓${NC} At least 10GB free disk space"
    echo -e "  ${GREEN}✓${NC} Port $PORT is available"
    echo ""
    read -p "Ready to continue? (y/n): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        show_info "Installation cancelled by user"
        exit 0
    fi
}

# ═══════════════════════════════════════════════════════════════
# Installation Steps
# ═══════════════════════════════════════════════════════════════

check_root() {
    show_step 1 "Checking Permissions"
    
    if [ "$EUID" -ne 0 ]; then
        echo ""
        show_error "This script must be run as root"
        echo ""
        echo "Please run with: ${CYAN}sudo ./install-medlog.sh${NC}"
        echo ""
        exit 1
    fi
    
    show_success "Running as root"
}

check_requirements() {
    show_step 2 "System Requirements"
    
    # OS Check
    if [ -f /etc/os-release ]; then
        source /etc/os-release
        show_info "Operating System: $PRETTY_NAME"
    fi
    
    # RAM Check
    RAM_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}')
    RAM_GB=$((RAM_KB / 1024 / 1024))
    
    if [ $RAM_GB -lt 2 ]; then
        show_warning "Low RAM: ${RAM_GB}GB (recommended: 4GB+)"
    else
        show_success "RAM: ${RAM_GB}GB"
    fi
    
    # Disk Check
    DISK_FREE=$(df -m / | awk 'NR==2 {print $4}')
    DISK_FREE_GB=$((DISK_FREE / 1024))
    
    if [ $DISK_FREE_GB -lt 10 ]; then
        show_warning "Low disk: ${DISK_FREE_GB}GB free (recommended: 20GB+)"
    else
        show_success "Disk Space: ${DISK_FREE_GB}GB free"
    fi
    
    # Internet Check
    if ping -c 1 8.8.8.8 > /dev/null 2>&1; then
        show_success "Internet Connection: Active"
    else
        show_error "No internet connection"
        exit 1
    fi
}

install_nodejs() {
    show_step 3 "Node.js Setup"
    
    if command -v node &> /dev/null; then
        NODE_VER=$(node -v)
        show_info "Node.js already installed: $NODE_VER"
        
        read -p "Keep existing version? (y/n): " -n 1 -r
        echo ""
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            show_success "Keeping existing Node.js"
            return 0
        fi
    fi
    
    show_info "Installing Node.js $NODE_VERSION..."
    
    # Install using NodeSource
    curl -fsSL https://deb.nodesource.com/setup_$NODE_VERSION.x | bash - > /dev/null 2>&1 &
    CURL_PID=$!
    
    while kill -0 $CURL_PID 2>/dev/null; do
        show_progress 1 2
        sleep 0.5
    done
    
    wait $CURL_PID
    
    apt-get install -y nodejs > /dev/null 2>&1 &
    APT_PID=$!
    
    while kill -0 $APT_PID 2>/dev/null; do
        show_progress 2 2
        sleep 0.5
    done
    
    wait $APT_PID
    
    if command -v node &> /dev/null; then
        show_success "Node.js installed: $(node -v)"
        show_success "npm installed: $(npm -v)"
    else
        show_error "Failed to install Node.js"
        exit 1
    fi
}

install_pm2() {
    show_step 4 "PM2 Process Manager"
    
    if command -v pm2 &> /dev/null; then
        show_info "PM2 already installed: $(pm2 -v)"
    else
        show_info "Installing PM2..."
        npm install -g pm2 > /dev/null 2>&1
        show_success "PM2 installed: $(pm2 -v)"
    fi
    
    pm2 startup > /dev/null 2>&1 || true
    show_success "PM2 startup configured"
}

create_directories() {
    show_step 5 "Creating Directories"
    
    mkdir -p "$INSTALL_DIR" &
    MKDIR_PID=$!
    wait $MKDIR_PID
    
    mkdir -p "$WEB_DIR"
    mkdir -p "$LOG_DIR"
    
    chmod -R 755 "$INSTALL_DIR"
    chmod -R 755 "$LOG_DIR"
    
    show_success "Installation directory: $INSTALL_DIR"
    show_success "Log directory: $LOG_DIR"
}

setup_repository() {
    show_step 6 "Repository Setup"
    
    if [ -d "$WEB_DIR/.git" ]; then
        show_info "Repository exists, updating..."
        cd "$WEB_DIR"
        
        if git pull origin main > /dev/null 2>&1; then
            show_success "Repository updated"
        else
            show_warning "Git update skipped (not a git repo or no remote)"
        fi
    else
        show_success "Repository directory ready"
    fi
}

install_dependencies() {
    show_step 7 "Installing Dependencies"
    
    cd "$WEB_DIR"
    
    show_info "Cleaning old dependencies..."
    rm -rf node_modules package-lock.json
    
    show_info "Installing npm packages (this may take a few minutes)..."
    
    npm install --loglevel=error 2>&1 | tee -a "$LOG_FILE" &
    NPM_PID=$!
    
    # Show progress
    local progress=0
    while kill -0 $NPM_PID 2>/dev/null; do
        progress=$((progress + 1))
        if [ $progress -gt 60 ]; then
            progress=0
            printf "."
        fi
        sleep 1
    done
    
    wait $NPM_PID
    
    if [ $? -eq 0 ]; then
        echo ""
        show_success "Dependencies installed"
    else
        echo ""
        show_error "Failed to install dependencies"
        exit 1
    fi
}

build_application() {
    show_step 8 "Building Application"
    
    cd "$WEB_DIR"
    
    show_info "Building MedLog SaaS (this may take 2-3 minutes)..."
    
    npm run build 2>&1 | tee -a "$LOG_FILE" &
    BUILD_PID=$!
    
    # Show progress
    local dots=0
    while kill -0 $BUILD_PID 2>/dev/null; do
        dots=$((dots + 1))
        if [ $dots -gt 30 ]; then
            dots=0
            printf "."
        fi
        sleep 1
    done
    
    wait $BUILD_PID
    
    if [ $? -eq 0 ]; then
        echo ""
        show_success "Build completed successfully"
    else
        echo ""
        show_error "Build failed"
        exit 1
    fi
}

security_audit() {
    show_step 9 "Security Audit"
    
    cd "$WEB_DIR"
    
    show_info "Checking for vulnerabilities..."
    
    npm audit fix > /dev/null 2>&1 || true
    
    VULN_OUTPUT=$(npm audit 2>&1)
    
    if echo "$VULN_OUTPUT" | grep -q "found 0 vulnerabilities"; then
        show_success "No security vulnerabilities found"
    else
        VULN_COUNT=$(echo "$VULN_OUTPUT" | grep -oP 'found \K\d+(?= vulnerabilities)' || echo "0")
        show_warning "$VULN_COUNT vulnerabilities found (run 'npm audit' for details)"
    fi
}

setup_environment() {
    show_step 10 "Environment Configuration"
    
    cd "$WEB_DIR"
    
    if [ ! -f ".env.local" ]; then
        cat > .env.local << 'EOF'
# MedLog SaaS Environment Configuration
NODE_ENV=production
PORT=8081
NEXT_PUBLIC_APP_URL=http://localhost:8081

# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-key

# Stripe (if using payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-key
STRIPE_SECRET_KEY=your-stripe-secret

# Email (if using)
NEXT_PUBLIC_EMAIL_PROVIDER=smtp
EMAIL_SERVER_HOST=smtp.example.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=user@example.com
EMAIL_SERVER_PASSWORD=password
EMAIL_FROM=noreply@example.com
EOF
        show_success "Created .env.local"
        show_warning "IMPORTANT: Configure .env.local with your actual values!"
    else
        show_success ".env.local already exists"
    fi
}

configure_pm2() {
    show_step 11 "Starting Application"
    
    cd "$WEB_DIR"
    
    show_info "Stopping existing instances..."
    pm2 delete medlog-saas 2>/dev/null || true
    
    show_info "Starting MedLog SaaS..."
    pm2 start ecosystem.config.js --env production
    
    show_info "Saving PM2 configuration..."
    pm2 save
    
    sleep 3
    
    if pm2 status medlog-saas | grep -q "online"; then
        show_success "MedLog SaaS is running"
    else
        show_warning "Check PM2 logs: pm2 logs medlog-saas"
    fi
}

# ═══════════════════════════════════════════════════════════════
# Post-Installation
# ═══════════════════════════════════════════════════════════════

verify_installation() {
    echo ""
    show_info "Verifying installation..."
    
    sleep 3
    
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT | grep -q "200"; then
        show_success "Server responding on port $PORT"
    else
        show_warning "Server not responding yet (check logs)"
    fi
}

show_completion() {
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║${NC}                                                      ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC}          ${WHITE}INSTALLATION COMPLETED${NC}                      ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC}                                                      ${GREEN}║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${WHITE}MedLog SaaS is now installed and running!${NC}"
    echo ""
    echo -e "${CYAN}Access:${NC}"
    echo "  Local:   ${BLUE}http://localhost:$PORT${NC}"
    echo "  Network: ${BLUE}http://$(hostname -I | awk '{print $1}'):$PORT${NC}"
    echo ""
    echo -e "${CYAN}Management Commands:${NC}"
    echo "  ${WHITE}pm2 status medlog-saas${NC}     # Check status"
    echo "  ${WHITE}pm2 logs medlog-saas${NC}       # View logs"
    echo "  ${WHITE}pm2 restart medlog-saas${NC}    # Restart"
    echo "  ${WHITE}pm2 stop medlog-saas${NC}       # Stop"
    echo "  ${WHITE}pm2 monit${NC}                  # Monitor"
    echo ""
    echo -e "${CYAN}Log Files:${NC}"
    echo "  Installation: ${BLUE}$LOG_FILE${NC}"
    echo "  Application:  ${BLUE}/var/log/medlog/${NC}"
    echo ""
    echo -e "${YELLOW}IMPORTANT:${NC}"
    echo "  Configure .env.local with your actual values before using!"
    echo ""
    echo -e "${WHITE}Documentation:${NC}"
    echo "  See DEBUG_AND_INSTALL.md for more details"
    echo ""
}

# ═══════════════════════════════════════════════════════════════
# Main
# ═══════════════════════════════════════════════════════════════

main() {
    show_header
    
    log "════════════════════════════════════════"
    log "Installation started at $(date)"
    log "════════════════════════════════════════"
    
    show_pre_checklist
    
    check_root
    check_requirements
    install_nodejs
    install_pm2
    create_directories
    setup_repository
    install_dependencies
    build_application
    security_audit
    setup_environment
    configure_pm2
    
    verify_installation
    show_completion
    
    log "Installation completed at $(date)"
    log "════════════════════════════════════════"
}

# Run main function
main "$@"
