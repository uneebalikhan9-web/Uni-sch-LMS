const http = require('http');

const data = JSON.stringify({ email: 'rehan@gmail.com', password: 'password' });

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    const { token } = JSON.parse(body);
    if (!token) {
      console.log('Login failed:', body);
      process.exit(1);
    }
    
    http.get({
      hostname: 'localhost',
      port: 5000,
      path: '/api/bd/global/teachers',
      headers: { 'Authorization': `Bearer ${token}` }
    }, (res2) => {
      let b2 = '';
      res2.on('data', d => b2 += d);
      res2.on('end', () => {
        console.log('Response:', b2);
        process.exit(0);
      });
    });
  });
});

req.write(data);
req.end();
