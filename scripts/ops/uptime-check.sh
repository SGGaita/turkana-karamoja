#!/usr/bin/env bash
# Uptime check (WP-38): each address must answer 200 within 20 s; a failure is retried once after 30 s, so a single
# slow moment doesn't raise an alarm. Prints one line per address; exits 1 if any is down, with the details in
# $GITHUB_OUTPUT (`down`) when run in GitHub Actions.
#
#   scripts/ops/uptime-check.sh https://www.example.org/ https://cms.example.org/wp-json/karamoja/v1/globals
set -uo pipefail
down=""
for url in "$@"; do
  ok=""
  for attempt in 1 2; do
    read -r code time < <(curl -s -o /dev/null -m 20 -w '%{http_code} %{time_total}' -A 'KaramojaUptime/1.0 (+github actions)' "$url")
    if [ "$code" = 200 ]; then ok=1; break; fi
    [ "$attempt" = 1 ] && sleep "${UPTIME_RETRY_WAIT:-30}"
  done
  if [ -n "$ok" ]; then
    echo "up    $url ($code, ${time}s)"
  else
    echo "DOWN  $url (answered ${code:-nothing}; 000 = no answer within 20 s)"
    down="${down}- \`${url}\`: ${code:-no answer} at $(date -u '+%Y-%m-%d %H:%M UTC')"$'\n'
  fi
done
if [ -n "${GITHUB_OUTPUT:-}" ]; then
  { echo "down<<EOF"; printf '%s' "$down"; echo "EOF"; } >> "$GITHUB_OUTPUT"
fi
[ -z "$down" ]
