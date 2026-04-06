const mongoose = require('mongoose');

async function test(uri, name) {
  try {
    console.log('\n--- Testing', name, '---');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000, family: 4 });
    console.log('SUCCESS connecting to', name);
    await mongoose.connection.close();
  } catch (e) {
    console.log('FAIL for', name, '->', e.message);
  }
}

async function run() {
  await test('mongodb+srv://harishpbansodeaws26_db_user:fGu5t_3yQ5wNThs@cluster0.ca4dk4p.mongodb.net/stock-options', 'Standard SRV');
  await test('mongodb://harishpbansodeaws26_db_user:fGu5t_3yQ5wNThs@ac-xst33j7-shard-00-00.ca4dk4p.mongodb.net:27017,ac-xst33j7-shard-00-01.ca4dk4p.mongodb.net:27017,ac-xst33j7-shard-00-02.ca4dk4p.mongodb.net:27017/stock-options?ssl=true&replicaSet=atlas-xst33j7-shard-0&authSource=admin&retryWrites=true&w=majority', 'Raw Replica Set');
}
run();
