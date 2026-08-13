const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { requireAuth } = require("./middleware/auth");

require("dotenv").config();

const { sql, databaseConnection } = require("./config/database");

const app = express();
const PORT = 5000;

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/", (req, res) => {
  res.json({
    message: "ShelfLife API is running",
  });
});
/* =========================================================
   BOOK SEARCH (Google Books API)
========================================================= */

app.get("/api/books/search", async (req, res) => {
  try {
    const query = (req.query.q || "fiction").trim();

    const googleUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
      query,
    )}&maxResults=12&key=${process.env.GOOGLE_BOOKS_API_KEY}`;
    const response = await fetch(googleUrl);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Google Books API failed:", response.status, errorBody);
      throw new Error(
        `Google Books API request failed (status ${response.status}): ${errorBody}`,
      );
    }

    const data = await response.json();

    const books = (data.items || []).map((item) => {
      const info = item.volumeInfo || {};

      const isbn =
        info.industryIdentifiers?.find((id) => id.type === "ISBN_13")
          ?.identifier ||
        info.industryIdentifiers?.[0]?.identifier ||
        null;

      return {
        id: item.id,
        title: info.title || "Untitled",
        author: info.authors?.[0] || "Unknown author",
        coverUrl: info.imageLinks?.thumbnail
          ? info.imageLinks.thumbnail.replace("http://", "https://")
          : null,
        year: info.publishedDate ? info.publishedDate.slice(0, 4) : null,
        isbn,
        totalPages: info.pageCount || null,
      };
    });

    return res.status(200).json({ books });
  } catch (error) {
    console.error("Book search error:", error);

    return res.status(500).json({
      message: "Unable to search for books.",
      error: error.message,
    });
  }
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
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Unable to log in to the ShelfLife account.",
      error: error.message,
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
      error: error.message,
    });
  }
});
/* =========================================================
   ADD BOOK TO SHELF
========================================================= */

app.post("/api/shelf", requireAuth, async (req, res) => {
  try {
    const { googleBooksId, title, author, coverUrl, isbn, status, totalPages } =
      req.body;

    if (!googleBooksId || !title) {
      return res.status(400).json({
        message: "Book ID and title are required.",
      });
    }

    const validStatuses = ["want_to_read", "currently_reading", "read"];
    const shelfStatus = validStatuses.includes(status)
      ? status
      : "want_to_read";

    const pool = await databaseConnection;

    const result = await pool
      .request()
      .input("AccountId", sql.Int, req.account.accountId)
      .input("GoogleBooksId", sql.NVarChar(50), googleBooksId)
      .input("Title", sql.NVarChar(500), title)
      .input("Author", sql.NVarChar(255), author || null)
      .input("CoverUrl", sql.NVarChar(1000), coverUrl || null)
      .input("Isbn", sql.NVarChar(20), isbn || null)
      .input("Status", sql.NVarChar(20), shelfStatus)
      .input("TotalPages", sql.Int, totalPages || null).query(`
        INSERT INTO ShelfItems
        (
          AccountId,
          GoogleBooksId,
          Title,
          Author,
          CoverUrl,
          Isbn,
          Status,
          TotalPages
        )
        OUTPUT
          INSERTED.*
        VALUES
        (
          @AccountId,
          @GoogleBooksId,
          @Title,
          @Author,
          @CoverUrl,
          @Isbn,
          @Status,
          @TotalPages
        )
      `);

    return res.status(201).json({
      message: "Book added to your shelf.",
      shelfItem: result.recordset[0],
    });
  } catch (error) {
    console.error("Add to shelf error:", error);

    return res.status(500).json({
      message: "Unable to add book to shelf.",
      error: error.message,
    });
  }
});

/* =========================================================
   GET MY SHELF
========================================================= */

app.get("/api/shelf", requireAuth, async (req, res) => {
  try {
    const { status } = req.query;

    const pool = await databaseConnection;

    const request = pool
      .request()
      .input("AccountId", sql.Int, req.account.accountId);

    let query = `
      SELECT *
      FROM ShelfItems
      WHERE AccountId = @AccountId
    `;

    const validStatuses = ["want_to_read", "currently_reading", "read"];

    if (status && validStatuses.includes(status)) {
      request.input("Status", sql.NVarChar(20), status);
      query += ` AND Status = @Status`;
    }

    query += ` ORDER BY DateAdded DESC`;

    const result = await request.query(query);

    return res.status(200).json({
      shelfItems: result.recordset,
    });
  } catch (error) {
    console.error("Get shelf error:", error);

    return res.status(500).json({
      message: "Unable to load your shelf.",
      error: error.message,
    });
  }
});
/* =========================================================
   GET SINGLE SHELF ITEM
========================================================= */

app.get("/api/shelf/:id", requireAuth, async (req, res) => {
  try {
    const shelfItemId = parseInt(req.params.id, 10);

    if (Number.isNaN(shelfItemId)) {
      return res.status(400).json({
        message: "Invalid shelf item ID.",
      });
    }

    const pool = await databaseConnection;

    const result = await pool
      .request()
      .input("ShelfItemId", sql.Int, shelfItemId)
      .input("AccountId", sql.Int, req.account.accountId).query(`
        SELECT *
        FROM ShelfItems
        WHERE ShelfItemId = @ShelfItemId AND AccountId = @AccountId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: "Shelf item not found.",
      });
    }

    return res.status(200).json({
      shelfItem: result.recordset[0],
    });
  } catch (error) {
    console.error("Get shelf item error:", error);

    return res.status(500).json({
      message: "Unable to load shelf item.",
      error: error.message,
    });
  }
});
/* =========================================================
   UPDATE SHELF ITEM (status, progress, rating, review)
========================================================= */

app.patch("/api/shelf/:id", requireAuth, async (req, res) => {
  try {
    const shelfItemId = parseInt(req.params.id, 10);

    if (Number.isNaN(shelfItemId)) {
      return res.status(400).json({
        message: "Invalid shelf item ID.",
      });
    }

    const { status, currentPage, rating, review } = req.body;

    const pool = await databaseConnection;

    /* -----------------------------------------------------
       CONFIRM OWNERSHIP FIRST
    ----------------------------------------------------- */

    const ownerCheck = await pool
      .request()
      .input("ShelfItemId", sql.Int, shelfItemId)
      .input("AccountId", sql.Int, req.account.accountId).query(`
        SELECT ShelfItemId
        FROM ShelfItems
        WHERE ShelfItemId = @ShelfItemId AND AccountId = @AccountId
      `);

    if (ownerCheck.recordset.length === 0) {
      return res.status(404).json({
        message: "Shelf item not found.",
      });
    }

    /* -----------------------------------------------------
       BUILD DYNAMIC UPDATE
    ----------------------------------------------------- */

    const request = pool
      .request()
      .input("ShelfItemId", sql.Int, shelfItemId)
      .input("AccountId", sql.Int, req.account.accountId);

    const updates = [];

    const validStatuses = ["want_to_read", "currently_reading", "read"];

    if (status !== undefined) {
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid status value.",
        });
      }

      request.input("Status", sql.NVarChar(20), status);
      updates.push("Status = @Status");

      if (status === "currently_reading") {
        updates.push("DateStarted = COALESCE(DateStarted, GETDATE())");
      }

      if (status === "read") {
        updates.push("DateCompleted = GETDATE()");
      }
    }

    if (currentPage !== undefined) {
      request.input("CurrentPage", sql.Int, currentPage);
      updates.push("CurrentPage = @CurrentPage");
    }

    if (rating !== undefined) {
      if (rating !== null && (rating < 1 || rating > 5)) {
        return res.status(400).json({
          message: "Rating must be between 1 and 5.",
        });
      }

      request.input("Rating", sql.Int, rating);
      updates.push("Rating = @Rating");
    }

    if (review !== undefined) {
      request.input("Review", sql.NVarChar(sql.MAX), review);
      updates.push("Review = @Review");
    }

    if (updates.length === 0) {
      return res.status(400).json({
        message: "No valid fields provided to update.",
      });
    }

    const result = await request.query(`
      UPDATE ShelfItems
      SET ${updates.join(", ")}
      OUTPUT INSERTED.*
      WHERE ShelfItemId = @ShelfItemId AND AccountId = @AccountId
    `);

    return res.status(200).json({
      message: "Shelf item updated.",
      shelfItem: result.recordset[0],
    });
  } catch (error) {
    console.error("Update shelf item error:", error);

    return res.status(500).json({
      message: "Unable to update shelf item.",
      error: error.message,
    });
  }
});

/* =========================================================
   REMOVE FROM SHELF
========================================================= */

app.delete("/api/shelf/:id", requireAuth, async (req, res) => {
  try {
    const shelfItemId = parseInt(req.params.id, 10);

    if (Number.isNaN(shelfItemId)) {
      return res.status(400).json({
        message: "Invalid shelf item ID.",
      });
    }

    const pool = await databaseConnection;

    const result = await pool
      .request()
      .input("ShelfItemId", sql.Int, shelfItemId)
      .input("AccountId", sql.Int, req.account.accountId).query(`
        DELETE FROM ShelfItems
        OUTPUT DELETED.ShelfItemId
        WHERE ShelfItemId = @ShelfItemId AND AccountId = @AccountId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: "Shelf item not found.",
      });
    }

    return res.status(200).json({
      message: "Book removed from shelf.",
    });
  } catch (error) {
    console.error("Remove from shelf error:", error);

    return res.status(500).json({
      message: "Unable to remove book from shelf.",
      error: error.message,
    });
  }
});
/* =========================================================
   START SERVER
========================================================= */

app.listen(PORT, () => {
  console.log(`ShelfLife server running on http://localhost:${PORT}`);
});
