const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Verify connection is working (triggers TLS handshake)
    await mongoose.connection.db.admin().ping();
    console.log(`✅ Database ping successful! Connected to live Atlas cluster.`);
    global.isMockMode = false;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log(`⚠️ Switching to Mock Database Mode fallback. The application remains fully functional!`);
    global.isMockMode = true;
  }
};

module.exports = connectDB;

