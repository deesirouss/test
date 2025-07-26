#!/bin/bash
LOG_FILE="/root/deployment/cicd-backend-deployment.log"
container_name="cicd-backend"
ECR_REGISTRY="484436835922.dkr.ecr.us-east-1.amazonaws.com"
ECR_REPOSITORY="test"
image_tag="main-latest"
DB_URL="postgresql://cicd_user:cicd_password@cicd-postgres:5432/cicd_workshop?sslmode=disable"

# Create log file
echo "=== Backend Deployment Started at $(date) ===" > $LOG_FILE

# Stop existing container if running
if docker ps -q -f name=$container_name >/dev/null 2>&1; then
    echo "Stopping existing cicd-backend container..." | tee -a $LOG_FILE
    docker stop $container_name 2>&1 | tee -a $LOG_FILE
else
    echo "No running cicd-backend container found" | tee -a $LOG_FILE
fi

# Remove existing container if exists
if docker ps -aq -f name=$container_name >/dev/null 2>&1; then
    echo "Removing existing cicd-backend container..." | tee -a $LOG_FILE
    docker rm $container_name 2>&1 | tee -a $LOG_FILE
else
    echo "No cicd-backend container to remove" | tee -a $LOG_FILE
fi

# Clean up all images
echo "Cleaning up all images..." | tee -a $LOG_FILE
docker rmi -f $(docker images -q) 2>&1 | tee -a $LOG_FILE || echo "No images to remove" | tee -a $LOG_FILE

# Login to ECR
echo "Logging into ECR..." | tee -a $LOG_FILE
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_REGISTRY 2>&1 | tee -a $LOG_FILE

# Pull latest image
echo "Pulling latest image..." | tee -a $LOG_FILE
docker pull $ECR_REGISTRY/$ECR_REPOSITORY:$image_tag 2>&1 | tee -a $LOG_FILE

# Start new container
echo "Starting new cicd-backend container..." | tee -a $LOG_FILE
docker run -d --name cicd-backend --network cicd-backend --restart unless-stopped -p 3001:3001 -e NODE_ENV=production -e PORT=3001 -e DATABASE_URL=$DB_URL $ECR_REGISTRY/$ECR_REPOSITORY:$image_tag 2>&1 | tee -a $LOG_FILE

echo "Backend deployment completed successfully at $(date)!" | tee -a $LOG_FILE
echo "=== Deployment Log End ===" >> $LOG_FILE