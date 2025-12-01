# System Architecture & Technology Stack Documentation

> **Document Version:** 1.0  
> **Last Updated:** December 1, 2025  
> **Status:** Current State Documentation

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Microservices Architecture](#microservices-architecture)
4. [API Gateway (Kong)](#api-gateway-kong)
5. [Frontend Architecture](#frontend-architecture)
6. [Database Architecture](#database-architecture)
7. [Kubernetes Infrastructure](#kubernetes-infrastructure)
8. [Monitoring Stack](#monitoring-stack)
9. [Logging Stack](#logging-stack)
10. [Security Infrastructure](#security-infrastructure)
11. [CI/CD Pipeline (GitOps)](#cicd-pipeline-gitops)
12. [Infrastructure as Code](#infrastructure-as-code)
13. [Technology Stack Summary](#technology-stack-summary)
14. [Service Communication](#service-communication)
15. [Port Mapping](#port-mapping)

---

## System Overview

The Inventory Stock Management System is a cloud-native microservices application designed to manage inventory, products, orders, suppliers, and users. The system follows a distributed architecture pattern with the following characteristics:

- **Architecture Pattern:** Microservices
- **Deployment Model:** Containerized (Docker) on Kubernetes
- **API Gateway:** Kong (DB-less mode)
- **Identity Provider:** WSO2 Asgardeo (OAuth 2.0 / OIDC)
- **Database:** PostgreSQL (per-service database pattern)
- **Container Orchestration:** Kubernetes (k3s/kubeadm compatible)
- **GitOps:** ArgoCD

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                      INTERNET                                            │
└────────────────────────────────────────┬────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              AWS / CLOUD INFRASTRUCTURE                                  │
│  ┌───────────────────────────────────────────────────────────────────────────────────┐  │
│  │                         LOAD BALANCER (AWS ALB/NLB)                               │  │
│  └────────────────────────────────────────┬──────────────────────────────────────────┘  │
│                                           │                                              │
│  ┌────────────────────────────────────────▼──────────────────────────────────────────┐  │
│  │                            KUBERNETES CLUSTER                                      │  │
│  │                                                                                    │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                      KONG API GATEWAY (Namespace: kong)                      │  │  │
│  │  │  ┌─────────────────────────────────────────────────────────────────────┐    │  │  │
│  │  │  │ • Rate Limiting    • CORS           • Request Size Limiting         │    │  │  │
│  │  │  │ • Prometheus Metrics                 • SSL Termination              │    │  │  │
│  │  │  └─────────────────────────────────────────────────────────────────────┘    │  │  │
│  │  │                                    │                                         │  │  │
│  │  │         ┌──────────────────────────┼──────────────────────────┐             │  │  │
│  │  │         │                          │                          │             │  │  │
│  │  │         ▼                          ▼                          ▼             │  │  │
│  │  │  /api/users              /api/products              /api/inventory         │  │  │
│  │  │  /api/auth               /api/categories            /api/stock             │  │  │
│  │  │         │                          │                          │             │  │  │
│  │  └─────────┼──────────────────────────┼──────────────────────────┼─────────────┘  │  │
│  │            │                          │                          │                │  │
│  │  ┌─────────▼──────────────────────────▼──────────────────────────▼─────────────┐  │  │
│  │  │                 MICROSERVICES (Namespace: inventory-system)                  │  │  │
│  │  │                                                                              │  │  │
│  │  │  ┌──────────────┐ ┌───────────────────┐ ┌─────────────────┐                 │  │  │
│  │  │  │ User Service │ │ Product Catalog   │ │ Inventory       │                 │  │  │
│  │  │  │   (3001)     │ │ Service (3002)    │ │ Service (3003)  │                 │  │  │
│  │  │  │              │ │                   │ │                 │                 │  │  │
│  │  │  │ • Auth       │ │ • Products        │ │ • Stock Mgmt    │                 │  │  │
│  │  │  │ • Users      │ │ • Categories      │ │ • Movements     │                 │  │  │
│  │  │  │ • Roles      │ │ • Pricing         │ │ • Alerts        │                 │  │  │
│  │  │  │              │ │ • Lifecycle       │ │                 │                 │  │  │
│  │  │  └──────┬───────┘ └────────┬──────────┘ └───────┬─────────┘                 │  │  │
│  │  │         │                  │                    │                            │  │  │
│  │  │  ┌──────────────┐ ┌───────────────────┐                                     │  │  │
│  │  │  │ Supplier     │ │ Order Service     │                                     │  │  │
│  │  │  │ Service      │ │     (3005)        │                                     │  │  │
│  │  │  │   (3004)     │ │                   │                                     │  │  │
│  │  │  │              │ │ • Orders          │                                     │  │  │
│  │  │  │ • Suppliers  │ │ • Order Items     │                                     │  │  │
│  │  │  │ • Purchase   │ │ • Status History  │                                     │  │  │
│  │  │  │   Orders     │ │                   │                                     │  │  │
│  │  │  └──────┬───────┘ └────────┬──────────┘                                     │  │  │
│  │  │         │                  │                                                 │  │  │
│  │  └─────────┼──────────────────┼─────────────────────────────────────────────────┘  │  │
│  │            │                  │                                                    │  │
│  │  ┌─────────▼──────────────────▼─────────────────────────────────────────────────┐  │  │
│  │  │                     POSTGRESQL (Shared Instance)                              │  │  │
│  │  │  ┌────────────────┐ ┌─────────────────┐ ┌─────────────────┐                  │  │  │
│  │  │  │ user_service_db│ │product_catalog_db│ │  inventory_db   │                  │  │  │
│  │  │  └────────────────┘ └─────────────────┘ └─────────────────┘                  │  │  │
│  │  │  ┌────────────────┐ ┌─────────────────┐                                      │  │  │
│  │  │  │  supplier_db   │ │    order_db     │                                      │  │  │
│  │  │  └────────────────┘ └─────────────────┘                                      │  │  │
│  │  └──────────────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                                    │  │
│  │  ┌──────────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                    OBSERVABILITY STACK                                        │  │  │
│  │  │                                                                               │  │  │
│  │  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │  │  │
│  │  │  │   Prometheus    │  │    Grafana      │  │  Alertmanager   │              │  │  │
│  │  │  │   (monitoring)  │  │  (monitoring)   │  │  (monitoring)   │              │  │  │
│  │  │  └─────────────────┘  └─────────────────┘  └─────────────────┘              │  │  │
│  │  │                                                                               │  │  │
│  │  │  ┌─────────────────┐  ┌─────────────────┐                                   │  │  │
│  │  │  │   Fluent Bit    │  │   OpenSearch    │                                   │  │  │
│  │  │  │   (logging)     │──│   (logging)     │                                   │  │  │
│  │  │  └─────────────────┘  └─────────────────┘                                   │  │  │
│  │  └──────────────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                                    │  │
│  │  ┌──────────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                      SECURITY & SERVICE MESH                                  │  │  │
│  │  │  • Linkerd (mTLS Service Mesh)                                               │  │  │
│  │  │  • OPA Gatekeeper (Policy Enforcement)                                       │  │  │
│  │  │  • Network Policies                                                          │  │  │
│  │  │  • Pod Security Standards                                                    │  │  │
│  │  └──────────────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                                    │  │
│  └────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                          │
│  ┌────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                              GitOps: ArgoCD                                        │  │
│  │         Syncs from: GitHub Repository → k8s/base/services                         │  │
│  └────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                          │
└──────────────────────────────────────────────────────────────────────────────────────────┘

                                         ▲
                                         │
                    ┌────────────────────┴────────────────────┐
                    │           EXTERNAL SERVICES              │
                    │  ┌────────────────────────────────────┐ │
                    │  │        WSO2 Asgardeo               │ │
                    │  │   (Identity Provider - OAuth 2.0)  │ │
                    │  └────────────────────────────────────┘ │
                    └─────────────────────────────────────────┘
```

---

## Microservices Architecture

### Service Overview

| Service | Port | Database | Description |
|---------|------|----------|-------------|
| User Service | 3001 | user_service_db | User authentication, authorization, and user management |
| Product Catalog Service | 3002 | product_catalog_db | Product and category management, pricing, lifecycle |
| Inventory Service | 3003 | inventory_db | Stock management, movements, low stock alerts |
| Supplier Service | 3004 | supplier_db | Supplier management, purchase orders |
| Order Service | 3005 | order_db | Order processing, order items, status history |

### Service Dependencies

```
┌─────────────────┐
│  Order Service  │
└────────┬────────┘
         │ depends on
         ├──────────────────────────────┐
         │                              │
         ▼                              ▼
┌─────────────────┐          ┌─────────────────┐
│  User Service   │          │Product Catalog  │
└─────────────────┘          │    Service      │
                             └────────┬────────┘
                                      │
                                      ▼
                             ┌─────────────────┐
                             │Inventory Service│
                             └─────────────────┘
                                      ▲
                                      │
┌─────────────────┐                   │
│Supplier Service │───────────────────┘
└─────────────────┘
```

### Inter-Service Communication

Services communicate via HTTP REST calls using internal Kubernetes DNS:

```javascript
// Environment Variables for Service Discovery (Docker Compose)
PRODUCT_SERVICE_URL=http://product-catalog-service:3002
INVENTORY_SERVICE_URL=http://inventory-service:3003
USER_SERVICE_URL=http://user-service:3001

// Kubernetes DNS Pattern
http://{service-name}.{namespace}.svc.cluster.local:{port}
```

---

## API Gateway (Kong)

### Configuration

- **Mode:** DB-less (declarative configuration)
- **Replicas:** 2 (for high availability)
- **Namespace:** `kong`

### Kong Services & Routes

| Service | Upstream URL | Routes | Rate Limit |
|---------|--------------|--------|------------|
| user-service | `http://user-service.inventory-system.svc.cluster.local:80` | `/api/users`, `/api/auth` | 100/min |
| product-catalog-service | `http://product-catalog-service.inventory-system.svc.cluster.local:80` | `/api/products`, `/api/categories` | 200/min |
| inventory-service | `http://inventory-service.inventory-system.svc.cluster.local:80` | `/api/inventory`, `/api/stock` | 200/min |
| order-service | `http://order-service.inventory-system.svc.cluster.local:80` | `/api/orders` | 150/min |
| supplier-service | `http://supplier-service.inventory-system.svc.cluster.local:80` | `/api/suppliers`, `/api/purchase-orders` | 100/min |

### Kong Plugins (Per Service)

| Plugin | Configuration |
|--------|---------------|
| rate-limiting | `minute: 100-200`, `policy: local` |
| cors | `origins: *`, all methods allowed, credentials enabled |
| request-size-limiting | `allowed_payload_size: 5-10 MB` |
| prometheus | Metrics collection enabled |

### Kong Endpoints

| Endpoint | Port | Purpose |
|----------|------|---------|
| Proxy | 80/443 | API traffic (LoadBalancer) |
| Admin | 8001 | Kong Admin API (ClusterIP) |
| Metrics | 8100/9542 | Prometheus metrics (ClusterIP) |

---

## Frontend Architecture

### Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | React | 19.1.1 |
| Build Tool | Vite | 7.1.7 |
| Styling | Tailwind CSS | 4.1.15 |
| Routing | React Router DOM | 6.20.0 |
| HTTP Client | Axios | 1.6.2 |
| State Management | Zustand | 4.4.7 |
| Auth SDK | @asgardeo/auth-react | 5.4.3 |
| Charts | Recharts | 2.10.3 |
| Icons | Lucide React | 0.468.0 |
| Animations | Framer Motion | 11.0.0 |
| Notifications | React Hot Toast | 2.4.1 |
| Date Handling | date-fns | 2.30.0 |

### Build & Deployment

- **Build:** Multi-stage Docker build (Node.js → Nginx)
- **Web Server:** Nginx Alpine
- **SPA Routing:** Client-side routing with fallback to `index.html`
- **Static Assets:** 1-year cache with immutable headers

### Nginx Configuration

```nginx
# Key Features:
- Gzip compression enabled
- Security headers (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)
- SPA routing support
- Static asset caching (1 year)
- Health check endpoint at /health
```

---

## Database Architecture

### PostgreSQL Configuration

| Property | Value |
|----------|-------|
| Image | postgres:15-alpine |
| Container Name | ims-postgres |
| Port | 5432 |
| Storage | Docker volume (postgres_data) |

### Database Per Service

| Database | Service | Key Tables |
|----------|---------|------------|
| user_service_db | User Service | users |
| product_catalog_db | Product Catalog | products, categories |
| inventory_db | Inventory | inventory, stock_movements |
| supplier_db | Supplier | suppliers, purchase_orders |
| order_db | Order | orders, order_items, order_status_history |

### Users Table Schema

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'warehouse_staff', 'supplier')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Kubernetes Infrastructure

### Namespaces

| Namespace | Purpose |
|-----------|---------|
| inventory-system | Application microservices |
| kong | API Gateway |
| monitoring | Prometheus, Grafana, Alertmanager |
| logging | Fluent Bit, OpenSearch, OpenSearch Dashboards |
| argocd | GitOps CD pipeline |
| linkerd | Service mesh control plane |
| gatekeeper-system | OPA policy enforcement |

### Service Deployment Configuration

Each microservice deployment includes:

| Component | Configuration |
|-----------|---------------|
| Replicas | 2 |
| Strategy | RollingUpdate (maxSurge: 1, maxUnavailable: 0) |
| Security Context | runAsNonRoot: true, runAsUser: 1000 |
| Resource Requests | CPU: 100m, Memory: 128Mi |
| Resource Limits | CPU: 500m, Memory: 512Mi |
| Health Probes | Liveness & Readiness on /health |

### Kubernetes Resources Per Service

- `deployment.yaml` - Pod deployment configuration
- `service.yaml` - ClusterIP service definition
- `serviceaccount.yaml` - Service account for RBAC
- `hpa.yaml` - Horizontal Pod Autoscaler
- `networkpolicy.yaml` - Network segmentation
- `servicemonitor.yaml` - Prometheus scrape configuration

---

## Monitoring Stack

### Components

| Component | Image/Version | Purpose |
|-----------|---------------|---------|
| Prometheus | Prometheus Operator CRD | Metrics collection and storage |
| Grafana | grafana/grafana:10.2.0 | Metrics visualization and dashboards |
| Alertmanager | Standard | Alert routing and notification |
| kube-state-metrics | Standard | Kubernetes object metrics |

### Prometheus Configuration

- **Namespace:** monitoring
- **Retention:** 15 days
- **Storage:** 10Gi PVC (ReadWriteOnce)
- **ServiceMonitor Label Selector:** `team: inventory-system`

### Grafana Configuration

- **Port:** 3000
- **Default Credentials:** admin/admin123
- **Datasource:** Prometheus (auto-configured)

### Application Metrics

Each microservice exposes metrics via prom-client:

```
# Endpoint: /metrics
# Annotations on pods:
prometheus.io/scrape: "true"
prometheus.io/port: "{service-port}"
prometheus.io/path: "/metrics"
```

---

## Logging Stack

### Components

| Component | Purpose |
|-----------|---------|
| Fluent Bit | Log collection agent (DaemonSet) |
| OpenSearch | Log storage and indexing |
| OpenSearch Dashboards | Log visualization |

### Fluent Bit Configuration

**Input Sources:**
- Container logs: `/var/log/containers/*.log`
- System logs: kubelet.service via systemd

**Processing:**
- Kubernetes metadata enrichment
- Cluster name tagging
- Nested field processing

**Outputs:**
- Application logs → `application-logs-*` index
- System logs → `system-logs-*` index
- Target: OpenSearch at `opensearch.logging.svc.cluster.local:9200`

---

## Security Infrastructure

### Linkerd Service Mesh

- **Purpose:** mTLS between services, traffic observability
- **Installation:** Via official linkerd CLI
- **Components:** Control plane, Linkerd Viz (dashboard)

### OPA Gatekeeper

**Constraint Templates:**

| Template | Purpose |
|----------|---------|
| K8sRequiredLabels | Enforces required labels on resources |
| K8sDenyPrivileged | Denies privileged containers |
| K8sContainerLimits | Requires resource limits/requests |

### Network Policies

- Per-service network policies restricting ingress/egress
- Located in `k8s/base/services/{service}/networkpolicy.yaml`

### Pod Security Standards

- Non-root user enforcement (runAsUser: 1000)
- Read-only root filesystem
- Dropped all capabilities
- seccompProfile: RuntimeDefault

---

## CI/CD Pipeline (GitOps)

### ArgoCD Configuration

| Property | Value |
|----------|-------|
| Namespace | argocd |
| Version | v2.9+ (stable) |
| Mode | Manual sync for production |

### Application Definition

```yaml
# Production Application
source:
  repoURL: https://github.com/IT21182914/WSO2-Final-Project-Inventory-Stock-Management-Microservices-System.git
  targetRevision: main
  path: k8s/base/services

destination:
  server: https://kubernetes.default.svc
  namespace: inventory-system

syncPolicy:
  automated:
    prune: false      # Manual prune for production
    selfHeal: false   # Manual heal for production
  retry:
    limit: 3
    backoff:
      duration: 10s
      factor: 2
      maxDuration: 5m
```

### Notifications

- Slack: production-alerts channel
- Email: team@company.com
- Events: on-deployed, on-sync-failed, on-health-degraded

---

## Infrastructure as Code

### Terraform Configuration

| Provider | Version |
|----------|---------|
| AWS | ~> 5.0 |
| Terraform | >= 1.0 |

### Modules

| Module | Purpose |
|--------|---------|
| networking | VPC, subnets, NAT gateway |
| security | Security groups for master/worker/LB |
| compute | EC2 instances for K8s nodes |
| load_balancer | AWS ALB/NLB for K8s API and services |
| storage | EBS volumes for persistent storage |

### Infrastructure Components

- **Master Nodes:** Configurable count and instance type
- **Worker Nodes:** Configurable count and instance type
- **VPC:** Custom CIDR with public/private subnets
- **Load Balancer:** For K8s API server access

---

## Technology Stack Summary

### Backend Technologies

| Category | Technology | Version |
|----------|------------|---------|
| Runtime | Node.js | 18 |
| Framework | Express.js | 4.18.2 / 5.1.0 |
| Database Driver | pg | 8.11.3 |
| Authentication | jsonwebtoken, jwks-rsa | 9.0.2, 3.2.0 |
| Password Hashing | bcrypt | 5.1.1 / 6.0.0 |
| Validation | Joi | 17.11.0 |
| HTTP Client | Axios | 1.13.2 |
| Logging | Winston | 3.11.0 |
| Metrics | prom-client | 15.1.3 |
| Security | Helmet, CORS | 7.1.0, 2.8.5 |
| Rate Limiting | express-rate-limit | 7.1.5 |

### Frontend Technologies

| Category | Technology | Version |
|----------|------------|---------|
| Framework | React | 19.1.1 |
| Build Tool | Vite | 7.1.7 |
| CSS Framework | Tailwind CSS | 4.1.15 |
| Router | React Router DOM | 6.20.0 |
| State | Zustand | 4.4.7 |
| Auth | @asgardeo/auth-react | 5.4.3 |
| HTTP | Axios | 1.6.2 |
| Charts | Recharts | 2.10.3 |
| Animations | Framer Motion | 11.0.0 |

### Infrastructure Technologies

| Category | Technology |
|----------|------------|
| Containerization | Docker |
| Orchestration | Kubernetes (k3s/kubeadm) |
| API Gateway | Kong 3.0 (DB-less) |
| Service Mesh | Linkerd |
| GitOps | ArgoCD v2.9+ |
| IaC | Terraform 1.0+ |
| Monitoring | Prometheus, Grafana 10.2 |
| Logging | Fluent Bit, OpenSearch |
| Policy Engine | OPA Gatekeeper |

### External Services

| Service | Purpose |
|---------|---------|
| WSO2 Asgardeo | OAuth 2.0 / OIDC Identity Provider |
| AWS | Cloud Infrastructure (EC2, VPC, ALB, EBS) |
| GitHub | Source Code Repository |

---

## Service Communication

### Communication Patterns

| Pattern | Usage |
|--------|-------|
| Synchronous REST | Inter-service API calls via HTTP |
| Direct Service Call | Within Kubernetes via ClusterIP services |
| Gateway Routing | External traffic via Kong API Gateway |

### Service URLs (Development - Docker Compose)

```
User Service:            http://localhost:3001
Product Catalog Service: http://localhost:3002
Inventory Service:       http://localhost:3003
Supplier Service:        http://localhost:3004
Order Service:           http://localhost:3005
PostgreSQL:              localhost:5432
```

### Service URLs (Kubernetes)

```
Internal (ClusterIP):
  http://user-service.inventory-system.svc.cluster.local:80
  http://product-catalog-service.inventory-system.svc.cluster.local:80
  http://inventory-service.inventory-system.svc.cluster.local:80
  http://supplier-service.inventory-system.svc.cluster.local:80
  http://order-service.inventory-system.svc.cluster.local:80

External (via Kong):
  http://kong-proxy.kong.svc.cluster.local/api/*
```

---

## Port Mapping

### Development (Docker Compose)

| Service | Container Port | Host Port |
|---------|----------------|-----------|
| User Service | 3001 | 3001 |
| Product Catalog | 3002 | 3002 |
| Inventory Service | 3003 | 3003 |
| Supplier Service | 3004 | 3004 |
| Order Service | 3005 | 3005 |
| PostgreSQL | 5432 | 5432 |
| Frontend | 80 | 5173 (Vite dev) |

### Production (Kubernetes)

| Service | Container Port | Service Port | Type |
|---------|----------------|--------------|------|
| All Microservices | 300X | 80 | ClusterIP |
| Kong Proxy | 8000/8443 | 80/443 | LoadBalancer |
| Kong Admin | 8001 | 8001 | ClusterIP |
| Prometheus | 9090 | 9090 | ClusterIP |
| Grafana | 3000 | 3000 | ClusterIP |
| OpenSearch | 9200 | 9200 | ClusterIP |

---

## Docker Network

### Network Configuration (Docker Compose)

```yaml
networks:
  ims-network:
    driver: bridge

volumes:
  postgres_data:  # Persistent PostgreSQL data
```

---

*This document provides a comprehensive view of the current system architecture and technology stack as of December 2025.*
