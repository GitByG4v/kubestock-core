# Complete Testing & Validation Guide

## 🧪 Testing Roadmap

This guide walks you through testing all components of the Inventory Management System.

---

## 📋 Prerequisites Check

Before starting, verify all tools are installed:

```bash
# Check all required tools
echo "=== Tool Versions ==="
kubectl version --client --short 2>/dev/null || echo "❌ kubectl missing"
terraform --version | head -1 || echo "❌ terraform missing"
ansible --version | head -1 || echo "❌ ansible missing"
docker --version || echo "❌ docker missing"
git --version || echo "❌ git missing"
aws --version || echo "❌ aws cli missing"
```

**Expected Output:**
```
✅ kubectl v1.31.3
✅ terraform v1.9.8
✅ ansible core 2.16.3
✅ docker 29.1.0
✅ git 2.43.0
✅ aws-cli/2.25.6
```

---

## 🎯 Phase 1: Infrastructure Testing

### Test 1.1: Terraform Validation

```bash
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Validate configuration
terraform validate

# Expected: Success! The configuration is valid.
```

### Test 1.2: Terraform Plan (Dry Run)

```bash
# Copy example configuration
cp terraform.tfvars.example terraform.tfvars

# Edit with your AWS credentials
nano terraform.tfvars

# Run plan (does not create resources)
terraform plan

# Expected: Plan shows resources to be created (no errors)
```

### Test 1.3: Ansible Syntax Check

```bash
cd ../ansible

# Check k3s playbook
ansible-playbook --syntax-check playbooks/install-k3s.yml

# Check kubeadm playbook
ansible-playbook --syntax-check playbooks/install-kubeadm.yml

# Check rke2 playbook
ansible-playbook --syntax-check playbooks/install-rke2.yml

# Expected: playbook: <filename> (no errors)
```

**✅ Pass Criteria:**
- All Terraform validations pass
- All Ansible syntax checks pass
- No configuration errors

---

## 🚀 Phase 2: Kubernetes Cluster Testing

### Test 2.1: Check Cluster Connectivity

```bash
# Verify kubectl can connect
kubectl cluster-info

# Expected output:
# Kubernetes control plane is running at https://...
# CoreDNS is running at https://...
```

### Test 2.2: Check Node Status

```bash
# List all nodes
kubectl get nodes -o wide

# Expected: All nodes in Ready status
# NAME           STATUS   ROLES           AGE   VERSION
# k8s-master-1   Ready    control-plane   10m   v1.28.x
# k8s-worker-1   Ready    <none>          5m    v1.28.x
```

### Test 2.3: Check System Pods

```bash
# Check kube-system namespace
kubectl get pods -n kube-system

# Expected: All pods Running or Completed
# Look for: kube-apiserver, kube-scheduler, kube-controller-manager, etcd, coredns
```

### Test 2.4: Create Test Namespace

```bash
# Create test namespace
kubectl create namespace test-inventory

# Verify creation
kubectl get namespace test-inventory

# Clean up
kubectl delete namespace test-inventory

# Expected: Namespace created and deleted successfully
```

**✅ Pass Criteria:**
- Cluster accessible via kubectl
- All nodes in Ready state
- All system pods running
- Can create/delete resources

---

## 📦 Phase 3: ArgoCD Testing

### Test 3.1: Install ArgoCD

```bash
cd /media/sf_Inventory_Stock_Management_Microservices_System/k8s/argocd

# Run installation script
./install.sh

# Or manual installation:
kubectl apply -f namespace.yaml
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

### Test 3.2: Verify ArgoCD Installation

```bash
# Check ArgoCD namespace
kubectl get namespace argocd

# Check ArgoCD pods
kubectl get pods -n argocd

# Expected: All pods Running
# argocd-server
# argocd-repo-server
# argocd-application-controller
# argocd-applicationset-controller
# argocd-redis
# argocd-dex-server
```

### Test 3.3: Get ArgoCD Admin Password

```bash
# Retrieve admin password
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d && echo

# Save this password for UI login
```

### Test 3.4: Access ArgoCD UI

```bash
# Start port-forward (keep this running in a separate terminal)
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Open browser: https://localhost:8080
# Login: admin / <password-from-previous-step>
```

### Test 3.5: Apply ArgoCD Configurations

```bash
# Apply custom configurations
kubectl apply -f argocd-cm.yaml
kubectl apply -f argocd-rbac-cm.yaml
kubectl apply -f argocd-notifications-cm.yaml

# Verify ConfigMaps
kubectl get configmap -n argocd | grep argocd
```

### Test 3.6: Create ArgoCD Projects

```bash
# Apply staging project
kubectl apply -f projects/staging-project.yaml

# Apply production project
kubectl apply -f projects/production-project.yaml

# Verify projects
kubectl get appproject -n argocd

# Expected:
# NAME         AGE
# staging      10s
# production   10s
```

### Test 3.7: Create ArgoCD Applications

```bash
# Apply staging applications
kubectl apply -f applications/staging/

# Verify applications
kubectl get application -n argocd

# Expected:
# NAME                          SYNC STATUS   HEALTH STATUS
# inventory-system-staging      Synced        Healthy
# kong-gateway-staging          Synced        Healthy
```

### Test 3.8: Check Application Sync Status

```bash
# Install ArgoCD CLI (if not already installed)
curl -sSL -o argocd-linux-amd64 https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
sudo install -m 555 argocd-linux-amd64 /usr/local/bin/argocd
rm argocd-linux-amd64

# Login to ArgoCD
argocd login localhost:8080 --username admin --insecure

# List applications
argocd app list

# Get detailed status
argocd app get inventory-system-staging

# Sync application manually (if needed)
argocd app sync inventory-system-staging
```

**✅ Pass Criteria:**
- All ArgoCD pods running
- Can access ArgoCD UI
- Projects created successfully
- Applications synced and healthy

---

## 🔍 Phase 4: Application Deployment Testing

### Test 4.1: Verify Namespaces

```bash
# Check if application namespaces exist
kubectl get namespace inventory-system
kubectl get namespace kong-gateway

# If not created by ArgoCD, create manually:
kubectl create namespace inventory-system
kubectl create namespace kong-gateway
```

### Test 4.2: Check Application Pods

```bash
# List all pods in inventory-system namespace
kubectl get pods -n inventory-system -o wide

# Expected: Pods for all 5 microservices
# user-service
# inventory-service
# order-service
# product-catalog-service
# supplier-service
```

### Test 4.3: Check Services

```bash
# List services
kubectl get svc -n inventory-system

# Check Kong gateway
kubectl get svc -n kong-gateway

# Expected: ClusterIP services for all microservices
```

### Test 4.4: Check Horizontal Pod Autoscalers

```bash
# List HPAs
kubectl get hpa -n inventory-system

# Expected: HPA for each service with min/max replicas
```

### Test 4.5: Check Network Policies

```bash
# List network policies
kubectl get networkpolicy -n inventory-system

# Verify Kong gateway network policy
kubectl get networkpolicy -n kong-gateway
```

### Test 4.6: Test Application Health

```bash
# Port-forward to a service (example: user-service)
kubectl port-forward -n inventory-system svc/user-service 3001:3001 &

# Test health endpoint
curl http://localhost:3001/health

# Expected: {"status":"healthy"}

# Stop port-forward
pkill -f "port-forward.*user-service"
```

**✅ Pass Criteria:**
- All namespaces exist
- All pods running (5 microservices)
- Services accessible
- HPAs configured
- Network policies applied
- Health checks passing

---

## 🐳 Phase 5: Docker & GitHub Actions Testing

### Test 5.1: Verify Docker Images

```bash
# Check if images exist in GitHub Container Registry
# (Requires GitHub token with read:packages scope)

echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USERNAME --password-stdin

# Pull images
docker pull ghcr.io/it21182914/user-service:latest
docker pull ghcr.io/it21182914/inventory-service:latest
docker pull ghcr.io/it21182914/order-service:latest
docker pull ghcr.io/it21182914/product-catalog-service:latest
docker pull ghcr.io/it21182914/supplier-service:latest

# Expected: Images pulled successfully
```

### Test 5.2: Check GitHub Actions Status

```bash
# Visit GitHub repository
xdg-open https://github.com/IT21182914/WSO2-Final-Project-Inventory-Stock-Management-Microservices-System/actions

# Or use GitHub CLI (if installed)
gh workflow list
gh run list --limit 5
```

### Test 5.3: Trigger CI/CD Pipeline

```bash
# Make a small change
echo "# Test CI/CD" >> README.md

# Commit and push
git add README.md
git commit -m "test: Trigger CI/CD pipeline"
git push origin main

# Check GitHub Actions
# Expected: Workflows triggered and passing
```

**✅ Pass Criteria:**
- Docker images available in GHCR
- GitHub Actions workflows passing
- Can trigger pipeline manually

---

## 📊 Phase 6: End-to-End Testing

### Test 6.1: Full Deployment Flow

```bash
# 1. Make code change in a service
cd backend/services/user-service
echo "// Test change" >> server.js

# 2. Commit and push
git add .
git commit -m "test: E2E deployment test"
git push origin main

# 3. Wait for CI/CD pipeline to complete
# Check GitHub Actions: https://github.com/.../actions

# 4. Verify ArgoCD detects change
argocd app get inventory-system-staging

# 5. Check pods are updated
kubectl get pods -n inventory-system -w

# Expected: New pods created with new image
```

### Test 6.2: Health Check All Services

```bash
# Create a script to check all services
cat > /tmp/check-services.sh << 'EOF'
#!/bin/bash
NAMESPACE="inventory-system"
SERVICES=("user-service" "inventory-service" "order-service" "product-catalog-service" "supplier-service")

for service in "${SERVICES[@]}"; do
  echo "Checking ${service}..."
  kubectl port-forward -n ${NAMESPACE} svc/${service} 3000:3000 &
  PF_PID=$!
  sleep 2
  
  curl -s http://localhost:3000/health || echo "❌ ${service} health check failed"
  
  kill $PF_PID
  wait $PF_PID 2>/dev/null
done
EOF

chmod +x /tmp/check-services.sh
/tmp/check-services.sh
```

### Test 6.3: Test API Gateway

```bash
# Port-forward Kong gateway
kubectl port-forward -n kong-gateway svc/kong-proxy 8000:80 &

# Test routing to user-service
curl http://localhost:8000/users

# Test routing to inventory-service
curl http://localhost:8000/inventory

# Stop port-forward
pkill -f "port-forward.*kong"
```

**✅ Pass Criteria:**
- Code changes trigger CI/CD automatically
- ArgoCD syncs new image tags
- Pods restart with new images
- All services respond to health checks
- API Gateway routes traffic correctly

---

## 🔐 Phase 7: Security Testing

### Test 7.1: Verify Network Policies

```bash
# Try to access a service from a non-allowed pod
kubectl run test-pod --image=curlimages/curl -n inventory-system --rm -it -- /bin/sh

# Inside pod, try to reach user-service
curl http://user-service:3001/health

# Expected: Should work if within same namespace

# Try from different namespace
kubectl run test-pod --image=curlimages/curl -n default --rm -it -- sh -c "curl http://user-service.inventory-system:3001/health"

# Expected: Should be blocked by NetworkPolicy
```

### Test 7.2: Check RBAC Permissions

```bash
# Check ArgoCD RBAC
kubectl get rolebinding,clusterrolebinding -n argocd | grep argocd

# Verify service accounts
kubectl get serviceaccount -n inventory-system
```

### Test 7.3: Check Pod Security

```bash
# Verify pods don't run as root
kubectl get pods -n inventory-system -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.securityContext.runAsNonRoot}{"\n"}{end}'

# Check resource limits
kubectl describe deployment -n inventory-system | grep -A 5 "Limits:"
```

**✅ Pass Criteria:**
- Network policies enforce isolation
- RBAC configured correctly
- Pods follow security best practices

---

## 📈 Testing Summary Report

After completing all phases, generate a report:

```bash
cat > /tmp/test-report.txt << EOF
=============================================================================
INVENTORY MANAGEMENT SYSTEM - TEST REPORT
Generated: $(date)
=============================================================================

PHASE 1: INFRASTRUCTURE
✅ Terraform validation passed
✅ Ansible syntax checks passed

PHASE 2: KUBERNETES CLUSTER
✅ Cluster accessible
✅ All nodes Ready
✅ System pods running

PHASE 3: ARGOCD
✅ ArgoCD installed
✅ Projects created (staging, production)
✅ Applications synced

PHASE 4: APPLICATION DEPLOYMENT
✅ All 5 microservices deployed
✅ Services accessible
✅ HPAs configured
✅ Network policies active

PHASE 5: CI/CD
✅ Docker images available
✅ GitHub Actions passing

PHASE 6: END-TO-END
✅ Full deployment flow working
✅ Health checks passing
✅ API Gateway routing correctly

PHASE 7: SECURITY
✅ Network isolation verified
✅ RBAC configured
✅ Pod security enforced

=============================================================================
OVERALL STATUS: ✅ ALL TESTS PASSED
=============================================================================
EOF

cat /tmp/test-report.txt
```

---

## 🐛 Troubleshooting Common Issues

### Issue 1: ArgoCD Pods Not Starting

```bash
# Check events
kubectl get events -n argocd --sort-by='.lastTimestamp'

# Check pod logs
kubectl logs -n argocd deployment/argocd-server

# Solution: Wait for image pull, check resource availability
```

### Issue 2: Applications Not Syncing

```bash
# Force refresh
argocd app get inventory-system-staging --refresh

# Check sync status
kubectl describe application inventory-system-staging -n argocd

# Solution: Check repository URL, credentials, manifest paths
```

### Issue 3: Pods Stuck in Pending

```bash
# Describe pod
kubectl describe pod <pod-name> -n inventory-system

# Common causes:
# - Insufficient resources
# - Image pull errors
# - PVC not bound

# Check resources
kubectl top nodes
kubectl get pvc -n inventory-system
```

### Issue 4: Network Policy Blocking Traffic

```bash
# Temporarily disable network policy
kubectl delete networkpolicy --all -n inventory-system

# Test connectivity
# Re-apply network policy after testing
kubectl apply -f k8s/base/services/
```

---

## 📚 Next Steps After Testing

Once all tests pass, proceed with:

1. **Zero Trust Security** (mTLS, OPA)
2. **Monitoring Stack** (Prometheus, Grafana)
3. **Logging Stack** (OpenSearch, FluentBit)
4. **CI/CD GitOps Integration**
5. **Production Deployment**

---

## 🔗 Useful Commands Reference

```bash
# Quick cluster check
kubectl get all -A

# Watch pod status
kubectl get pods -n inventory-system -w

# Check ArgoCD status
kubectl get pods -n argocd

# View application logs
kubectl logs -n inventory-system deployment/user-service --tail=50

# Get application URL
kubectl get ingress -n inventory-system

# Scale deployment manually
kubectl scale deployment user-service -n inventory-system --replicas=3

# Rollback deployment
kubectl rollout undo deployment/user-service -n inventory-system

# Delete and re-deploy
kubectl delete -f k8s/argocd/applications/staging/
kubectl apply -f k8s/argocd/applications/staging/
```

---

**Happy Testing! 🚀**
