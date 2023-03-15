const express = require("express");
const slugify = require("slugify");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(
      `SELECT i.industry, c.code FROM industries AS i 
        LEFT JOIN industries_companies AS ic ON i.code = ic.industry_code 
        LEFT JOIN companies AS c ON c.code = ic.company_code`
    );
    return res.json({ industries: results.rows });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { industry } = req.body;
    const code = slugify(industry, { lower: true });
    const results = await db.query(
      `INSERT INTO industries VALUES ($1,$2) RETURNING code, industry`,
      [code, industry]
    );
    return res.status(201).json({ industry: results.rows[0] });
  } catch (e) {
    next(e);
  }
});

router.post("/addcompany", async (req, res, next) => {
  try {
    const { code, company } = req.body;
    const results = await db.query(
      `INSERT INTO industries_companies VALUES ($1,$2) RETURNING industry_code, company_code`,
      [code, company]
    );
    return res.status(201).json({ industry: results.rows[0] });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
