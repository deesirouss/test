#!/bin/bash

# Backend Deployment Script
# This script handles ECR login, Docker build, push, and EC2 deployment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check required environment variables
check_env_vars() {
    local required_vars=("AWS_REGION" "ECR_REPOSITORY" "GITHUB_SHA" "ECR_REGISTRY" "EC2_INSTANCE_ID" "DB_URL")
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            print_error "Environment variable $var is not set"
            exit 1
        fi
    done
    print_status "All required environment variables are set"
}

# Login to ECR
ecr_login() {
    echo "Logging into Amazon ECR..."
    
    if ! aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$ECR_REGISTRY"; then
        print_error "ECR login failed"
        exit 1
    fi
    
    print_status "ECR login successful"
}

# Build Docker image
build_image() {
    echo "Building Docker image..."
    
    cd backend || {
        print_error "Backend directory not found"
        exit 1
    }
    
    if ! docker build -t "$ECR_REGISTRY/$ECR_REPOSITORY:$GITHUB_SHA" .; then
        print_error "Docker build failed"
        exit 1
    fi
    
    print_status "Docker image built successfully"
    cd ..
}

# Push image to ECR
push_image() {
    echo "Pushing image to ECR..."
    
    if ! docker push "$ECR_REGISTRY/$ECR_REPOSITORY:$GITHUB_SHA"; then
        print_error "Docker push failed"
        exit 1
    fi
    
    print_status "Image pushed to ECR successfully"
    
    # Tag and push as latest for the current branch
    local branch_name="${GITHUB_REF#refs/heads/}"
    docker tag "$ECR_REGISTRY/$ECR_REPOSITORY:$GITHUB_SHA" "$ECR_REGISTRY/$ECR_REPOSITORY:$branch_name-latest"
    
    if ! docker push "$ECR_REGISTRY/$ECR_REPOSITORY:$branch_name-latest"; then
        print_error "Failed to push latest tag"
        exit 1
    fi
    
    print_status "Latest tag pushed successfully"
}

# Deploy to EC2
deploy_to_ec2() {
    echo "Deploying to EC2..."
    
    local branch_name="${GITHUB_REF#refs/heads/}"
    local image_tag="$branch_name-latest"
    
    # Create deployment script
    local script_content=$(cat <<EOF
#!/bin/bash
LOG_FILE="/var/log/cicd-backend-deployment.log"
echo "=== Backend Deployment Started at \$(date) ===" > \$LOG_FILE
if docker ps -q -f name=cicd-backend; then
    echo "Stopping existing cicd-backend container..." | tee -a \$LOG_FILE
    docker stop cicd-backend 2>&1 | tee -a \$LOG_FILE
fi
if docker ps -aq -f name=cicd-backend; then
    echo "Removing existing cicd-backend container..." | tee -a \$LOG_FILE
    docker rm cicd-backend 2>&1 | tee -a \$LOG_FILE
fi
echo "Cleaning up old images..." | tee -a \$LOG_FILE
docker images --format "table {{.Repository}}:{{.Tag}}" | grep "$ECR_REGISTRY/$ECR_REPOSITORY" | grep -v "$image_tag" | xargs -r docker rmi 2>&1 | tee -a \$LOG_FILE || true
echo "Logging into ECR..." | tee -a \$LOG_FILE
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY 2>&1 | tee -a \$LOG_FILE
echo "Pulling latest image..." | tee -a \$LOG_FILE
docker pull $ECR_REGISTRY/$ECR_REPOSITORY:$image_tag 2>&1 | tee -a \$LOG_FILE
echo "Starting new cicd-backend container..." | tee -a \$LOG_FILE
docker run -d --name cicd-backend --restart unless-stopped -p 3001:3001 -e NODE_ENV=production -e PORT=3001 -e DATABASE_URL=$DB_URL $ECR_REGISTRY/$ECR_REPOSITORY:$image_tag 2>&1 | tee -a \$LOG_FILE
echo "Backend deployment completed successfully at \$(date)!" | tee -a \$LOG_FILE
echo "=== Deployment Log End ===" >> \$LOG_FILE
EOF
)
    
    if ! aws ssm send-command \
      --document-name "AWS-RunShellScript" \
      --targets "[{\"Key\":\"InstanceIds\",\"Values\":[\"$EC2_INSTANCE_ID\"]}]" \
      --parameters "{\"commands\":[\"echo '$script_content' > /tmp/deploy.sh\", \"chmod +x /tmp/deploy.sh\", \"/tmp/deploy.sh\"]}" \
      --region "$AWS_REGION"; then
        print_error "EC2 deployment failed"
        exit 1
    fi
    
    print_status "Backend deployed successfully to EC2!"
}

# Main execution
main() {
    echo "🚀 Starting backend deployment..."
    
    check_env_vars
    ecr_login
    build_image
    push_image
    deploy_to_ec2
    
    echo "🎉 Backend deployment completed successfully!"
}

# Run main function
main "$@"