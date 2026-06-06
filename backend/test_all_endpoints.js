const express = require('express');
const { pool } = require('./config/database');
const rector = require('./api/rector');

async function test() {
  const req = { user: { role: 'rector', client_id: 1, campus_id: 1 } };
  const res = {
    json: (data) => console.log('SUCCESS:', JSON.stringify(data).substring(0, 50)),
    status: (code) => ({ json: (data) => console.log('ERROR', code, data) })
  };

  const methods = ['/stats', '/students', '/research', '/strategy'];
  
  for (const path of methods) {
    console.log(`\nTesting ${path}...`);
    const route = rector.stack.find(r => r.route && r.route.path === path);
    if (route) {
      // The last handler is the async function
      const handler = route.route.stack[route.route.stack.length - 1].handle;
      await handler(req, res);
    } else {
      console.log('Route not found!');
    }
  }
  process.exit(0);
}
test();
