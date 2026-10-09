"use strict";

function normalizeEmail(value) {
  return String(value ?? "").trim().toLowerCase();
}

function isValidEmail(value) {
  const email = normalizeEmail(value);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isAdult(birthDate, today = new Date()) {
  if (typeof birthDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return false;
  const date = new Date(birthDate + "T00:00:00.000Z");
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== birthDate) return false;
  const now = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  if (date > now) return false;
  let age = now.getUTCFullYear() - date.getUTCFullYear();
  const beforeBirthday =
    now.getUTCMonth() < date.getUTCMonth() ||
    (now.getUTCMonth() === date.getUTCMonth() && now.getUTCDate() < date.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age >= 18;
}

function validateSignup(input, today = new Date()) {
  const errors = {};
  const name = String(input?.name ?? "").trim();
  const email = normalizeEmail(input?.email);
  const password = String(input?.password ?? "");
  const birthDate = String(input?.birthDate ?? "");
  if (name.length < 2 || name.length > 50) errors.name = "Le prénom doit contenir entre 2 et 50 caractères.";
  if (!isValidEmail(email)) errors.email = "Adresse e-mail invalide.";
  if (password.length < 10) errors.password = "Le mot de passe doit contenir au moins 10 caractères.";
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) errors.password = "Utilisez au moins 10 caractères, avec une lettre et un chiffre.";
  if (!isAdult(birthDate, today)) errors.birthDate = "Vous devez avoir 18 ans ou plus et saisir une date valide.";
  if (input?.acceptedTerms !== true) errors.acceptedTerms = "Vous devez accepter les conditions.";
  return { valid: Object.keys(errors).length === 0, errors, normalized: { name, email } };
}

module.exports = { normalizeEmail, isValidEmail, isAdult, validateSignup };
