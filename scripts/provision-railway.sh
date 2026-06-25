#!/bin/bash
# Provision Railway project, PostgreSQL, backend service, and GitHub connection.
# Requires RAILWAY_API_TOKEN. Optional: RAILWAY_WORKSPACE_ID, GITHUB_REPOSITORY, JWT_SECRET.
set -euo pipefail

API_URL="https://backboard.railway.com/graphql/v2"
PROJECT_NAME="${PROJECT_NAME:-project-name}"
BACKEND_SERVICE_NAME="${PROJECT_NAME}-backend"
CONFIG_PATH="backend/.railway/config.json"
GITHUB_REPO="${GITHUB_REPOSITORY:-gorkemkyolai0666/${PROJECT_NAME}}"

if [ -z "${RAILWAY_API_TOKEN:-}" ]; then
  echo "RAILWAY_API_TOKEN is required"
  exit 1
fi

gql() {
  local query="$1"
  curl -sS -X POST "$API_URL" \
    -H "Authorization: Bearer $RAILWAY_API_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$query"
}

# --- Workspace ID: env var or auto-detect ---
if [ -n "${RAILWAY_WORKSPACE_ID:-}" ]; then
  WORKSPACE_ID="$RAILWAY_WORKSPACE_ID"
  echo "Using RAILWAY_WORKSPACE_ID from environment: $WORKSPACE_ID"
else
  echo "RAILWAY_WORKSPACE_ID not set — auto-detecting workspace ID from Railway API..."
  RESP=$(gql '{"query":"{ me { workspaces { id name } } }"}')
  WORKSPACE_ID=$(echo "$RESP" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    ws = d.get('data', {}).get('me', {}).get('workspaces', [])
    if ws: print(ws[0]['id'])
except: pass
" 2>/dev/null || echo "")

  if [ -z "$WORKSPACE_ID" ]; then
    echo "ERROR: Could not auto-detect Railway workspace ID."
    exit 1
  fi
  echo "Auto-detected workspace ID: $WORKSPACE_ID"
fi

# --- Find or create project ---
echo "Looking for existing Railway project: $PROJECT_NAME"
LOOKUP=$(gql "{\"query\":\"query { workspace(workspaceId: \\\"$WORKSPACE_ID\\\") { projects { edges { node { id name } } } } }\"}")

PROJECT_ID=$(echo "$LOOKUP" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for edge in data.get('data', {}).get('workspace', {}).get('projects', {}).get('edges', []):
    if edge['node']['name'] == '${PROJECT_NAME}':
        print(edge['node']['id'])
        break
" 2>/dev/null || echo "")

IS_NEW_PROJECT=false

if [ -n "$PROJECT_ID" ]; then
  echo "Found existing project: $PROJECT_ID"
else
  echo "Creating Railway project: $PROJECT_NAME"
  PROJECT_RESPONSE=$(gql "{\"query\":\"mutation { projectCreate(input: { name: \\\"$PROJECT_NAME\\\", workspaceId: \\\"$WORKSPACE_ID\\\" }) { id name } }\"}")
  PROJECT_ID=$(echo "$PROJECT_RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if 'errors' in data:
    print('ERROR:' + str(data['errors']), file=sys.stderr)
    sys.exit(1)
print(data['data']['projectCreate']['id'])
")
  IS_NEW_PROJECT=true
  echo "Project ID: $PROJECT_ID"
fi

echo "Fetching project environment and services..."
DETAIL=$(gql "{\"query\":\"query { project(id: \\\"$PROJECT_ID\\\") { environments { edges { node { id name } } } services { edges { node { id name } } } } }\"}")

read -r ENVIRONMENT_ID PG_SERVICE_ID SERVICE_ID <<< "$(echo "$DETAIL" | python3 -c "
import sys, json
data = json.load(sys.stdin)['data']['project']
env_id = ''
for edge in data['environments']['edges']:
    if edge['node']['name'] == 'production':
        env_id = edge['node']['id']
        break
if not env_id and data['environments']['edges']:
    env_id = data['environments']['edges'][0]['node']['id']
pg_id = ''
backend_id = ''
for edge in data['services']['edges']:
    name = edge['node']['name']
    sid = edge['node']['id']
    if name == 'postgres':
        pg_id = sid
    elif name == '${BACKEND_SERVICE_NAME}':
        backend_id = sid
print(env_id, pg_id, backend_id)
")"

echo "Environment ID: $ENVIRONMENT_ID"

CREATED_PG="false"
if [ "$IS_NEW_PROJECT" = true ] || [ -z "$PG_SERVICE_ID" ]; then
  echo "Creating PostgreSQL service..."
  PG_RESPONSE=$(gql "{\"query\":\"mutation { serviceCreate(input: { projectId: \\\"$PROJECT_ID\\\", environmentId: \\\"$ENVIRONMENT_ID\\\", name: \\\"postgres\\\", source: { image: \\\"postgres:16\\\" } }) { id name } }\"}")
  PG_SERVICE_ID=$(echo "$PG_RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if 'errors' in data:
    print('ERROR:' + str(data['errors']), file=sys.stderr)
    sys.exit(1)
print(data['data']['serviceCreate']['id'])
")
  CREATED_PG="true"
  echo "PostgreSQL Service ID: $PG_SERVICE_ID"
else
  echo "Using existing PostgreSQL service: $PG_SERVICE_ID"
fi

if [ "$IS_NEW_PROJECT" = true ] || [ -z "$SERVICE_ID" ]; then
  echo "Creating backend service..."
  BACKEND_RESPONSE=$(gql "{\"query\":\"mutation { serviceCreate(input: { projectId: \\\"$PROJECT_ID\\\", environmentId: \\\"$ENVIRONMENT_ID\\\", name: \\\"$BACKEND_SERVICE_NAME\\\" }) { id name } }\"}")
  SERVICE_ID=$(echo "$BACKEND_RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if 'errors' in data:
    print('ERROR:' + str(data['errors']), file=sys.stderr)
    sys.exit(1)
print(data['data']['serviceCreate']['id'])
")
  echo "Backend Service ID: $SERVICE_ID"
else
  echo "Using existing backend service: $SERVICE_ID"
fi

JWT_SECRET_VALUE="${JWT_SECRET:-$(openssl rand -hex 32)}"
FRONTEND_URL_VALUE="${FRONTEND_URL:-https://${PROJECT_NAME}.vercel.app}"

echo "Reading existing Railway environment variables..."
ENV_CONFIG=$(gql "{\"query\":\"query { environment(id: \\\"$ENVIRONMENT_ID\\\") { config(decryptVariables: true) } }\"}")

read -r EXISTING_DB_URL EXISTING_PG_PASSWORD <<< "$(echo "$ENV_CONFIG" | python3 -c "
import sys, json
data = json.load(sys.stdin)
config = data.get('data', {}).get('environment', {}).get('config', {}) or {}
services = config.get('services', {}) or {}
backend = services.get('${SERVICE_ID}', {}) or {}
pg = services.get('${PG_SERVICE_ID}', {}) or {}
db_url = backend.get('variables', {}).get('DATABASE_URL', {}).get('value', '')
pg_pass = pg.get('variables', {}).get('POSTGRES_PASSWORD', {}).get('value', '')
print(db_url, pg_pass)
" 2>/dev/null || echo " ")"

STAGE_PG_VARS="true"
if [ -n "$EXISTING_DB_URL" ]; then
  DATABASE_URL="$EXISTING_DB_URL"
  PG_PASSWORD="${EXISTING_PG_PASSWORD:-}"
  STAGE_PG_VARS="false"
  echo "Using existing DATABASE_URL from Railway environment"
elif [ "$CREATED_PG" = "true" ]; then
  PG_PASSWORD="${PROJECT_NAME}$(openssl rand -hex 4)"
  DATABASE_URL="postgresql://${PROJECT_NAME}:${PG_PASSWORD}@postgres.railway.internal:5432/${PROJECT_NAME}"
  echo "Generated credentials for new PostgreSQL service"
else
  PG_PASSWORD="${PROJECT_NAME}$(openssl rand -hex 4)"
  DATABASE_URL="postgresql://${PROJECT_NAME}:${PG_PASSWORD}@postgres.railway.internal:5432/${PROJECT_NAME}"
  echo "Initializing PostgreSQL credentials for existing service (first-time setup)"
fi

echo "Staging backend deploy config..."
COMBINED_STAGE_QUERY=$(STAGE_PG_VARS="$STAGE_PG_VARS" PG_PASSWORD="$PG_PASSWORD" DATABASE_URL="$DATABASE_URL" FRONTEND_URL_VALUE="$FRONTEND_URL_VALUE" python3 -c "
import json, os

backend_service = {
    'source': {
        'repo': '${GITHUB_REPO}', 
        'branch': 'main',
        'rootDirectory': 'backend'
    },
    'build': {
        'builder': 'NIXPACKS'
    },
    'variables': {
        'JWT_SECRET': {'value': '${JWT_SECRET_VALUE}'},
        'PORT': {'value': '8080'},
        'FRONTEND_URL': {'value': os.environ['FRONTEND_URL_VALUE']},
        'DATABASE_URL': {'value': os.environ['DATABASE_URL']},
    },
}

services = {'${SERVICE_ID}': backend_service}

if os.environ.get('STAGE_PG_VARS') == 'true':
    services['${PG_SERVICE_ID}'] = {
        'variables': {
            'POSTGRES_USER': {'value': '${PROJECT_NAME}'},
            'POSTGRES_PASSWORD': {'value': os.environ['PG_PASSWORD']},
            'POSTGRES_DB': {'value': '${PROJECT_NAME}'},
        },
    }

payload = {'services': services}
query = {
    'query': '''mutation(\$environmentId: String!, \$input: EnvironmentConfig!, \$merge: Boolean) {
        environmentStageChanges(environmentId: \$environmentId, input: \$input, merge: \$merge) { id }
    }''',
    'variables': {
        'environmentId': '${ENVIRONMENT_ID}',
        'input': payload,
        'merge': True,
    }
}
print(json.dumps(query))
")

STAGE_RESPONSE=$(curl -sS -X POST "$API_URL" \
  -H "Authorization: Bearer $RAILWAY_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$COMBINED_STAGE_QUERY")

echo "$STAGE_RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if 'errors' in data:
    print('WARN: Combined staging failed:', data['errors'], file=sys.stderr)
    sys.exit(1)
else:
    print('Backend deploy config staged successfully')
"

COMMIT_QUERY="{\"query\":\"mutation { environmentPatchCommitStaged(environmentId: \\\"$ENVIRONMENT_ID\\\", commitMessage: \\\"Configure deploy from nixpacks configuration\\\", skipDeploys: false) }\"}"

COMMIT_RESPONSE=$(gql "$COMMIT_QUERY")
echo "$COMMIT_RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if 'errors' in data:
    print('WARN: Commit staged changes failed:', data['errors'], file=sys.stderr)
    sys.exit(1)
else:
    print('Railway deployment triggered')
"

if [ "$STAGE_PG_VARS" = "true" ] && [ "$CREATED_PG" = "false" ]; then
  echo "Redeploying PostgreSQL to apply first-time credentials..."
  gql "{\"query\":\"mutation { serviceInstanceRedeploy(serviceId: \\\"$PG_SERVICE_ID\\\", environmentId: \\\"$ENVIRONMENT_ID\\\") }\"}" >/dev/null || true
fi

echo "Ensuring public Railway domain for backend..."
DOMAIN_CHECK=$(gql "{\"query\":\"query { service(id: \\\"$SERVICE_ID\\\") { serviceDomains { edges { node { domain } } } } }\"}")
HAS_DOMAIN=$(echo "$DOMAIN_CHECK" | python3 -c "
import sys, json
data = json.load(sys.stdin)
edges = data.get('data', {}).get('service', {}).get('serviceDomains', {}).get('edges', [])
print('yes' if edges else 'no')
" 2>/dev/null || echo "no")

if [ "$HAS_DOMAIN" = "no" ]; then
  DOMAIN_CREATE=$(gql "{\"query\":\"mutation { serviceDomainCreate(input: { environmentId: \\\"$ENVIRONMENT_ID\\\", serviceId: \\\"$SERVICE_ID\\\" }) { id } }\"}")
  echo "$DOMAIN_CREATE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if 'errors' in data:
    print('WARN: serviceDomainCreate failed:', data['errors'], file=sys.stderr)
    sys.exit(1)
else:
    print('Public Railway domain created')
"
else
  echo "Public Railway domain already exists"
fi

mkdir -p "$(dirname "$CONFIG_PATH")"
cat > "$CONFIG_PATH" <<EOF
{
  "projectId": "$PROJECT_ID",
  "environmentId": "$ENVIRONMENT_ID",
  "serviceId": "$SERVICE_ID",
  "postgresServiceId": "$PG_SERVICE_ID"
}
EOF

echo "Railway config written to $CONFIG_PATH"
cat "$CONFIG_PATH"