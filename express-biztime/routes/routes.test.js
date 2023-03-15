process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
const db = require("../db");

let testCompany;
let testInvoice;

beforeEach(async () => {
  const addCompany = await db.query(
    `INSERT INTO companies (code,name,description) VALUES ('apple','Apple Computer','iPhone') RETURNING code,name,description`
  );
  const result = await db.query(
    `INSERT INTO invoices (comp_Code, amt)
        VALUES ('apple', 100) RETURNING comp_Code, amt, id`
  );
  testCompany = addCompany.rows[0];
  testInvoice = result.rows[0];
});

afterEach(async () => {
  await db.query(`DELETE FROM invoices`);
  await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
  await db.end();
});

describe("GET /companies", () => {
  test("Get a list of companies in db", async () => {
    const res = await request(app).get("/companies");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ companies: [testCompany] });
  });
});

describe("GET /invoices", () => {
  test("Get a list of invoices in db", async () => {
    const res = await request(app).get("/invoices");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ invoices: [testInvoice] });
  });
});

describe("GET /companies/:code", () => {
  test("Get a company in db", async () => {
    const res = await request(app).get(`/companies/${testCompany.code}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ company: testCompany });
  });
});

describe("GET /invoices/:id", () => {
  test("Get a list of invoices in db", async () => {
    const res = await request(app).get(`/invoices/${testInvoice.id}`);
    // expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      invoice: testInvoice,
    });
  });
});

describe("POST /companies", () => {
  test("Get a list of companies in db", async () => {
    const res = await request(app)
      .post("/companies")
      .send({ code: "Sony", name: "Sony Phone", description: "Phone" });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      company: { code: "Sony", name: "Sony Phone", description: "Phone" },
    });
  });
});

describe("POST /invoices", () => {
  test("Get a list of invoices in db", async () => {
    const res = await request(app)
      .post("/invoices")
      .send({ comp_code: "apple", amt: 200 });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      invoice: { comp_code: "apple", amt: 200, id: expect.any(Number) },
    });
  });
});

describe("PATCH /companies/:code", () => {
  test("Updates a company", async () => {
    const res = await request(app)
      .patch(`/companies/${testCompany.code}`)
      .send({ name: "appleNew", description: "appleNew" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      company: {
        code: testCompany.code,
        name: "appleNew",
        description: "appleNew",
      },
    });
  });
});

describe("PATCH /invoices/:id", () => {
  test("Updates an invoice", async () => {
    const res = await request(app)
      .patch(`/invoices/${testInvoice.id}`)
      .send({ amt: 500 });
    // expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      invoice: {
        amt: 500,
        comp_code: "apple",
        id: testInvoice.id,
      },
    });
  });
});

describe("DELETE /companies/:code", () => {
  test("Deletes a single company", async () => {
    const res = await request(app).delete(`/companies/${testCompany.code}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ msg: "DELETED" });
  });
});

describe("DELETE /invoices/:id", () => {
  test("Deletes a single invoice", async () => {
    const res = await request(app).delete(`/invoices/${testInvoice.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ msg: "Deleted Invoice" });
  });
});
