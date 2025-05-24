# zlagoda

## Getting Started

### 1. Start the Containers

1. Copy `.env.sample` to `.env` and adjust credentials if needed.
2. Start the PostgreSQL container:
   ```bash
   docker-compose up -d
   ```

### 2. Apply Migrations

```bash
docker exec -i database-zlagoda bash -c "psql -U $POSTGRES_USER -d $POSTGRES_DB" < migrations/001_init_up.sql
```

### 3. Revert Migrations

```bash
docker exec -i database-zlagoda bash -c "psql -U $POSTGRES_USER -d $POSTGRES_DB" < migrations/001_init_down.sql
```

### 4. Create New Migrations

1. Add a new SQL file in the `migrations/` directory, e.g. `002_feature_up.sql` for applying and `002_feature_down.sql` for reverting.
2. Use the same process as above to apply or revert your new migration files.

### 5. Enter psql Shell

To open an interactive psql shell inside the running container:

```bash
docker exec -it database-zlagoda bash -c "psql -U $POSTGRES_USER -d $POSTGRES_DB"
```
