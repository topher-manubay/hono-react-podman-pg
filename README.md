# Project Setup Guide

Full-stack application with Bun, Hono, React, PostgreSQL, and Podman.

---

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Development Commands](#development-commands)
- [Database Management](#database-management)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Prerequisites

- [Podman Desktop](https://podman-desktop.io/)
- [Bun](https://bun.sh/)
- Git

### Initial Setup
```bash
# Clone repository
git clone <your-repo>
cd <project-folder>

# Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start development environment
podman compose up
```

### Access Services

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | - |
| Backend API | http://localhost:3000 | - |
| pgAdmin | http://localhost:5050 | admin@admin.com / admin |
| PostgreSQL | localhost:5432 | myuser / mypassword |

---

## 💻 Development Commands

### Container Management
```bash
# Start all services
podman compose up

# Start in background
podman compose up -d

# Stop all services
podman compose down

# Restart specific service
podman compose restart backend

# View logs (all services)
podman compose logs -f

# View logs (specific service)
podman compose logs backend -f

# Access container shell
podman compose exec backend sh
```

### Code Development
```bash
# Backend hot reload is automatic
# Frontend hot reload is automatic

# Rebuild after dependency changes
podman compose up --build

# Force rebuild
podman compose up --build --force-recreate
```

---

## 🗄️ Database Management

### Prisma Studio
```bash
cd backend
bunx prisma studio
# Opens at http://localhost:5555
```

### Schema Changes (Development)
```bash
cd backend

# Quick sync (no migration files)
bunx prisma db push

# Create migration (recommended)
bunx prisma migrate dev --name add_user_role

# Regenerate Prisma Client
bunx prisma generate

# Reset database (⚠️ deletes all data)
bunx prisma migrate reset
```

### Database Queries
```bash
# Access PostgreSQL CLI
podman compose exec postgres psql -U myuser -d mydb

# Run SQL file
podman compose exec -T postgres psql -U myuser -d mydb < script.sql
```

---

## 🚢 Production Deployment

### Initial Deployment
```bash
# 1. Create production environment file
cp .env.example .env.production
# Edit .env.production with secure credentials

# 2. Build production images
podman compose -f compose.prod.yaml build

# 3. Run database migrations
podman compose -f compose.prod.yaml run --rm backend bunx prisma migrate deploy

# 4. Start production services
podman compose -f compose.prod.yaml up -d

# 5. Verify deployment
podman compose -f compose.prod.yaml ps
curl http://localhost/api/health
```

### Update Production
```bash
# 1. Pull latest code
git pull

# 2. Rebuild images (no cache)
podman compose -f compose.prod.yaml build --no-cache

# 3. Stop old containers
podman compose -f compose.prod.yaml down

# 4. Run new migrations
podman compose -f compose.prod.yaml run --rm backend bunx prisma migrate deploy

# 5. Start new containers
podman compose -f compose.prod.yaml up -d

# 6. Verify health
curl http://localhost/api/health
```

### Production Monitoring
```bash
# Check container status
podman compose -f compose.prod.yaml ps

# View all logs
podman compose -f compose.prod.yaml logs

# Follow specific service logs
podman compose -f compose.prod.yaml logs backend -f

# Check resource usage
podman stats
```

---

## 💾 Database Backup & Restore

### Backup Database
```bash
# Create backup with timestamp
podman compose -f compose.prod.yaml exec postgres pg_dump -U myuser mydb > backup_$(date +%Y%m%d_%H%M%S).sql

# Or for development
podman compose exec postgres pg_dump -U myuser mydb > backup_dev.sql
```

### Restore Database
```bash
# Restore from backup
podman compose -f compose.prod.yaml exec -T postgres psql -U myuser mydb < backup_20260121_143022.sql

# Or for development
podman compose exec -T postgres psql -U myuser mydb < backup_dev.sql
```

### Automated Backup Script
```bash
#!/bin/bash
# backup.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR

podman compose -f compose.prod.yaml exec postgres \
  pg_dump -U myuser mydb > "$BACKUP_DIR/backup_$TIMESTAMP.sql"

echo "Backup created: $BACKUP_DIR/backup_$TIMESTAMP.sql"

# Keep only last 7 backups
ls -t $BACKUP_DIR/backup_*.sql | tail -n +8 | xargs rm -f
```

---

## 🔄 Development vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| **Hot Reload** | ✅ Enabled | ❌ Disabled |
| **Source Maps** | ✅ Enabled | ❌ Disabled |
| **Logging** | Verbose | Errors only |
| **Minification** | ❌ No | ✅ Yes |
| **pgAdmin UI** | ✅ Included | ❌ Removed |
| **Exposed Ports** | All ports | Only 80/443 |
| **DB Migrations** | `db push` | `migrate deploy` |
| **Code Mounting** | ✅ Live sync | ❌ Built image |
| **CORS** | `*` (all origins) | Specific domains |
| **Docker Compose** | `compose.yaml` | `compose.prod.yaml` |

---

## 🛠️ Troubleshooting

### Containers Won't Start
```bash
# Check logs
podman compose logs

# Remove and recreate
podman compose down -v
podman compose up --build
```

### Database Connection Issues
```bash
# Check if PostgreSQL is running
podman compose ps

# Check database logs
podman compose logs postgres

# Test connection
podman compose exec postgres pg_isready -U myuser
```

### Port Already in Use
```bash
# Find process using port
netstat -ano | findstr :5173

# Kill process (Windows)
taskkill /PID <PID> /F

# Or change port in compose.yaml
```

### Prisma Client Issues
```bash
cd backend

# Regenerate Prisma Client
bunx prisma generate

# Clear and reinstall
rm -rf node_modules
bun install
bunx prisma generate
```

### Clean Slate Reset
```bash
# Stop everything
podman compose down -v

# Remove all images
podman rmi $(podman images -q)

# Remove all volumes
podman volume prune -f

# Rebuild from scratch
podman compose up --build
```

---

## 📚 Additional Resources

- [Podman Documentation](https://docs.podman.io/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Hono Documentation](https://hono.dev/)
- [Vite Documentation](https://vitejs.dev/)
