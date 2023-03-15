const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`SELECT comp_code,amt,id FROM invoices`);
    return res.json({ invoices: results.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = await db.query(
      `SELECT amt,comp_code,id FROM invoices WHERE id = $1`,
      [id]
    );
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't find invoice with code of ${id}`, 404);
    }
    return res.send({ invoice: results.rows[0] });
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const results = await db.query(
      `INSERT INTO invoices (comp_code,amt) VALUES ($1,$2) RETURNING comp_code,amt, id`,
      [comp_code, amt]
    );
    return res.status(201).json({ invoice: results.rows[0] });
  } catch (e) {
    next(e);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const { amt, paid } = req.body;
    const { id } = req.params.id;
    let paidDate = null;
    const currResult = await db.query(
      `SELECT paid FROM invoices WHERE id = $1`,
      [id]
    );
    if (currResult.rows.length === 0) {
      return new ExpressError(`No such invoice: ${id}`, 404);
    }
    const currPaidDate = currResult.rows[0].paid_date;
    if (!currPaidDate && paid) {
      paidDate = new Date();
    } else if (!paid) {
      paidDate = null;
    } else {
      paidDate = currPaidDate;
    }
    const results = await db.query(
      `UPDATE invoices SET amt=$1, paid = $2, paid_date = $3 WHERE id = $4 RETURNING *`,
      [amt, paid, paidDate, id]
    );
    return res.send({ invoice: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const results = await db.query(`DELETE FROM invoices WHERE id = $1`, [
      req.params.code,
    ]);
    return res.send({ msg: "Deleted Invoice" });
  } catch (e) {
    next(e);
  }
});
module.exports = router;
