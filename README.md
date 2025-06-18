# zlagoda

## Getting Started

1. Copy `.env.sample` to `.env` and adjust credentials if needed.

1. Start the PostgreSQL container:

   ```bash
   docker-compose up -d
   ```

1. See [server/README.md](server/README.md) for more details on backend setup.

1. See [client/README.md](client/README.md) for more details on frontend setup.

### Enter psql Shell

To open an interactive psql shell inside the running container:

```bash
docker exec -it database-zlagoda bash -c "psql -U $DB_USER -d $DB_NAME"
```
