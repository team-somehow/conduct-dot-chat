#!/bin/bash

# MAHA Wrapper - Agent Startup Script
# This script starts all available agents in the background

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[MAHA]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -i :$port >/dev/null 2>&1; then
        return 1  # Port is in use
    else
        return 0  # Port is available
    fi
}

# Function to wait for agent to be ready
wait_for_agent() {
    local port=$1
    local name=$2
    local max_attempts=30
    local attempt=1
    
    print_status "Waiting for $name to be ready on port $port..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:$port/health >/dev/null 2>&1; then
            print_success "$name is ready on port $port"
            return 0
        fi
        sleep 1
        attempt=$((attempt + 1))
    done
    
    print_error "$name failed to start on port $port after $max_attempts seconds"
    return 1
}

# Function to start an agent
start_agent() {
    local agent_dir=$1
    local agent_name=$2
    local port=$3
    local command=$4
    
    print_status "Starting $agent_name..."
    
    # Check if port is available
    if ! check_port $port; then
        print_warning "Port $port is already in use. $agent_name may already be running."
        return 1
    fi
    
    # Check if agent directory exists
    if [ ! -d "agents/$agent_dir" ]; then
        print_error "Agent directory 'agents/$agent_dir' not found"
        return 1
    fi
    
    # Create logs directory if it doesn't exist
    mkdir -p logs
    
    # Start the agent in background
    cd agents/$agent_dir
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies for $agent_name..."
        npm install >/dev/null 2>&1
    fi
    
    # Start the agent
    print_status "Launching $agent_name with command: $command"
    $command > ../../logs/$agent_dir.log 2>&1 &
    local pid=$!
    echo $pid > ../../logs/$agent_dir.pid
    
    cd - > /dev/null
    
    # Wait for agent to be ready
    if wait_for_agent $port "$agent_name"; then
        print_success "$agent_name started successfully (PID: $pid)"
        return 0
    else
        print_error "Failed to start $agent_name"
        return 1
    fi
}

# Function to stop all agents
stop_agents() {
    print_status "Stopping all agents..."
    
    for pidfile in logs/*.pid; do
        if [ -f "$pidfile" ]; then
            pid=$(cat "$pidfile")
            agent_name=$(basename "$pidfile" .pid)
            
            if kill -0 $pid 2>/dev/null; then
                print_status "Stopping $agent_name (PID: $pid)..."
                kill $pid
                rm "$pidfile"
                print_success "$agent_name stopped"
            else
                print_warning "$agent_name (PID: $pid) was not running"
                rm "$pidfile"
            fi
        fi
    done
}

# Function to show status of all agents
show_status() {
    print_status "Agent Status:"
    echo ""
    
    # Check Hello Agent (Port 3001)
    if check_port 3001; then
        echo -e "  🤖 Hello Agent      │ ${RED}STOPPED${NC} │ Port 3001"
    else
        echo -e "  🤖 Hello Agent      │ ${GREEN}RUNNING${NC} │ Port 3001 │ http://localhost:3001"
    fi
    
    # Check ImageGen Agent (Port 3002)
    if check_port 3002; then
        echo -e "  🎨 ImageGen Agent   │ ${RED}STOPPED${NC} │ Port 3002"
    else
        echo -e "  🎨 ImageGen Agent   │ ${GREEN}RUNNING${NC} │ Port 3002 │ http://localhost:3002"
    fi
    
    # Check NFT Deployer Agent (Port 3003)
    if check_port 3003; then
        echo -e "  🚀 NFT Deployer     │ ${RED}STOPPED${NC} │ Port 3003"
    else
        echo -e "  🚀 NFT Deployer     │ ${GREEN}RUNNING${NC} │ Port 3003 │ http://localhost:3003"
    fi
    
    echo ""
}

# Main script logic
case "$1" in
    "start")
        print_status "Starting MAHA Protocol Agents..."
        echo ""
        
        # Start Hello Agent
        start_agent "hello" "Hello Agent" 3001 "npm run dev"
        
        # Start ImageGen Agent  
        start_agent "imagegen" "ImageGen Agent" 3002 "npm start"
        
        # Start NFT Deployer Agent
        start_agent "nft-deployer" "NFT Deployer Agent" 3003 "npm run dev"
        
        echo ""
        print_success "All agents startup initiated!"
        echo ""
        show_status
        echo ""
        print_status "Agent logs are available in the 'logs/' directory"
        print_status "Use './start-agents.sh status' to check agent status"
        print_status "Use './start-agents.sh stop' to stop all agents"
        ;;
        
    "stop")
        stop_agents
        echo ""
        show_status
        ;;
        
    "restart")
        print_status "Restarting all agents..."
        stop_agents
        sleep 2
        echo ""
        exec "$0" start
        ;;
        
    "status")
        show_status
        ;;
        
    "logs")
        if [ -z "$2" ]; then
            print_status "Available log files:"
            ls -la logs/*.log 2>/dev/null | awk '{print "  " $9}'
            echo ""
            print_status "Usage: $0 logs <agent>"
            print_status "Example: $0 logs hello"
        else
            if [ -f "logs/$2.log" ]; then
                print_status "Showing logs for $2 agent (Press Ctrl+C to exit):"
                tail -f "logs/$2.log"
            else
                print_error "Log file for '$2' not found"
            fi
        fi
        ;;
        
    *)
        echo ""
        echo -e "${BLUE}MAHA Protocol - Agent Management Script${NC}"
        echo ""
        echo "Usage: $0 {start|stop|restart|status|logs [agent]}"
        echo ""
        echo "Commands:"
        echo "  start    - Start all agents in background"
        echo "  stop     - Stop all running agents"
        echo "  restart  - Restart all agents"
        echo "  status   - Show status of all agents"
        echo "  logs     - Show available logs or tail specific agent log"
        echo ""
        echo "Examples:"
        echo "  $0 start"
        echo "  $0 status"
        echo "  $0 logs hello"
        echo ""
        ;;
esac 