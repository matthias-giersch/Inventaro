#!/usr/bin/env bash

set -e

db_hosts=()
cmd_start_index=0
index=1

for arg in "$@"; do
    if [[ "$arg" == *:* ]]; then
        db_hosts+=("$arg")
    else
        cmd_start_index=$index
        break
    fi
    ((index++))
done

cmd=("${@:cmd_start_index}")

for db in "${db_hosts[@]}"; do
    host="${db%%:*}"
    port="${db##*:}"

    echo "Waiting for $host:$port ..."

    until nc -z "$host" "$port"; do
        sleep 2
    done

    echo "Database $host:$port is up!"
done

echo "Executing: ${cmd[@]}"
exec "${cmd[@]}"
