const sql = require("mssql/msnodesqlv8");

const connectionString =
  `Driver={ODBC Driver 17 for SQL Server};` +
  `Server=${process.env.DB_SERVER};` +
  `Database=${process.env.DB_DATABASE};` +
  `Trusted_Connection=Yes;` +
  `TrustServerCertificate=Yes;`;

const databaseConnection = new sql.ConnectionPool({
  connectionString,
})
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
