from pathlib import Path
import os
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from the workspace root .env file
env_path = BASE_DIR.parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

# Security - MUST be set in .env, never hardcode in code
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')
if not SECRET_KEY:
    raise ValueError(
        "DJANGO_SECRET_KEY environment variable must be set. "
        "Copy .env.example to .env and set a secure SECRET_KEY."
    )

DEBUG = os.environ.get('DJANGO_DEBUG', 'False').lower() == 'true'
ENVIRONMENT = os.environ.get('DJANGO_ENVIRONMENT', 'development')

# Allowed hosts from environment
ALLOWED_HOSTS = os.environ.get('DJANGO_ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'api',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS Configuration - Load from environment
CORS_ALLOW_ALL_ORIGINS = os.environ.get('CORS_ALLOW_ALL_ORIGINS', 'False').lower() == 'true'
if not CORS_ALLOW_ALL_ORIGINS:
    # Load allowed origins from comma-separated environment variable
    cors_origins = os.environ.get('CORS_ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:5173')
    CORS_ALLOWED_ORIGINS = [origin.strip() for origin in cors_origins.split(',')]

# PostgreSQL Configuration for RCA Historical Engine
# REQUIRED: All of these must be set in .env file
POSTGRES_HOST = os.environ.get("POSTGRES_HOST")
POSTGRES_PORT = os.environ.get("POSTGRES_PORT", "5432")
POSTGRES_DB = os.environ.get("POSTGRES_DB")
POSTGRES_USER = os.environ.get("POSTGRES_USER")
POSTGRES_PASSWORD = os.environ.get("POSTGRES_PASSWORD")
EMBEDING_MODEL = os.environ.get("EMBEDING_MODEL", "intfloat/e5-base-v2")

# Validate that required PostgreSQL credentials are set
if ENVIRONMENT == 'production':
    if not all([POSTGRES_HOST, POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD]):
        raise ValueError(
            "All PostgreSQL environment variables must be set in .env for production: "
            "POSTGRES_HOST, POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD"
        )
