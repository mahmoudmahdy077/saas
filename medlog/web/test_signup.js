const http = require('http');

const data = JSON.stringify({
    email: 'test@example.com',
    password: 'medlog2024'
});

const options = {
    hostname: 'auth',
    port: 9999,
    path: '/signup',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS10b2tlbi1leGFtcGxlIn0.examplekey',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.write(data);
req.end();
