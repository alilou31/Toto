"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeEmail, isValidEmail, isAdult, validateSignup } = require("../lib/validation.cjs");

const today = new Date("2026-10-10T12:00:00.000Z");

test("normalise une adresse e-mail sans espaces et en minuscules", () => {
  assert.equal(normalizeEmail("  ALI@example.COM "), "ali@example.com");
});

test("accepte une adresse e-mail plausible et refuse les formats invalides", () => {
  assert.equal(isValidEmail("personne@example.fr"), true);
  assert.equal(isValidEmail("pas-une-adresse"), false);
  assert.equal(isValidEmail("a@b"), false);
});

test("vérifie précisément le seuil des 18 ans", () => {
  assert.equal(isAdult("2008-10-10", today), true);
  assert.equal(isAdult("2008-10-11", today), false);
  assert.equal(isAdult("2000-02-29", today), true);
});

test("refuse les dates impossibles et les dates futures", () => {
  assert.equal(isAdult("2020-02-30", today), false);
  assert.equal(isAdult("2099-01-01", today), false);
  assert.equal(isAdult("", today), false);
});

test("valide une inscription complète et renvoie l'e-mail normalisé", () => {
  const result = validateSignup({
    name: " Ali ",
    email: " ALI@example.fr ",
    password: "Motdepasse2026",
    birthDate: "1995-06-15",
    acceptedTerms: true
  }, today);
  assert.equal(result.valid, true);
  assert.deepEqual(result.normalized, { name: "Ali", email: "ali@example.fr" });
  assert.deepEqual(result.errors, {});
});

test("refuse une inscription invalide et détaille les erreurs", () => {
  const result = validateSignup({
    name: "A",
    email: "invalide",
    password: "123",
    birthDate: "2015-01-01",
    acceptedTerms: false
  }, today);
  assert.equal(result.valid, false);
  for (const field of ["name", "email", "password", "birthDate", "acceptedTerms"]) {
    assert.ok(result.errors[field], "Une erreur est attendue pour " + field);
  }
});

test("ne considère pas une case de conditions truthy comme un consentement valide", () => {
  const result = validateSignup({
    name: "Amira",
    email: "amira@example.fr",
    password: "bonjour12345",
    birthDate: "1998-04-12",
    acceptedTerms: "yes"
  }, today);
  assert.equal(result.valid, false);
  assert.ok(result.errors.acceptedTerms);
});
