# Development
podman compose up                          # Start dev
podman compose down                        # Stop dev
podman compose logs -f                     # View logs
podman compose restart backend             # Restart service
podman compose exec backend sh             # Shell into container

# Production
podman compose -f compose.prod.yaml up -d  # Start prod
podman compose -f compose.prod.yaml down   # Stop prod
podman compose -f compose.prod.yaml logs   # View logs
podman compose -f compose.prod.yaml ps     # Check status

# Database
cd backend
bunx prisma studio                         # Open Prisma Studio
bunx prisma db push                        # Sync schema (dev)
bunx prisma migrate dev                    # Create migration
bunx prisma migrate deploy                 # Run migrations (prod)
bunx prisma generate                       # Regenerate client


#Database Migrations (Development):
cd backend

# Create migration
bunx prisma migrate dev --name add_user_role

# Reset database (careful!)
bunx prisma migrate reset

cd ..


### Production Workflow

# 1. Create production .env file
cp .env.example .env.production
# Edit .env.production with real credentials

# 2. Build production images
podman compose -f compose.prod.yaml build

# 3. Run migrations
podman compose -f compose.prod.yaml run --rm backend bunx prisma migrate deploy

# 4. Start production
podman compose -f compose.prod.yaml up -d

# 5. Check health
podman compose -f compose.prod.yaml ps
podman compose -f compose.prod.yaml logs

# 6. View specific service logs
podman compose -f compose.prod.yaml logs backend -f


### PRODUCTION UPDATES

# 1. Pull latest code
git pull

# 2. Rebuild images
podman compose -f compose.prod.yaml build --no-cache

# 3. Stop old containers
podman compose -f compose.prod.yaml down

# 4. Run migrations
podman compose -f compose.prod.yaml run --rm backend bunx prisma migrate deploy

# 5. Start new containers
podman compose -f compose.prod.yaml up -d

# 6. Verify
curl http://localhost/api/health


# PRODUCTION DATABASE BACKUP

# Backup
podman compose -f compose.prod.yaml exec postgres pg_dump -U myuser mydb > backup_$(date +%Y%m%d).sql

# Restore
podman compose -f compose.prod.yaml exec -T postgres psql -U myuser mydb < backup_20260121.sql


Key Differences: Dev vs Prod
FeatureDevelopmentProductionHot Reload✅ Enabled❌ DisabledSource Maps✅ Enabled❌ DisabledLoggingVerboseErrors onlyMinification❌ No✅ YespgAdmin✅ Included❌ RemovedPorts ExposedAllOnly 80/443Database Migrationsdb pushmigrate deployVolume Mounts✅ Live code❌ Built codeCORS* (all)Specific domains