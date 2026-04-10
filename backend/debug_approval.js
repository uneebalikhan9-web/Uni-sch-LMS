const axios = require('axios');

const API = 'http://localhost:5000/api';
// We need a token for a principal/admin
// I'll try to find one or mock the request if possible, 
// but I can't easily get a valid token without a password.

async function debug() {
  try {
    // Since I can't easily get a token, I'll just check the backend code one more time 
    // for any syntax errors that might cause a 500.
    console.log("Checking for syntax errors...");
  } catch (err) {
    console.error(err);
  }
}

debug();
