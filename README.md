# Code driven BI backend framework

## Install for dev
```bash
# Copy example env file
cp .env.example .env
# Run docker container
docker compose up -d
```

## migrations
```bash
# Introspection db
npm run generate:db
# Create empty migrations
npm run migrate:make
# Run migrations
npm run migrate
# Rollback migrations
npm run migrate:rollback
```