#!/bin/bash

################################################################################
# Quick Test Script - Verify K8s Cluster and ArgoCD
################################################################################

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
PASSED=0
FAILED=0
WARNINGS=0

log_pass() { echo -e "${GREEN}✓${NC} $1"; ((PASSED++)); }
log_fail() { echo -e "${RED}✗${NC} $1"; ((FAILED++)); }
log_warn() { echo -e "${YELLOW}⚠${NC} $1"; ((WARNINGS++)); }
log_info() { echo -e "${BLUE}ℹ${NC} $1"; }

################################################################################
# Test 1: Check Prerequisites
################################################################################
test_prerequisites() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "TEST 1: Prerequisites Check"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if command -v kubectl &> /dev/null; then
        log_pass "kubectl installed: $(kubectl version --client --short 2>/dev/null | head -1 || kubectl version --client 2>/dev/null | grep 'Client Version' | head -1)"
    else
        log_fail "kubectl not installed"
        return 1
    fi
    
    if command -v docker &> /dev/null; then
        log_pass "docker installed: $(docker --version)"
    else
        log_warn "docker not installed (optional for testing)"
    fi
    
    if command -v git &> /dev/null; then
        log_pass "git installed: $(git --version)"
    else
        log_fail "git not installed"
    fi
}

################################################################################
# Test 2: Kubernetes Cluster Connectivity
################################################################################
test_cluster_connectivity() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "TEST 2: Kubernetes Cluster Connectivity"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if kubectl cluster-info &> /dev/null; then
        log_pass "Can connect to Kubernetes cluster"
        log_info "$(kubectl cluster-info | head -2)"
    else
        log_fail "Cannot connect to Kubernetes cluster"
        log_info "Please check your kubeconfig: ~/.kube/config"
        log_info "Or set KUBECONFIG environment variable"
        return 1
    fi
}

################################################################################
# Test 3: Check Nodes
################################################################################
test_nodes() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "TEST 3: Kubernetes Nodes"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    local node_count=$(kubectl get nodes --no-headers 2>/dev/null | wc -l)
    
    if [ "$node_count" -eq 0 ]; then
        log_fail "No nodes found in cluster"
        return 1
    fi
    
    log_pass "Found $node_count node(s)"
    
    kubectl get nodes -o wide
    echo ""
    
    local ready_nodes=$(kubectl get nodes --no-headers 2>/dev/null | grep -c " Ready " || echo "0")
    local not_ready=$(kubectl get nodes --no-headers 2>/dev/null | grep -c "NotReady" || echo "0")
    
    if [ "$ready_nodes" -eq "$node_count" ]; then
        log_pass "All $node_count nodes are Ready"
    elif [ "$not_ready" -gt 0 ]; then
        log_fail "$not_ready node(s) not ready"
    else
        log_warn "Some nodes may not be fully ready"
    fi
}

################################################################################
# Test 4: Check System Pods
################################################################################
test_system_pods() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "TEST 4: System Pods (kube-system)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    local total_pods=$(kubectl get pods -n kube-system --no-headers 2>/dev/null | wc -l)
    local running_pods=$(kubectl get pods -n kube-system --no-headers 2>/dev/null | grep -c "Running\|Completed" || echo "0")
    
    log_info "Total system pods: $total_pods"
    log_info "Running/Completed: $running_pods"
    
    if [ "$running_pods" -eq "$total_pods" ] && [ "$total_pods" -gt 0 ]; then
        log_pass "All system pods are running"
    else
        log_warn "Some system pods may not be running"
    fi
    
    echo ""
    kubectl get pods -n kube-system
}

################################################################################
# Test 5: Check ArgoCD Namespace
################################################################################
test_argocd_namespace() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "TEST 5: ArgoCD Namespace"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if kubectl get namespace argocd &> /dev/null; then
        log_pass "ArgoCD namespace exists"
    else
        log_fail "ArgoCD namespace not found"
        log_info "Run: kubectl apply -f k8s/argocd/namespace.yaml"
        return 1
    fi
}

################################################################################
# Test 6: Check ArgoCD Pods
################################################################################
test_argocd_pods() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "TEST 6: ArgoCD Pods"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    local argocd_pods=$(kubectl get pods -n argocd --no-headers 2>/dev/null | wc -l)
    
    if [ "$argocd_pods" -eq 0 ]; then
        log_fail "No ArgoCD pods found"
        log_info "Install ArgoCD: cd k8s/argocd && ./install.sh"
        return 1
    fi
    
    log_info "Found $argocd_pods ArgoCD pod(s)"
    
    local running=$(kubectl get pods -n argocd --no-headers 2>/dev/null | grep -c "Running" || echo "0")
    
    echo ""
    kubectl get pods -n argocd
    echo ""
    
    # Check for key components
    local components=("argocd-server" "argocd-repo-server" "argocd-application-controller")
    for component in "${components[@]}"; do
        if kubectl get pods -n argocd 2>/dev/null | grep -q "$component.*Running"; then
            log_pass "$component is running"
        else
            log_fail "$component not running"
        fi
    done
    
    if [ "$running" -ge 5 ]; then
        log_pass "ArgoCD core components are running"
    else
        log_warn "Some ArgoCD components may not be ready yet"
    fi
}

################################################################################
# Test 7: Check ArgoCD Services
################################################################################
test_argocd_services() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "TEST 7: ArgoCD Services"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if kubectl get svc -n argocd argocd-server &> /dev/null; then
        log_pass "argocd-server service exists"
        kubectl get svc -n argocd argocd-server
    else
        log_fail "argocd-server service not found"
    fi
}

################################################################################
# Test 8: Get ArgoCD Admin Password
################################################################################
test_argocd_password() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "TEST 8: ArgoCD Admin Credentials"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if kubectl get secret -n argocd argocd-initial-admin-secret &> /dev/null; then
        log_pass "Admin secret exists"
        
        local password=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" 2>/dev/null | base64 -d)
        
        if [ -n "$password" ]; then
            log_pass "Retrieved admin password"
            echo ""
            echo "  ┌─────────────────────────────────────────────┐"
            echo "  │  ArgoCD Login Credentials                   │"
            echo "  ├─────────────────────────────────────────────┤"
            echo "  │  Username: admin                            │"
            echo "  │  Password: $password"
            echo "  └─────────────────────────────────────────────┘"
            echo ""
        else
            log_warn "Could not retrieve password"
        fi
    else
        log_warn "Admin secret not found (may need to wait for ArgoCD to initialize)"
    fi
}

################################################################################
# Test 9: Check ArgoCD Projects
################################################################################
test_argocd_projects() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "TEST 9: ArgoCD Projects"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if ! kubectl get appproject -n argocd &> /dev/null; then
        log_warn "ArgoCD CRDs not installed yet (this is normal if just installed)"
        return 0
    fi
    
    local projects=$(kubectl get appproject -n argocd --no-headers 2>/dev/null | wc -l)
    
    if [ "$projects" -eq 0 ]; then
        log_warn "No ArgoCD projects found"
        log_info "Create projects: kubectl apply -f k8s/argocd/projects/"
    else
        log_pass "Found $projects ArgoCD project(s)"
        kubectl get appproject -n argocd
    fi
}

################################################################################
# Test 10: Check ArgoCD Applications
################################################################################
test_argocd_applications() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "TEST 10: ArgoCD Applications"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if ! kubectl get application -n argocd &> /dev/null; then
        log_warn "Cannot check applications (CRDs not ready)"
        return 0
    fi
    
    local apps=$(kubectl get application -n argocd --no-headers 2>/dev/null | wc -l)
    
    if [ "$apps" -eq 0 ]; then
        log_warn "No ArgoCD applications found"
        log_info "Create applications: kubectl apply -f k8s/argocd/applications/staging/"
    else
        log_pass "Found $apps ArgoCD application(s)"
        kubectl get application -n argocd
    fi
}

################################################################################
# Test 11: Port-Forward Test
################################################################################
test_port_forward() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "TEST 11: ArgoCD UI Access"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    log_info "To access ArgoCD UI, run:"
    echo ""
    echo "  kubectl port-forward svc/argocd-server -n argocd 8080:443"
    echo ""
    log_info "Then open: https://localhost:8080"
    log_info "Login with credentials shown above"
}

################################################################################
# Final Summary
################################################################################
print_summary() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "TEST SUMMARY"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo -e "${GREEN}Passed:${NC}   $PASSED"
    echo -e "${RED}Failed:${NC}   $FAILED"
    echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
    echo ""
    
    if [ "$FAILED" -eq 0 ]; then
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}✓ ALL CRITICAL TESTS PASSED!${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo "Your Kubernetes cluster and ArgoCD are working!"
        echo ""
        echo "Next steps:"
        echo "  1. Access ArgoCD UI: kubectl port-forward svc/argocd-server -n argocd 8080:443"
        echo "  2. Create projects: kubectl apply -f k8s/argocd/projects/"
        echo "  3. Deploy applications: kubectl apply -f k8s/argocd/applications/staging/"
        echo "  4. Proceed with Option B (Monitoring), C (Logging), or A (Security)"
        echo ""
        return 0
    else
        echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${RED}✗ SOME TESTS FAILED${NC}"
        echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo "Please fix the issues above before proceeding."
        echo ""
        return 1
    fi
}

################################################################################
# Main execution
################################################################################
main() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════════════════╗"
    echo "║         Kubernetes & ArgoCD Testing Suite                                   ║"
    echo "╚══════════════════════════════════════════════════════════════════════════════╝"
    
    test_prerequisites || true
    test_cluster_connectivity || true
    test_nodes || true
    test_system_pods || true
    test_argocd_namespace || true
    test_argocd_pods || true
    test_argocd_services || true
    test_argocd_password || true
    test_argocd_projects || true
    test_argocd_applications || true
    test_port_forward || true
    
    print_summary
}

main "$@"
