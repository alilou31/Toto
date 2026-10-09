"use strict";

function canCreateDemoProfile(profile) {
  const name = String(profile?.name ?? "").trim();
  const age = Number(profile?.age);
  const bio = String(profile?.bio ?? "").trim();
  return name.length >= 2 && name.length <= 50 &&
    Number.isInteger(age) && age >= 18 && age <= 100 &&
    bio.length >= 10 && bio.length <= 400;
}

function toggleLike(profiles, id) {
  if (!Array.isArray(profiles)) throw new TypeError("profiles doit être un tableau");
  if (!profiles.some((profile) => profile.id === id)) return profiles;
  return profiles.map((profile) => profile.id === id ? { ...profile, liked: !profile.liked } : profile);
}

function listLikedProfiles(profiles) {
  return profiles.filter((profile) => profile.liked === true);
}

function listDemoMatches(profiles, reciprocalIds = ["sara", "ines"]) {
  return listLikedProfiles(profiles).filter((profile) => reciprocalIds.includes(profile.id));
}

module.exports = { canCreateDemoProfile, toggleLike, listLikedProfiles, listDemoMatches };
