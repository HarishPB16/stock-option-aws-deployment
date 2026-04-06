const CryptoJS = require('crypto-js');
const encrypted = 'U2FsdGVkX1+vG02e0Gj3oHh/U2nOq5R59nKk0I3t1Xw=';
const secret = 'admin_secret';
const bytes = CryptoJS.AES.decrypt(encrypted, secret);
const decrypted = bytes.toString(CryptoJS.enc.Utf8);
console.log('Decrypted:', decrypted);
