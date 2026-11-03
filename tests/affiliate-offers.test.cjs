"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { approvedAffiliateOffers } = require("../lib/affiliate-offers.ts");

// Reserved example domain: test data only, never a configured commercial offer.
const offer = { ideaId: "cafe", partner: "Test fixture", url: "https://offers.example/cafe", label: "Voir", approved: true, expiresAt: "2999-12-31" };
function config(overrides = {}, offers = [offer]) {
  return { AFFILIATION_ENABLED: "true", AFFILIATION_ALLOWED_HOSTS: "offers.example", AFFILIATION_OFFERS_JSON: JSON.stringify(offers), ...overrides };
}

test("keeps affiliation disabled unless explicitly enabled", () => {
  for (const value of [undefined, "false", "TRUE", "1"]) {
    assert.deepEqual(approvedAffiliateOffers(config({ AFFILIATION_ENABLED: value })), []);
  }
});

test("returns only public fields for an approved, allowed offer", () => {
  assert.deepEqual(approvedAffiliateOffers(config()), [{ ideaId: "cafe", partner: "Test fixture", url: "https://offers.example/cafe", label: "Voir" }]);
});

test("rejects impossible calendar dates instead of keeping a mistyped offer active", () => {
  for (const expiresAt of ["2999-99-99", "2999-02-31", "2999-02-29", "2999-04-31"]) {
    assert.deepEqual(approvedAffiliateOffers(config({}, [{ ...offer, expiresAt }])), [], expiresAt);
  }
  assert.equal(approvedAffiliateOffers(config({}, [{ ...offer, expiresAt: "2996-02-29" }])).length, 1);
});

test("excludes expired, unapproved, unknown and duplicate offers", () => {
  assert.deepEqual(approvedAffiliateOffers(config({}, [
    { ...offer, expiresAt: "2000-01-01" }, { ...offer, approved: false }, { ...offer, ideaId: "unknown" },
  ])), []);
  assert.equal(approvedAffiliateOffers(config({}, [offer, offer])).length, 1);
});

test("fails closed for malformed configuration and absent allowlist", () => {
  for (const AFFILIATION_OFFERS_JSON of ["{", "null", "{}"]) {
    assert.deepEqual(approvedAffiliateOffers(config({ AFFILIATION_OFFERS_JSON })), []);
  }
  assert.deepEqual(approvedAffiliateOffers(config({ AFFILIATION_ALLOWED_HOSTS: "" })), []);
});

test("rejects unsafe URLs and hosts outside the exact allowlist", () => {
  for (const url of ["http://offers.example/cafe", "https://offers.example.evil.example/cafe", "https://user:password@offers.example/cafe", "https://offers.example:8443/cafe", "javascript:alert(1)"]) {
    assert.deepEqual(approvedAffiliateOffers(config({}, [{ ...offer, url }])), [], url);
  }
});
