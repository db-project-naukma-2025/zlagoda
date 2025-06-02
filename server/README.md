# zlagoda-server

This app forms the backend of the zlagoda project. This includes the API and the database.

## Requirements

- Python 3.11+
- Poetry

## Getting Started

1. Install Dependencies

    ```bash
    poetry env activate

    pip -m install poetry
    poetry install
    ```

1. Run the migrations

    As database schema can be changed from time to time, we have implemented an in-house migration system. Every migration is managed by the server side of the project.

    ```bash
    python manage.py migrate
    ```

    If you want to migrate to a specific version, you can do so by passing the number of the migration you want to migrate to.

    ```bash
    python manage.py migrate 002
    ```

## Create new migrations

1. Add a new SQL file in the `app/migrations/` directory, e.g. `002_feature.sql` for applying and `002_feature.reverse.sql` for reverting.

2. Use the same process as above to apply or revert your new migration files.
