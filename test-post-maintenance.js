const http = require('http');

const postData = JSON.stringify({
    mosque_name: "Test Mosque",
    governorate: "Cairo",
    city: "Cairo",
    lat: 30.0444,
    lng: 31.2357,
    maintenance_types: ["Plumbing"],
    description: "Test description",
    whatsapp: "96891230000"
});

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/v1/maintenance',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', data);
    });
});

req.on('error', (error) => {
    console.error('Error:', error.message);
});

req.write(postData);
req.end();

