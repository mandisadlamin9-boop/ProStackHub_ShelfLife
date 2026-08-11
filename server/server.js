const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const { sql, databaseConnection } = require("./config/database");

const app = express();
const PORT = 5000;

app.use(express.json());

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/", (req, res) => {
  res.json({
    message: "ShelfLife API is running",
  });
});

/* =========================================================
   REGISTER
========================================================= */

app.post("/api/auth/register", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    /* -----------------------------------------------------
       BASIC VALIDATION
    ----------------------------------------------------- */

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "Full name, email and password are required.",
      });
    }

    const trimmedName = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 2) {
      return res.status(400).json({
        message: "Please enter your full name.",
      });
    }

    if (normalizedEmail.length < 5 || !normalizedEmail.includes("@")) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters.",
      });
    }

    /* -----------------------------------------------------
       DATABASE CONNECTION
    ----------------------------------------------------- */

    const pool = await databaseConnection;

    /* -----------------------------------------------------
       CHECK WHETHER EMAIL ALREADY EXISTS
    ----------------------------------------------------- */

    const existingAccount = await pool
      .request()
      .input("Email", sql.NVarChar(255), normalizedEmail).query(`
        SELECT AccountId
        FROM Accounts
        WHERE Email = @Email
      `);

    if (existingAccount.recordset.length > 0) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    /* -----------------------------------------------------
       HASH PASSWORD
    ----------------------------------------------------- */

    const passwordHash = await bcrypt.hash(password, 12);

    /* -----------------------------------------------------
       CREATE ACCOUNT
    ----------------------------------------------------- */

    const result = await pool
      .request()
      .input("FullName", sql.NVarChar(100), trimmedName)
      .input("Email", sql.NVarChar(255), normalizedEmail)
      .input("PasswordHash", sql.NVarChar(255), passwordHash).query(`
        INSERT INTO Accounts
        (
          FullName,
          Email,
          PasswordHash
        )
        OUTPUT
          INSERTED.AccountId,
          INSERTED.FullName,
          INSERTED.Email,
          INSERTED.CreatedAt
        VALUES
        (
          @FullName,
          @Email,
          @PasswordHash
        )
      `);

    const account = result.recordset[0];

    return res.status(201).json({
      message: "ShelfLife account created successfully.",
      account,
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Unable to create the ShelfLife account.",
    });
  }
});
/* =========================================================
LOGIN
========================================================= */

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    /* -----------------------------------------------------
       BASIC VALIDATION
    ----------------------------------------------------- */

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    /* -----------------------------------------------------
       DATABASE CONNECTION
    ----------------------------------------------------- */

    const pool = await databaseConnection;

    /* -----------------------------------------------------
       FIND ACCOUNT
    ----------------------------------------------------- */

    const result = await pool
      .request()
      .input("Email", sql.NVarChar(255), normalizedEmail).query(`
        SELECT
          AccountId,
          FullName,
          Email,
          PasswordHash,
          IsActive,
          CreatedAt
        FROM Accounts
        WHERE Email = @Email
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const account = result.recordset[0];

    /* -----------------------------------------------------
       CHECK ACCOUNT STATUS
    ----------------------------------------------------- */

    if (!account.IsActive) {
      return res.status(403).json({
        message: "This account is inactive.",
      });
    }

    /* -----------------------------------------------------
       VERIFY PASSWORD
    ----------------------------------------------------- */

    const passwordMatches = await bcrypt.compare(
      password,
      account.PasswordHash,
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    /* -----------------------------------------------------
       CREATE JWT
    ----------------------------------------------------- */

    const token = jwt.sign(
      {
        accountId: account.AccountId,
        email: account.Email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    /* -----------------------------------------------------
       REMOVE PASSWORD HASH FROM RESPONSE
    ----------------------------------------------------- */

    delete account.PasswordHash;

    /* -----------------------------------------------------
       LOGIN SUCCESS
    ----------------------------------------------------- */

    return res.status(200).json({
      message: "Login successful.",
      token,
      account,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Unable to log in to the ShelfLife account.",
    });
  }
});

/* =========================================================
   START SERVER
========================================================= */

app.listen(PORT, () => {
  console.log(`ShelfLife server running on http://localhost:${PORT}`);
});
