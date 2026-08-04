#!/bin/bash

# Start all backend services for Suit Masters

echo "🚀 Starting Suit Masters Backend Services..."

# Function to start a service
start_service() {
    local service_name=$1
    local service_dir=$2
    local port=$3
    
    echo "📦 Starting $service_name..."
    cd "$service_dir" || exit 1
    
    # Check if service is already running
    if lsof -ti:$port > /dev/null 2>&1; then
        echo "   ✅ $service_name is already running on port $port"
    else
        # Start service in background
        npm run dev > "/tmp/${service_name}.log" 2>&1 &
        echo $! > "/tmp/${service_name}.pid"
        echo "   ✅ $service_name started on port $port (PID: $!)"
        echo "   📝 Logs: /tmp/${service_name}.log"
    fi
}

# Start services
start_service "Product Service" "services/product-service" 4000
start_service "Cart Service" "services/cart-service" 10000
start_service "Order Service" "services/order-service" 4001
start_service "Payment Service" "services/payment-service" 4002

echo ""
echo "🔍 Checking service status..."
echo ""

# Check if services are responding
check_service() {
    local service_name=$1
    local port=$2
    local endpoint=$3
    
    sleep 2
    if curl -s "http://localhost:$port$endpoint" > /dev/null 2>&1; then
        echo "✅ $service_name (port $port) is responding"
    else
        echo "❌ $service_name (port $port) is not responding"
    fi
}

check_service "Product Service" 4000 "/health"
check_service "Cart Service" 10000 "/health"
check_service "Order Service" 4001 "/health"
check_service "Payment Service" 4002 "/health"

echo ""
echo "🎉 Services started! Use 'pkill -f \"npm run dev\"' to stop all services"
echo "📊 Service PIDs:"
for service in "Product Service" "Cart Service" "Order Service" "Payment Service"; do
    pid_file="/tmp/${service// /_}.pid"
    if [ -f "$pid_file" ]; then
        pid=$(cat "$pid_file")
        echo "   $service: PID $pid"
    fi
done