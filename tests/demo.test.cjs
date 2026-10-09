"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { canCreateDemoProfile, toggleLike, listLikedProfiles, listDemoMatches } = require("../lib/demo.cjs");

const sample = [
  { id: "sara", name: "Sara", liked: false },
  { id: "adam", name: "Adam", liked: false },
  { id: "ines", name: "Inès", liked: true }
];

test("accepte un profil de démonstration valide", () => {
  assert.equal(canCreateDemoProfile({ name: " Amira ", age: "28", bio: "J'aime les promenades." }), true);
});

test("refuse profil trop court, mineur ou présentation vide", () => {
  assert.equal(canCreateDemoProfile({ name: "A", age: 28, bio: "Une présentation assez longue." }), false);
  assert.equal(canCreateDemoProfile({ name: "Amira", age: 17, bio: "Une présentation assez longue." }), false);
  assert.equal(canCreateDemoProfile({ name: "Amira", age: 28, bio: "court" }), false);
  assert.equal(canCreateDemoProfile({ name: "Amira", age: 101, bio: "Une présentation assez longue." }), false);
});

test("un like bascule et ne modifie pas le tableau original", () => {
  const next = toggleLike(sample, "sara");
  assert.equal(next[0].liked, true);
  assert.equal(sample[0].liked, false);
  assert.equal(toggleLike(next, "sara")[0].liked, false);
});

test("un identifiant inconnu ne modifie aucun profil", () => {
  assert.deepEqual(toggleLike(sample, "unknown"), sample);
});

test("liste les likes et les matchs de démonstration attendus", () => {
  const liked = toggleLike(sample, "sara");
  assert.deepEqual(listLikedProfiles(liked).map((p) => p.id), ["sara", "ines"]);
  assert.deepEqual(listDemoMatches(liked).map((p) => p.id), ["sara", "ines"]);
});
