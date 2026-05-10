#!/usr/bin/env bash
set -euo pipefail

# -----------------------------------------------------------------------------
# Starts the whole development stack:
#   1. Keycloak (Docker)             →   http://localhost:8080
#   2. search-api (Fastify)          →   http://localhost:3001
#   3. ansearch-component (Astro)    →   http://localhost:4321
#   4. main-site (Next.js)           →   http://localhost:3000
#
# Each service is started in its own subshell/background job.
# The script waits for Keycloak to become reachable before continuing so that
# the other services can immediately talk to it.
# -----------------------------------------------------------------------------

###############################################################################
# Helper: wait until an HTTP endpoint is up
###############################################################################
wait_for_http() {
  local url="$1"
  echo -n "Waiting for $url "
  until curl -fsS "$url" >/dev/null 2>&1; do
    echo -n "."
    sleep 2
  done
  echo " ✓"
}

###############################################################################
# Helper: ensure that a hostname resolves to 127.0.0.1 in /etc/hosts
###############################################################################
ensure_host_entry() {
  local host="$1"
  if ! grep -qE "^[[:space:]]*127\.0\.0\.1[[:space:]]+$host(\\s|$)" /etc/hosts; then
    echo "▶ Adding $host → 127.0.0.1 to /etc/hosts (requires sudo)"
    echo "127.0.0.1 $host" | sudo tee -a /etc/hosts >/dev/null
  fi
}

###############################################################################
# Ensure dev hostnames resolve locally
###############################################################################
ensure_host_entry "furmountain.local"
ensure_host_entry "search.furmountain.local"

###############################################################################
# 1. Keycloak
###############################################################################
echo "▶ Starting Keycloak …"
(keycloak/start.sh) &
KEYCLOAK_PID=$!

# Wait until Keycloak’s OpenID-configuration endpoint is reachable
wait_for_http "http://localhost:8080/realms/master/.well-known/openid-configuration"

###############################################################################
# 2. search-api
###############################################################################
echo "▶ Starting search-api …"
(
  cd search-api
  npm install
  npm run dev
) &
SEARCH_API_PID=$!

###############################################################################
# 3. ansearch-component
###############################################################################
echo "▶ Building & starting search-component …"
(
  cd search-component
  npm run build
  npm run preview
) &
ANSEARCH_PID=$!

###############################################################################
# 4. main-site
###############################################################################
echo "▶ Starting main-site …"
(
  cd main-site
  npm install
  npm run dev
) &
MAIN_SITE_PID=$!

###############################################################################
# Wait for all background jobs; forward Ctrl-C to them for clean shutdown
###############################################################################
trap 'echo; echo "Stopping…"; kill $MAIN_SITE_PID $ANSEARCH_PID $SEARCH_API_PID $KEYCLOAK_PID 2>/dev/null; wait' INT
wait
