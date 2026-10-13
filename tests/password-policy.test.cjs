const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const source = fs.readFileSync(path.join(__dirname, "../app/api/auth/register/route.ts"), "utf8");
test("registration enforces password length and character classes", () => {
 assert.ok(source.includes("password.length < 12"));
 assert.ok(source.includes("!/[a-z]/.test(password)"));
 assert.ok(source.includes("!/[A-Z]/.test(password)"));
 assert.ok(source.includes("!/[0-9]/.test(password)"));
 assert.ok(source.includes("!/[^A-Za-z0-9]/.test(password)"));
});
