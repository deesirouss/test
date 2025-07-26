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
    local required_vars=("AWS_REGION" "ECR_REPOSITORY" "IMAGE_TAG" "EC2_HOST" "EC2_USER" "DATABASE_URL")
    
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
    echo "Logging in to EC2 and deploying..."
    
    if ! aws ssm send-command \
      --document-name "AWS-RunShellScript" \
      --targets "[{\"Key\":\"InstanceIds\",\"Values\":[\"$EC2_INSTANCE_ID\"]}]" \
      --parameters "{\"commands\":[\"docker system prune -af\", \"docker pull $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG\", \"docker run -d -p 3001:3001 $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG\"]}" \
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