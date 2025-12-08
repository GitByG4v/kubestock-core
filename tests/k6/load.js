import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '10s', target: 20 }, // Ramp up to 20 users
        { duration: '30s', target: 20 }, // Stay at 20 users
        { duration: '10s', target: 0 },  // Ramp down to 0
    ],
    thresholds: {
        http_req_failed: ['rate<0.01'], // http errors should be less than 1%
        http_req_duration: ['p(95)<1000'], // 95% of requests should be below 1000ms
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5173';

export default function () {
    const res = http.get(`${BASE_URL}/api/products`);

    check(res, {
        'status is 200': (r) => r.status === 200,
    });

    sleep(1);
}
