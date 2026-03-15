#!/usr/bin/env bash
set -euo pipefail

CONTAINER_NAME="keycloak-demo"
IMAGE="quay.io/keycloak/keycloak:latest"
KEYCLOAK_URL="http://localhost:8080"
REALM="furmountain"
ADMIN_USER="admin"
ADMIN_PASSWORD="admin"

DEMO_USERNAME="niklas"
DEMO_EMAIL="niklas@micro-frontends-demo.furmountain.net"
DEMO_FIRST_NAME="Niklas"
DEMO_LAST_NAME="Furberg"
DEMO_PASSWORD="test123"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REALM_IMPORT_DIR="$SCRIPT_DIR/realms"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed or not in PATH."
  exit 1
fi

if [ ! -f "$REALM_IMPORT_DIR/furmountain-realm.json" ]; then
  echo "Missing realm file: $REALM_IMPORT_DIR/furmountain-realm.json"
  exit 1
fi

echo "Removing old container if it exists..."
docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true

echo "Starting Keycloak with realm import..."
docker run -d \
  --name "$CONTAINER_NAME" \
  -p 8080:8080 \
  -e KEYCLOAK_ADMIN="$ADMIN_USER" \
  -e KEYCLOAK_ADMIN_PASSWORD="$ADMIN_PASSWORD" \
  -v "$REALM_IMPORT_DIR:/opt/keycloak/data/import" \
  "$IMAGE" \
  start-dev --import-realm >/dev/null

echo "Waiting for Keycloak to become ready..."
until curl -fsS "$KEYCLOAK_URL/realms/master/.well-known/openid-configuration" >/dev/null 2>&1; do
  sleep 2
done

echo "Logging into Keycloak admin CLI..."
docker exec "$CONTAINER_NAME" /opt/keycloak/bin/kcadm.sh config credentials \
  --server "$KEYCLOAK_URL" \
  --realm master \
  --user "$ADMIN_USER" \
  --password "$ADMIN_PASSWORD" >/dev/null

echo "Checking whether demo user already exists..."
USER_ID="$(
  docker exec "$CONTAINER_NAME" /opt/keycloak/bin/kcadm.sh get users \
    -r "$REALM" \
    -q "username=$DEMO_USERNAME" \
    --fields id,username --format json \
  | python3 -c 'import json,sys; data=json.load(sys.stdin); print(data[0]["id"] if data else "")'
)"

if [ -z "$USER_ID" ]; then
  echo "Creating demo user $DEMO_USERNAME..."
  docker exec "$CONTAINER_NAME" /opt/keycloak/bin/kcadm.sh create users \
    -r "$REALM" \
    -s username="$DEMO_USERNAME" \
    -s enabled=true \
    -s email="$DEMO_EMAIL" \
    -s emailVerified=true \
    -s firstName="$DEMO_FIRST_NAME" \
    -s lastName="$DEMO_LAST_NAME" >/dev/null

  USER_ID="$(
    docker exec "$CONTAINER_NAME" /opt/keycloak/bin/kcadm.sh get users \
      -r "$REALM" \
      -q "username=$DEMO_USERNAME" \
      --fields id,username --format json \
    | python3 -c 'import json,sys; data=json.load(sys.stdin); print(data[0]["id"] if data else "")'
  )"
else
  echo "Demo user already exists."
fi

if [ -z "$USER_ID" ]; then
  echo "Failed to resolve user id for $DEMO_USERNAME."
  exit 1
fi

echo "Setting password for $DEMO_USERNAME..."
docker exec "$CONTAINER_NAME" /opt/keycloak/bin/kcadm.sh set-password \
  -r "$REALM" \
  --userid "$USER_ID" \
  --new-password "$DEMO_PASSWORD" \
  --temporary false >/dev/null

echo
echo "Keycloak started."
echo "Admin console: $KEYCLOAK_URL/admin"
echo "Admin login: $ADMIN_USER / $ADMIN_PASSWORD"
echo "Realm: $REALM"
echo "Demo user: $DEMO_USERNAME / $DEMO_PASSWORD"
echo
echo "Logs:"
echo "docker logs -f $CONTAINER_NAME"
