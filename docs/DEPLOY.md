# Deploy on a VPS (Docker Compose)

Two containers: **API** (Bun + SQLite on a volume) and **web** (Next.js). SQLite lives in a named volume so it survives restarts.

## Prerequisites on the VPS

- Docker Engine and Docker Compose plugin ([install docs](https://docs.docker.com/engine/install/))
- Git (or upload the repo)
- Ports **3000** (app) and **3001** (API) open in the firewall, or put a reverse proxy in front later

## One-time setup

1. **Clone the repo** on the VPS:

   ```bash
   git clone <your-repo-url> asu && cd asu
   ```

2. **Create env file** at the repo root (same folder as `compose.yml`):

   ```bash
   cp .env.compose.example .env
   ```

3. **Edit `.env`** — replace `YOUR_VPS_IP` with the address people use in the browser (public IP or domain):

   ```bash
   NEXT_PUBLIC_ASU_API_URL=http://203.0.113.10:3001
   CORS_ORIGINS=http://203.0.113.10:3000
   ```

   `CORS_ORIGINS` must include the **exact** origin of the web UI (scheme + host + port). Add more origins comma-separated if needed.

4. **Build and start**:

   ```bash
   docker compose up -d --build
   ```

   On first start the API container runs `db:setup` automatically if `/data/asu.sqlite` is missing (seed data included).

5. **Open the app**: `http://YOUR_VPS_IP:3000`

6. **Health check** (optional): `curl http://YOUR_VPS_IP:3001/health`

## Day-two commands

```bash
# Logs
docker compose logs -f

# Restart after pulling code
git pull
docker compose up -d --build

# Stop
docker compose down

# Stop and delete DB volume (wipes data)
docker compose down -v
```

## Changing the public API URL

`NEXT_PUBLIC_ASU_API_URL` is compiled into the web image. After changing it in `.env`, rebuild web:

```bash
docker compose up -d --build web
```

## HTTPS / domain (optional, later)

Run Caddy or nginx on the VPS terminating TLS, proxy `/` → `localhost:3000` and e.g. `/` or `api.` → `localhost:3001`. Then set:

- `NEXT_PUBLIC_ASU_API_URL=https://api.yourdomain.com`
- `CORS_ORIGINS=https://app.yourdomain.com`

Rebuild web after updating `.env`.

## Local smoke test (before VPS)

From repo root with Docker running:

```bash
cp .env.compose.example .env
# Use 127.0.0.1 in .env for local test
sed -i '' 's/YOUR_VPS_IP/127.0.0.1/g' .env   # macOS; on Linux use sed -i
docker compose up --build
```

Visit [http://127.0.0.1:3000](http://127.0.0.1:3000).

## Troubleshooting

| Symptom | Check |
|--------|--------|
| UI loads, API calls fail (CORS) | `CORS_ORIGINS` matches the browser URL bar exactly |
| UI loads, network errors to API | `NEXT_PUBLIC_ASU_API_URL` must be reachable **from the user's browser**, not `http://api:3001` |
| Empty queue / 404 | API logs: `docker compose logs api`; re-seed: `docker compose exec api bun run db:seed` |
| Port in use | Set `WEB_PORT` / `API_PORT` in `.env` |