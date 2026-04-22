# Configuration Management Guide

## Overview
All credentials and sensitive configurations in this project are now centralized in a single `.env` file in the project root. This ensures:
- **Security**: No hardcoded credentials in source code
- **Flexibility**: Easy environment switching (dev/staging/production)
- **Maintainability**: Single source of truth for all configurations

---

## Quick Start

### 1. **Create `.env` File from Example**
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your actual values
# IMPORTANT: Set secure values for:
# - DJANGO_SECRET_KEY (use: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")
# - POSTGRES_PASSWORD
# - All POSTGRES_* variables
```

### 2. **Update Environment Variables**
Edit `.env` with your actual configuration:

```env
# Frontend
VITE_API_BASE_URL=http://your-domain.com/api
VITE_RCA_FLOW_ENDPOINT=/rca/run-flow

# Django Backend Security
DJANGO_SECRET_KEY=your-secure-secret-key-here
DJANGO_DEBUG=False  # Set to True only in development
DJANGO_ENVIRONMENT=production

# PostgreSQL Database
POSTGRES_HOST=your-db-host
POSTGRES_PORT=5432
POSTGRES_DB=infraondb
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password
```

### 3. **Ensure `.env` is in `.gitignore`**
✅ Already added to `.gitignore`. Never commit `.env` to version control!

---

## File-by-File Changes

### ✅ Core Configuration Files Modified

#### 1. **`.env`** (Project Root)
- **Changed**: Now contains all centralized configurations
- **Credentials**: POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASSWORD, DJANGO_SECRET_KEY
- **What to do**: Update with your actual values

#### 2. **`.env.example`** (Project Root) - NEW
- **Purpose**: Template for developers
- **Content**: All configuration keys with safe placeholder values
- **What to do**: Share with team; developers copy to `.env` and fill in values

#### 3. **`.gitignore`** (Project Root)
- **Changed**: Added `.env`, `.env.local`, `.env.*.local` patterns
- **Purpose**: Prevent credential exposure in Git

#### 4. **`backend/django_project/core/settings.py`**
- **Changed**: Removed all hardcoded credentials
- **Before**: 
  ```python
  SECRET_KEY = 'django-insecure-test-key-do-not-use-in-prod'
  POSTGRES_HOST = os.environ.get("POSTGRES_HOST", "10.0.4.89")  # ❌ Hardcoded default
  ```
- **After**:
  ```python
  SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')  # ✅ Raises error if not set
  POSTGRES_HOST = os.environ.get("POSTGRES_HOST")   # ✅ No hardcoded default
  ```
- **Features**: 
  - Validates required credentials in production
  - Loads DEBUG, ENVIRONMENT, ALLOWED_HOSTS from .env
  - Configurable CORS settings

#### 5. **`streamlit_rca_code/agentic_engine/trigger_agentic_flow.py`**
- **Changed**: Removed hardcoded PostgreSQL defaults
- **Before**: `POSTGRES_HOST = os.environ.get("POSTGRES_HOST", "10.0.4.89")`
- **After**: Added validation to ensure credentials are set from .env
- **Impact**: Script will fail fast with clear error if .env is misconfigured

#### 6. **`streamlit_rca_code/vector_db/ingest_historical_rca.py`**
- **Changed**: Removed hardcoded PostgreSQL defaults
- **Impact**: Same as above - ensures credentials come from .env

#### 7. **`backend/django_project/rca_source_backend/agentic_engine/trigger_agentic_flow.py`**
- **Changed**: Removed hardcoded defaults, prioritizes Django settings
- **Logic**: Tries Django settings first, falls back to environment variables
- **Impact**: Provides clear error if credentials missing

---

## Environment Variables Reference

### Frontend Variables
| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8000/api` |
| `VITE_RCA_FLOW_ENDPOINT` | RCA flow endpoint | `/rca/run-flow` |

### Django Backend Variables
| Variable | Required | Purpose | Example |
|----------|----------|---------|---------|
| `DJANGO_SECRET_KEY` | ✅ YES | Django secret for hashing | `your-secure-key` |
| `DJANGO_DEBUG` | No | Debug mode (False for prod) | `False` |
| `DJANGO_ENVIRONMENT` | No | Environment tag | `production` |
| `DJANGO_ALLOWED_HOSTS` | No | Allowed host domains | `localhost,127.0.0.1` |
| `CORS_ALLOW_ALL_ORIGINS` | No | Allow all CORS origins | `False` |
| `CORS_ALLOWED_ORIGINS` | No | Allowed CORS origins | `http://localhost:3000,http://localhost:5173` |

### Database Variables
| Variable | Required | Purpose | Example |
|----------|----------|---------|---------|
| `POSTGRES_HOST` | ✅ YES | Database hostname | `10.0.4.89` |
| `POSTGRES_PORT` | No | Database port | `5432` |
| `POSTGRES_DB` | ✅ YES | Database name | `infraondb` |
| `POSTGRES_USER` | ✅ YES | Database username | `postgres` |
| `POSTGRES_PASSWORD` | ✅ YES | Database password | `your-secure-password` |

### AI/ML Variables
| Variable | Purpose | Example |
|----------|---------|---------|
| `EMBEDING_MODEL` | Sentence transformer model | `intfloat/e5-base-v2` |

---

## Environment Configurations

### Development Environment
```env
DJANGO_DEBUG=True
DJANGO_ENVIRONMENT=development
CORS_ALLOW_ALL_ORIGINS=True
DJANGO_SECRET_KEY=dev-key-not-for-production
```

### Staging Environment
```env
DJANGO_DEBUG=False
DJANGO_ENVIRONMENT=staging
CORS_ALLOW_ALL_ORIGINS=False
CORS_ALLOWED_ORIGINS=http://staging.yourdomain.com
DJANGO_SECRET_KEY=secure-staging-key
```

### Production Environment
```env
DJANGO_DEBUG=False
DJANGO_ENVIRONMENT=production
CORS_ALLOW_ALL_ORIGINS=False
CORS_ALLOWED_ORIGINS=http://yourdomain.com
DJANGO_SECRET_KEY=secure-production-key-min-50-chars
```

---

## Security Best Practices

### 1. **Generate Secure Django Secret Key**
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```
Copy the output and set as `DJANGO_SECRET_KEY` in `.env`

### 2. **Rotate Credentials Immediately**
Since credentials were exposed in code:
```bash
# 1. Change PostgreSQL password
ALTER USER postgres WITH PASSWORD 'new-secure-password';

# 2. Update .env with new password
# 3. Ensure .env is in .gitignore and never committed
# 4. Remove old .env from Git history (if already committed)
git rm --cached .env
git commit -m "Remove .env from version control"
```

### 3. **Remove Credentials from Git History**
If `.env` was already committed:
```bash
# Use BFG Repo-Cleaner (recommended)
bfg --delete-files .env

# OR use git filter-branch (more complex)
git filter-branch --tree-filter 'rm -f .env' HEAD
```

### 4. **NEVER**
- ❌ Commit `.env` to version control
- ❌ Hardcode credentials in source files
- ❌ Use same credentials across environments
- ❌ Share `.env` file via email/chat
- ❌ Log credentials in debug output

### 5. **ALWAYS**
- ✅ Use `.env.example` as template
- ✅ Keep `.env` in `.gitignore`
- ✅ Use unique passwords per environment
- ✅ Rotate credentials regularly
- ✅ Use strong passwords (20+ characters)
- ✅ Review `.env` changes before deployment

---

## Testing Configuration

### Run Django with New Config
```bash
cd backend/django_project
python manage.py check
python manage.py runserver
```

### Test PostgreSQL Connection
```bash
# Using psycopg2
python -c "
import psycopg2
import os
from dotenv import load_dotenv
load_dotenv()
conn = psycopg2.connect(
    host=os.environ.get('POSTGRES_HOST'),
    database=os.environ.get('POSTGRES_DB'),
    user=os.environ.get('POSTGRES_USER'),
    password=os.environ.get('POSTGRES_PASSWORD')
)
print('✅ PostgreSQL connection successful!')
"
```

### Test Streamlit Scripts
```bash
cd streamlit_rca_code
python -c "from agentic_engine.trigger_agentic_flow import POSTGRES_HOST; print(f'✅ Config loaded: {POSTGRES_HOST}')"
```

---

## Troubleshooting

### Error: `DJANGO_SECRET_KEY environment variable must be set`
**Solution**: 
1. Check `.env` file exists in project root
2. Ensure `DJANGO_SECRET_KEY` variable is set
3. Run: `echo $DJANGO_SECRET_KEY` to verify

### Error: `PostgreSQL credentials must be set`
**Solution**:
1. Verify all required variables are in `.env`:
   - `POSTGRES_HOST`
   - `POSTGRES_DB`
   - `POSTGRES_USER`
   - `POSTGRES_PASSWORD`
2. Run: `python -c "import os; from dotenv import load_dotenv; load_dotenv(); print({k:v for k,v in os.environ.items() if 'POSTGRES' in k})"`

### Error: `psycopg2.OperationalError: could not connect to server`
**Solutions**:
1. Verify PostgreSQL host/port: `telnet POSTGRES_HOST POSTGRES_PORT`
2. Check credentials are correct
3. Ensure PostgreSQL service is running
4. Check firewall rules

### Frontend can't reach backend API
**Check**:
1. `VITE_API_BASE_URL` points to correct Django host:port
2. Django `CORS_ALLOWED_ORIGINS` includes frontend URL
3. Backend is running and accessible

---

## Deployment Checklist

- [ ] Copy `.env.example` to `.env` on deployment server
- [ ] Update all `.env` variables with production values
- [ ] Set `DJANGO_DEBUG=False`
- [ ] Set `DJANGO_ENVIRONMENT=production`
- [ ] Generate new `DJANGO_SECRET_KEY`
- [ ] Use strong `POSTGRES_PASSWORD`
- [ ] Restrict `CORS_ALLOWED_ORIGINS` to your domain only
- [ ] Verify `DJANGO_ALLOWED_HOSTS` includes all domains
- [ ] Test PostgreSQL connection
- [ ] Run `python manage.py check`
- [ ] Review and commit all `.py` and `.gitignore` changes (but NOT `.env`)
- [ ] Verify `.env` is NOT in git history

---

## Questions or Issues?

If environment variables aren't loading:
1. Verify `.env` file exists in project root
2. Check file encoding is UTF-8
3. Ensure no special characters in variable names
4. Verify no trailing spaces after values
5. Restart application/server after changing `.env`

---

**Last Updated**: April 2026  
**Configuration Status**: ✅ Fully Centralized in `.env`
