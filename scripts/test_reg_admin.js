const http = require('http');
const req = http.request('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => console.log('Register response:', res.statusCode, d));
});
req.write(JSON.stringify({
  name: 'FitFuel Admin',
  email: 'admin@fitfuel.app',
  contact: '9999999999',
  password: 'AdminPassword123!'
}));
req.end();
