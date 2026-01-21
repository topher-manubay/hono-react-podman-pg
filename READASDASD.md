```
DAILY DEVELOPMENT
```

# 1. Start development environment
podman compose up

# 2. Access services:
# - Frontend: http://localhost:5173
# - Backend: http://localhost:3000
# - pgAdmin: http://localhost:5050
# - Prisma Studio: cd backend && bunx prisma studio

# 3. Make changes (hot reload enabled)
# - Backend: Edit src/index.ts → auto-reloads
# - Frontend: Edit src/App.jsx → auto-reloads

# 4. Database changes:
cd backend
bunx prisma db push           # Quick schema sync (dev)
bunx prisma studio            # View/edit data
cd ..

# 5. View logs:
podman compose logs -f        # All services
podman compose logs backend -f # Just backend

# 6. Stop everything:
podman compose down