const sql = require("mssql");

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === "true",
  },
};

const databaseConnection = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("ShelfLife database connection established");
    return pool;
  })
  .catch((error) => {
    console.error("ShelfLife database connection failed:", error);
    throw error;
  });

module.exports = {
  sql,
  databaseConnection,
};
