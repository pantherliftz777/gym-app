const { createClient } = require('@libsql/client');
const fs = require('fs');
const c = createClient({ url: 'file:fitfuel.db' });
c.execute("SELECT id, name, email, pass_hash, salt, is_admin FROM users WHERE email='admin@fitfuel.app'").then(r => {
  console.log('Admin user row:', r.rows);
});
