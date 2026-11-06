
#!/bin/bash
set -euo pipefail

# The Git commit SHA is passed in by GitHub Actions.
IMAGE_TAG="${1:?Missing image tag}"

# AWS and ECR configuration.
AWS_REGION="eu-west-1"
AWS_ACCOUNT_ID="550097745706"
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

BACKEND_IMAGE="${ECR_REGISTRY}/dropbox-backend:${IMAGE_TAG}"
FRONTEND_IMAGE="${ECR_REGISTRY}/dropbox-frontend:${IMAGE_TAG}"

echo "Starting deployment of ${IMAGE_TAG}"

# Retrieve application settings from Parameter Store.
# SecureString values are decrypted but never printed.
PARAMETERS_JSON=$(aws ssm get-parameters-by-path \
  --region "$AWS_REGION" \
  --path "/dropbox/" \
  --with-decryption \
  --output json)

# Make sure all eight expected parameters were retrieved.
PARAMETER_COUNT=$(printf '%s' "$PARAMETERS_JSON" | jq '.Parameters | length')

if [ "$PARAMETER_COUNT" -ne 8 ]; then
  echo "Error: Expected 8 Parameter Store values, received ${PARAMETER_COUNT}"
  exit 1
fi

# Convert the parameters into Docker environment arguments.
mapfile -t PARAM_ENV < <(
  printf '%s' "$PARAMETERS_JSON" |
    jq -r '.Parameters[] | "--env=\(.Name | split("/")[-1])=\(.Value)"'
)

# Log in to Amazon ECR.
aws ecr get-login-password --region "$AWS_REGION" |
  docker login --username AWS --password-stdin "$ECR_REGISTRY"

# Pull both images before stopping the existing containers.
echo "Pulling backend image..."
docker pull "$BACKEND_IMAGE"

echo "Pulling frontend image..."
docker pull "$FRONTEND_IMAGE"

# Make sure the existing Docker network is available.
docker network inspect dropbox-network >/dev/null

# Remove the existing containers.
echo "Replacing existing containers..."
docker rm -f dropbox-frontend dropbox-backend 2>/dev/null || true

# Start the backend.
docker run -d \
  --name dropbox-backend \
  --network dropbox-network \
  "${PARAM_ENV[@]}" \
  --env NODE_ENV=production \
  --env PORT=3000 \
  --env STORAGE_DRIVER=s3 \
  --env MAX_UPLOAD_MB=50 \
  --env UPLOAD_DIR=/app/uploads \
  "$BACKEND_IMAGE"

# Start the frontend.
docker run -d \
  --name dropbox-frontend \
  --network dropbox-network \
  --publish 80:80 \
  "$FRONTEND_IMAGE"

echo "Deployment completed successfully."
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
