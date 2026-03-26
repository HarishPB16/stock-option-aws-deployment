const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');

async function test() {
  const uri = 'mongodb+srv://harishpbansodeaws26_db_user:fGu5t_3yQ5wNThs@cluster0.ca4dk4p.mongodb.net/stock-options';
  try {
    console.log('\n--- Testing with Custom DNS ---');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000, family: 4 });
    console.log('SUCCESS!');
    await mongoose.connection.close();
  } catch (e) {
    console.log('FAIL:', e.message);
  }
}
test();
