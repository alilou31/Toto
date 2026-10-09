"use client";

import { useState } from "react";
import Link from "next/link";

type Check = { name: string; ok: boolean; detail: string };

export default function ValidationPage() {
  const [checks, setChecks] = useState<Check[]>([]);
  const [ran, setRan] = useState(false);

  function runChecks() {
    const results: Check[] = [];
    const email = document.querySelector<HTMLInputElement>("#test-email");
    const password = document.querySelector<HTMLInputElement>("#test-password");
    const birthDate = document.querySelector<HTMLInputElement>("#test-birthdate");
    const terms = document.querySelector<HTMLInputElement>("#test-terms");
    const emailOk = !!email && email.validity.valid && email.value.trim().length > 0;
    results.push({ name: "Adresse e-mail", ok: emailOk, detail: emailOk ? "Le navigateur accepte le format saisi." : "Saisissez une adresse e-mail valide." });
    const passwordOk = !!password && password.value.length >= 10 && /[A-Za-z]/.test(password.value) && /[0-9]/.test(password.value);
    results.push({ name: "Mot de passe", ok: passwordOk, detail: passwordOk ? "Longueur minimale et lettre/chiffre présents." : "Il faut 10 caractères minimum, avec une lettre et un chiffre." });
    let adult = false;
    if (birthDate?.value) {
      const d = new Date(birthDate.value + "T00:00:00");
      if (!Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === birthDate.value) {
        const now = new Date();
        let age = now.getFullYear() - d.getFullYear();
        if (now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) age--;
        adult = age >= 18 && d <= now;
      }
    }
    results.push({ name: "Âge minimum", ok: adult, detail: adult ? "La date saisie correspond à une personne majeure." : "Saisissez une date valide correspondant à 18 ans ou plus." });
    results.push({ name: "Acceptation des conditions", ok: terms?.checked === true, detail: terms?.checked ? "La case est cochée." : "Cochez la case de consentement pour tester le cas valide." });
    const links = ["/", "/connexion", "/inscription", "/conditions", "/confidentialite"];
    const navOk = links.every((path) => document.querySelector('a[href="' + path + '"]') !== null);
    results.push({ name: "Liens de navigation", ok: navOk, detail: navOk ? "Les liens de test sont présents sur cette page." : "Un ou plusieurs liens de navigation de test sont absents." });
    setChecks(results);
    setRan(true);
  }

  function fillValid() {
    const email = document.querySelector<HTMLInputElement>("#test-email");
    const password = document.querySelector<HTMLInputElement>("#test-password");
    const birthDate = document.querySelector<HTMLInputElement>("#test-birthdate");
    const terms = document.querySelector<HTMLInputElement>("#test-terms");
    if (email) email.value = "test@example.fr";
    if (password) password.value = "NIKAHYAtest2026";
    if (birthDate) birthDate.value = "1995-06-15";
    if (terms) terms.checked = true;
    setChecks([]);
    setRan(false);
  }

  function fillInvalid() {
    const email = document.querySelector<HTMLInputElement>("#test-email");
    const password = document.querySelector<HTMLInputElement>("#test-password");
    const birthDate = document.querySelector<HTMLInputElement>("#test-birthdate");
    const terms = document.querySelector<HTMLInputElement>("#test-terms");
    if (email) email.value = "adresse-invalide";
    if (password) password.value = "123";
    if (birthDate) birthDate.value = "2015-01-01";
    if (terms) terms.checked = false;
    setChecks([]);
    setRan(false);
  }

  return (
    <main className="auth-page">
      <section className="auth-card" style={{ maxWidth: 720 }}>
        <Link href="/" className="auth-brand">♥ <span>NIKAHYA</span></Link>
        <p className="auth-eyebrow">ENVIRONNEMENT DE DÉVELOPPEMENT</p>
        <h1 className="auth-title">Banc de validation</h1>
        <p className="auth-subtitle">Lancez des contrôles manuels de formulaire sans base de données. Cette page ne crée aucun compte et n’envoie aucune donnée.</p>
        <div style={{ display: "grid", gap: 16, marginTop: 24 }}>
          <label className="auth-label" htmlFor="test-email">Adresse e-mail
            <input className="auth-input" id="test-email" type="email" defaultValue="test@example.fr" required placeholder="vous@exemple.fr" />
          </label>
          <label className="auth-label" htmlFor="test-password">Mot de passe de test
            <input className="auth-input" id="test-password" type="text" defaultValue="NIKAHYAtest2026" required minLength={10} placeholder="10 caractères minimum" />
          </label>
          <label className="auth-label" htmlFor="test-birthdate">Date de naissance
            <input className="auth-input" id="test-birthdate" type="date" defaultValue="1995-06-15" required />
          </label>
          <label style={{ display: "flex", gap: 10, alignItems: "flex-start", lineHeight: 1.5 }}>
            <input id="test-terms" type="checkbox" defaultChecked style={{ marginTop: 4 }} />
            <span>J’accepte les conditions (case de test uniquement).</span>
          </label>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 22 }}>
          <button className="button button-green" type="button" onClick={runChecks}>Lancer les tests</button>
          <button className="button button-dark" type="button" onClick={fillValid}>Charger un cas valide</button>
          <button className="button button-quiet" type="button" onClick={fillInvalid}>Charger un cas invalide</button>
        </div>
        {ran && <div aria-live="polite" style={{ marginTop: 26 }}>
          <h2 style={{ fontSize: 20, marginBottom: 12 }}>Résultats : {checks.filter((c) => c.ok).length}/{checks.length} contrôles réussis</h2>
          <ul style={{ display: "grid", gap: 12, padding: 0, listStyle: "none" }}>
            {checks.map((check) => <li key={check.name} style={{ padding: 14, border: "1px solid var(--line, #e5e8e1)", borderRadius: 6 }}>
              <strong>{check.ok ? "✓" : "✕"} {check.name}</strong>
              <p style={{ margin: "5px 0 0", color: "var(--muted, #68716b)", lineHeight: 1.6 }}>{check.detail}</p>
            </li>)}
          </ul>
        </div>}
        <p className="auth-footer" style={{ marginTop: 24 }}>Outils de test uniquement · <Link href="/inscription">Inscription</Link> · <Link href="/connexion">Connexion</Link></p>
      </section>
    </main>
  );
}
