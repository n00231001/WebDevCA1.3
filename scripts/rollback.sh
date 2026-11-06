
#!/bin/bash
set -euo pipefail

# AWS and ECR configuration.
AWS_REGION="eu-west-1"
AWS_ACCOUNT_ID="550097745706"
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

VERSION_DIR="/opt/dropbox"
CURRENT_VERSION_FILE="${VERSION_DIR}/current-version"
PREVIOUS_VERSION_FILE="${VERSION_DIR}/previous-version"

# Check that the version tracking files exist.
if [ ! -f "$CURRENT_VERSION_FILE" ] || [ ! -f "$PREVIOUS_VERSION_FILE" ]; then
  echo "Error: Current or previous version file is missing."
  exit 1
fi

CURRENT_TAG=$(cat "$CURRENT_VERSION_FILE")

# Use a supplied version, or default to the previous version.
ROLLBACK_TAG="${1:-$(cat "$PREVIOUS_VERSION_FILE")}"

if [ -z "$ROLLBACK_TAG" ]; then
  echo "Error: No rollback version was provided."
  exit 1
fi

if [ "$ROLLBACK_TAG" = "$CURRENT_TAG" ]; then
  echo "Error: That version is already running."
  exit 1
fi

echo "Current production version: ${CURRENT_TAG}"
echo "Rolling back to: ${ROLLBACK_TAG}"

# Retrieve application settings from Parameter Store.
PARAMETERS_JSON=$(aws ssm get-parameters-by-path \
  --region "$AWS_REGION" \
  --path "/dropbox/" \
  --with-decryption \
  --output json)

PARAMETER_COUNT=$(printf '%s' "$PARAMETERS_JSON" | jq '.Parameters | length')

if [ "$PARAMETER_COUNT" -ne 8 ]; then
  echo "Error: Expected 8 Parameter Store values, received ${PARAMETER_COUNT}"
  exit 1
fi

mapfile -t PARAM_ENV < <(
  printf '%s' "$PARAMETERS_JSON" |
    jq -r '.Parameters[] | "--env=\(.Name | split("/")[-1])=\(.Value)"'
)

# Log in to ECR.
aws ecr get-login-password --region "$AWS_REGION" |
  docker login --username AWS --password-stdin "$ECR_REGISTRY"

# Pull both images before replacing the running containers.
docker pull "${ECR_REGISTRY}/dropbox-backend:${ROLLBACK_TAG}"
docker pull "${ECR_REGISTRY}/dropbox-frontend:${ROLLBACK_TAG}"

# Confirm the Docker network exists.
docker network inspect dropbox-network >/dev/null

echo "Stopping current production containers..."
docker rm -f dropbox-frontend dropbox-backend >/dev/null 2>&1 || true

echo "Starting previous backend version..."
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
  "${ECR_REGISTRY}/dropbox-backend:${ROLLBACK_TAG}"

echo "Starting previous frontend version..."
docker run -d \
  --name dropbox-frontend \
  --network dropbox-network \
  --publish 80:80 \
  "${ECR_REGISTRY}/dropbox-frontend:${ROLLBACK_TAG}"

# Check that both services respond.
echo "Checking application health..."

HEALTHY=false

for attempt in $(seq 1 30); do
  if curl -fsS http://localhost/health >/dev/null 2>&1 &&
     curl -fsS http://localhost/ >/dev/null 2>&1; then
    HEALTHY=true
    break
  fi

  echo "Health check attempt ${attempt}/30 failed. Retrying..."
  sleep 5
done

if [ "$HEALTHY" != "true" ]; then
  echo "Error: Rollback health checks failed."
  exit 1
fi

# Record the version that was replaced and the restored version.
echo "$CURRENT_TAG" > "${PREVIOUS_VERSION_FILE}.tmp"
mv "${PREVIOUS_VERSION_FILE}.tmp" "$PREVIOUS_VERSION_FILE"

echo "$ROLLBACK_TAG" > "${CURRENT_VERSION_FILE}.tmp"
mv "${CURRENT_VERSION_FILE}.tmp" "$CURRENT_VERSION_FILE"

echo "Rollback completed successfully."
echo "Production is now running version ${ROLLBACK_TAG}."

docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
