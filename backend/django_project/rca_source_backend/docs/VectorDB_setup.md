## Install from PostgreSQL YUM Repository (Recommended for Simplicity)
```
sudo dnf install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-8-x86_64/pgdg-redhat-repo-latest.noarch.rpm
```

### Install pgvector Package. -> Install the pgvector package for your PostgreSQL version. For example, for PostgreSQL 15:
```
sudo dnf install -y pgvector_15
```

### Enable pgvector in PostgreSQL:
- After installation you need to enable the extension within your PostgreSQL database. Connect to PostgreSQL.
    ```bash
    sudo -u postgres psql
    ```

- Create the Extension.
    ```
    CREATE EXTENSION IF NOT EXISTS vector;
    ```

### Verify Installation (Optional).
- 1. shows list of extensions installed
    ```
    \dx
    ```

- 2. shows version of vector extension
    ```
    SELECT extversion FROM pg_extension WHERE extname = 'vector';
    ```
