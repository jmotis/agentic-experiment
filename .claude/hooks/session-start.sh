#!/bin/bash
set -euo pipefail

# Only run in remote (web) environments
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# Set max output tokens for all sessions
echo 'export CLAUDE_CODE_MAX_OUTPUT_TOKENS=64000' >> "$CLAUDE_ENV_FILE"
