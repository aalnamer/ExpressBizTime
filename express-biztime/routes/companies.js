const express = require("express");
const slugify = require("slugify");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM companies`);
    return res.json({ companies: results.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:code", async (req, res, next) => {
  try {
    const results = await db.query(
      `SELECT c.code, c.name, i.industry  
      FROM companies AS c 
      LEFT JOIN industries_companies AS ic ON c.code = ic.company_code 
      LEFT JOIN industries AS i ON ic.industry_code = i.code 
      WHERE c.code = $1`,
      [req.params.code]
    );

    // const results = await db.query(`SELECT * FROM companies WHERE code = $1`, [
    //   code,
    // ]);
    if (results.rows.length === 0) {
      throw new ExpressError(
        `Can't find company with code of ${req.params.code}`,
        404
      );
    }
    const { code, name } = results.rows[0];
    const industries = results.rows.map((r) => r.industry);
    return res.send({ code, name, industries });
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const code = slugify(name, { lower: true });
    const results = await db.query(
      `INSERT INTO companies (code,name,description) VALUES ($1,$2,$3) RETURNING code, name, description`,
      [code, name, description]
    );
    return res.status(201).json({ company: results.rows[0] });
  } catch (e) {
    next(e);
  }
});

router.patch("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const { name, description } = req.body;
    const results = await db.query(
      `UPDATE companies SET name = $1, description = $2 WHERE code = $3 RETURNING code, name, description`,
      [name, description, code]
    );
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't update company with code of ${code}`, 404);
    }
    return res.send({ company: results.rows[0] });
  } catch (e) {
    next(e);
  }
});

router.delete("/:code", async (req, res, next) => {
  try {
    const results = db.query(`DELETE FROM companies WHERE code = $1`, [
      req.params.code,
    ]);
    return res.send({ msg: "DELETED" });
  } catch (e) {
    next(e);
  }
});
module.exports = router;
