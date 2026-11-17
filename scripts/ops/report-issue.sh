#!/usr/bin/env bash
# Keep one GitHub issue per check (WP-38): open it (or comment on the open one) when the check fails, close it when the
# check passes again. GitHub emails everyone watching the repository about new issues and comments.
#
#   scripts/ops/report-issue.sh fail  <label> "<title>" <body file>
#   scripts/ops/report-issue.sh ok    <label> "<recovery comment>"
#
# Needs `gh` and GH_TOKEN (in Actions: the workflow's GITHUB_TOKEN with `issues: write`).
set -euo pipefail
state="$1"; label="$2"; text="$3"; body="${4:-}"
gh label create "$label" --color B60205 --description "Opened and closed by the WP-38 checks" --force >/dev/null 2>&1 || true
open="$(gh issue list --label "$label" --state open --limit 1 --json number --jq '.[0].number // empty')"
case "$state" in
  fail)
    if [ -n "$open" ]; then
      gh issue comment "$open" --body-file "$body" >/dev/null
      echo "Updated #$open"
    else
      gh issue create --label "$label" --title "$text" --body-file "$body"
    fi
    ;;
  ok)
    if [ -n "$open" ]; then
      gh issue close "$open" --comment "$text" >/dev/null
      echo "Closed #$open"
    fi
    ;;
  *) echo "first argument: fail or ok" >&2; exit 2 ;;
esac
