const CryptoJS = require('crypto-js');
const encrypted = CryptoJS.AES.encrypt('Aws@16', 'admin_secret').toString();
console.log('Valid Encrypted String:', encrypted);
