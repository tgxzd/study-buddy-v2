#!/bin/sh
set -e

echo "Waiting for database..."
until pg_isready -q "$DATABASE_HOST" 2>/dev/null; do
  sleep 1
done

echo "Database is ready!"

echo "Generating Prisma Client..."
yarn prisma generate

echo "Running database migrations..."
yarn prisma migrate deploy

echo "Initialization complete!"
