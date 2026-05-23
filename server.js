import 'dotenv/config'; // ✅ line 1

import app from './app.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`\n🚀 ATS Recruitment API Server Started`);
      console.log(`📍 Running on: http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

process.on('SIGTERM', () => { console.log('🛑 SIGTERM received.'); process.exit(0); });
process.on('SIGINT', () => { console.log('🛑 SIGINT received.'); process.exit(0); });