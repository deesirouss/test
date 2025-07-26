#!/bin/sh
set -e

echo "🚀 Starting application entrypoint..."

echo "🔄 Running database migrations..."
node src/migrations/migrate.js

if [ $? -eq 0 ]; then
    echo "✅ Migrations completed successfully"
    echo "🌟 Starting server..."
    exec node src/server.js
else
    echo "❌ Migration failed, exiting..."
    exit 1
fi