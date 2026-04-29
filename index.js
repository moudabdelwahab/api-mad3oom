const app = require('./src/app');
const sequelize = require('./src/config/database');

// Ensure database connection and models sync
// In a serverless environment, we might want to do this more carefully, 
// but for initial setup, this ensures the tables exist in Supabase.
const syncDb = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to Supabase PostgreSQL.');
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized.');
  } catch (err) {
    console.error('Database connection/sync error:', err);
  }
};

// We call syncDb but don't await it to block the cold start of the function,
// however, for the first request it will be important.
syncDb();

module.exports = app;
