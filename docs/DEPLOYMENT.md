# Deployment Guide

## Deployment Options

### 1. Traditional Node.js Deployment

#### Prerequisites
- Node.js 16.x or higher
- npm or yarn
- Process manager (PM2 recommended)

#### Steps

1. **Install dependencies:**
```bash
npm install --production
```

2. **Set environment variables:**
```bash
export NODE_ENV=production
export PORT=3000
```

3. **Start with PM2:**
```bash
npm install -g pm2
pm2 start src/server/index.js --name velsrios
pm2 save
pm2 startup
```

---

### 2. Docker Deployment

#### Using Docker

1. **Build the image:**
```bash
docker build -t velsrios:latest .
```

2. **Run the container:**
```bash
docker run -d \
  -p 3000:3000 \
  -e NODE_ENV=production \
  --name velsrios \
  --restart unless-stopped \
  velsrios:latest
```

#### Using Docker Compose

1. **Start services:**
```bash
docker-compose up -d
```

2. **View logs:**
```bash
docker-compose logs -f
```

3. **Stop services:**
```bash
docker-compose down
```

---

### 3. Cloud Platforms

#### Heroku

1. **Create Heroku app:**
```bash
heroku create velsrios
```

2. **Add Procfile:**
```
web: npm start
```

3. **Deploy:**
```bash
git push heroku main
```

4. **Set environment variables:**
```bash
heroku config:set NODE_ENV=production
```

#### Vercel

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy:**
```bash
vercel --prod
```

#### AWS (EC2)

1. **Launch EC2 instance** (Ubuntu 22.04)

2. **SSH into instance:**
```bash
ssh -i your-key.pem ubuntu@your-ip
```

3. **Install Node.js:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

4. **Clone and setup:**
```bash
git clone https://github.com/vedhen-br/velsrios.git
cd velsrios
npm install
```

5. **Setup with PM2:**
```bash
sudo npm install -g pm2
pm2 start src/server/index.js
pm2 startup systemd
pm2 save
```

6. **Setup Nginx reverse proxy:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

### 4. Kubernetes

#### Create Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: velsrios
spec:
  replicas: 3
  selector:
    matchLabels:
      app: velsrios
  template:
    metadata:
      labels:
        app: velsrios
    spec:
      containers:
      - name: velsrios
        image: velsrios:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "3000"
```

#### Create Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: velsrios-service
spec:
  selector:
    app: velsrios
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

---

## Environment Variables

Required environment variables for production:

```bash
NODE_ENV=production
PORT=3000
```

Optional:
```bash
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=velsrios
DB_USER=your-user
DB_PASSWORD=your-password
API_KEY=your-api-key
```

---

## Security Checklist

- [ ] Use environment variables for sensitive data
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Enable rate limiting
- [ ] Keep dependencies updated
- [ ] Use strong passwords
- [ ] Enable security headers (Helmet.js)
- [ ] Regular security audits

---

## Monitoring

### Health Check

The application exposes a health check endpoint:
```
GET /api/health
```

### Recommended Tools

- **PM2 Monitoring:** Built-in process monitoring
- **New Relic:** Application performance monitoring
- **Datadog:** Infrastructure and application monitoring
- **Sentry:** Error tracking
- **LogRocket:** Frontend monitoring

---

## Scaling

### Horizontal Scaling

Use PM2 cluster mode:
```bash
pm2 start src/server/index.js -i max
```

Or use load balancers with multiple instances.

### Vertical Scaling

Increase server resources (CPU, RAM) as needed.

---

## Backup Strategy

1. **Code:** Version control with Git
2. **Database:** Regular automated backups
3. **Configuration:** Store in secure location
4. **Logs:** Centralized logging solution

---

## Rollback Plan

1. Keep previous versions tagged in Git
2. Use blue-green deployment strategy
3. Have automated rollback scripts ready
4. Monitor post-deployment metrics

---

## Support

For deployment issues, please open an issue on GitHub.
