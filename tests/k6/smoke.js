import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    vus: 1, // 1 Virtual User
    duration: '10s', // Short duration for smoke test
    thresholds: {
        http_req_failed: ['rate<0.01'], // http errors should be less than 1%
        http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5173';
const PRODUCT_SERVICE_URL = __ENV.PRODUCT_SERVICE_URL || 'http://localhost:3002';

export default function () {
    // 1. Check Product Service Health (Direct)
    const healthRes = http.get(`${PRODUCT_SERVICE_URL}/health`);
    check(healthRes, {
        'Product Service is Healthy (200)': (r) => r.status === 200,
    });

    // 2. Check API Gateway Routing to Products
    const apiRes = http.get(`${BASE_URL}/api/product`);
    check(apiRes, {
        'API Gateway -> Products (200)': (r) => r.status === 200,
        'Response time < 500ms': (r) => r.timings.duration < 500,
    });

    sleep(1);
}
