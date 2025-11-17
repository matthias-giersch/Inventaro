#!/usr/bin/env bash

set -e

db="$1"
shift
cmd=("$@")

db_host="${db%%:*}"
db_port="${db##*:}"

echo "Waiting for database at $db_host:$db_port ..."

until nc -z "$db_host" "$db_port"; do
    echo "Waiting for $db_host:$db_port..."
    sleep 5
done

echo "Database is up!"
exec "${cmd[@]}"
