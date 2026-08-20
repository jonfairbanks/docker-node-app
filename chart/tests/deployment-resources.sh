#!/usr/bin/env bash

set -euo pipefail

chart_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
rendered_manifest="$(mktemp)"
trap 'rm -f "$rendered_manifest"' EXIT

helm template docker-node-app "$chart_dir" > "$rendered_manifest"

awk '
  /^kind: Deployment$/ { in_deployment = 1; next }
  in_deployment && /^---$/ { exit }
  in_deployment && /^          resources:$/ { in_resources = 1; next }
  in_resources && /^            limits:$/ { in_limits = 1; next }
  in_resources && /^            requests:$/ { in_limits = 0; in_requests = 1; next }
  in_limits && /^              memory: 192Mi$/ { memory_limit = 1; next }
  in_limits && /^              cpu:/ { cpu_limit = 1; next }
  in_requests && /^              cpu: 10m$/ { cpu_request = 1; next }
  in_requests && /^              memory: 128Mi$/ { memory_request = 1; next }
  END {
    exit !(memory_limit && memory_request && cpu_request && !cpu_limit)
  }
' "$rendered_manifest"
