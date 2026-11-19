
#!/bin/bash
set -euo pipefail

# The Git commit SHA is passed in by GitHub Actions.
IMAGE_TAG="${1:?Missing image tag}"

# AWS and ECR configuration.
AWS_REGION="eu-west-1"
AWS_ACCOUNT_ID="550097745706"
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

# Version tracking files on EC2.
VERSION_DIR="/opt/dropbox"
CURRENT_VERSION_FILE="${VERSION_DIR}/current-version"
PREVIOUS_VERSION_FILE="${VERSION_DIR}/previous-version"

BACKEND_IMAGE="${ECR_REGISTRY}/dropbox-backend:${IMAGE_TAG}"
FRONTEND_IMAGE="${ECR_REGISTRY}/dropbox-frontend:${IMAGE_TAG}"

echo "Starting deployment of ${IMAGE_TAG}"

# Read the version currently running in production.
if [ ! -f "$CURRENT_VERSION_FILE" ]; then
  echo "Error: Current production version file is missing."
  exit 1
fi

OLD_TAG=$(cat "$CURRENT_VERSION_FILE")

if [ -z "$OLD_TAG" ]; then
  echo "Error: Current production version is empty."
  exit 1
fi

echo "Current production version: ${OLD_TAG}"

# Retrieve application settings from Parameter Store.
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

# Pull the new images before touching production.
echo "Pulling new backend image..."
docker pull "${ECR_REGISTRY}/dropbox-backend:${IMAGE_TAG}"

echo "Pulling new frontend image..."
docker pull "${ECR_REGISTRY}/dropbox-frontend:${IMAGE_TAG}"

# Also ensure the previous images are available for rollback.
echo "Checking previous production images..."
docker pull "${ECR_REGISTRY}/dropbox-backend:${OLD_TAG}"
docker pull "${ECR_REGISTRY}/dropbox-frontend:${OLD_TAG}"

# Make sure the existing Docker network is available.
docker network inspect dropbox-network >/dev/null

# Start a version and check that the application responds.
deploy_and_check() {
  local TAG="$1"

  local BACKEND="${ECR_REGISTRY}/dropbox-backend:${TAG}"
  local FRONTEND="${ECR_REGISTRY}/dropbox-frontend:${TAG}"

  echo "Starting backend version ${TAG}..."

  docker rm -f dropbox-frontend dropbox-backend >/dev/null 2>&1 || true

  docker run -d \
    --name dropbox-backend \
    --network dropbox-network \
    --network-alias backend \
    "${PARAM_ENV[@]}" \
    --env NODE_ENV=production \
    --env PORT=3000 \
    --env STORAGE_DRIVER=s3 \
    --env MAX_UPLOAD_MB=50 \
    --env UPLOAD_DIR=/app/uploads \
    "$BACKEND" >/dev/null || return 1

  echo "Starting frontend version ${TAG}..."

  docker run -d \
    --name dropbox-frontend \
    --network dropbox-network \
    --publish 80:80 \
    "$FRONTEND" >/dev/null || return 1

  # Give the application time to start, then check its health.
  echo "Checking application health..."

  for attempt in $(seq 1 30); do
    if curl -fsS http://localhost/health >/dev/null 2>&1 &&
       curl -fsS http://localhost/ >/dev/null 2>&1; then
      echo "Health checks passed for version ${TAG}."
      return 0
    fi

    echo "Health check attempt ${attempt}/30 failed. Retrying..."
    sleep 5
  done

  echo "Health checks failed for version ${TAG}."
  return 1
}

# Try deploying the new version.
if deploy_and_check "$IMAGE_TAG"; then

  # Record the old and new production versions.
  echo "$OLD_TAG" > "${PREVIOUS_VERSION_FILE}.tmp"
  mv "${PREVIOUS_VERSION_FILE}.tmp" "$PREVIOUS_VERSION_FILE"

  echo "$IMAGE_TAG" > "${CURRENT_VERSION_FILE}.tmp"
  mv "${CURRENT_VERSION_FILE}.tmp" "$CURRENT_VERSION_FILE"

  echo "Deployment of ${IMAGE_TAG} completed successfully."

else

  echo "Deployment failed. Restoring previous version ${OLD_TAG}..."

  # Restore the previous production version.
  if deploy_and_check "$OLD_TAG"; then
    echo "Rollback successful. Version ${OLD_TAG} is running."
  else
    echo "CRITICAL: Automatic rollback failed."
    echo "Production may require manual recovery."
  fi

  # Report the deployment as failed even if rollback succeeded.
  exit 1
fi

# Display the running containers.
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
