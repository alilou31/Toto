"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BadgeCheck, Check, Eye, EyeOff, Heart, LockKeyhole, Save, ShieldCheck, Sparkles, UserRound, WandSparkles } from "lucide-react";

type Visibility = "hidden" | "visible" | "paused";
type Profile = {
  public_name?: string | null;
  city?: string | null;
  bio?: string | null;
  relationship_intention?: string | null;
  birth_date?: string | null;
  visibility?: Visibility | null;
  hobbies?: string[] | null;
  favorite_games?: string[] | null;
  interests?: string[] | null;
  occupation?: string | null;
  religion?: string | null;
  ethnicity?: string | null;
  show_sensitive_identity?: boolean | null;
};

const intentions = [
  { value: "marriage", label: "Mariage", detail: "Construire une vie à deux" },
  { value: "serious", label: "Relation sérieuse", detail: "Avancer avec une intention claire" },
  { value: "friendship", label: "Faire connaissance", detail: "Prendre le temps de se découvrir" },
  { value: "unspecified", label: "À discuter", detail: "Laisser la conversation guider" },
];

const visibilityOptions: { value: Visibility; label: string; detail: string }[] = [
  { value: "hidden", label: "Masqué", detail: "Seul vous pouvez consulter votre profil." },
  { value: "paused", label: "En pause", detail: "Vous faites une pause dans la découverte." },
  { value: "visible", label: "Visible", detail: "Votre profil peut apparaître dans la découverte." },
];

function getProfileProgress(profile: { publicName: string; birthDate: string; city: string; bio: string; intention: string }) {
  const checks = [
    profile.publicName.trim().length >= 2,
    Boolean(profile.birthDate),
    profile.bio.trim().length >= 40,
    Boolean(profile.intention),
    Boolean(profile.city.trim()),
  ];
  return { count: checks.filter(Boolean).length, total: checks.length, percent: Math.round((checks.filter(Boolean).length / checks.length) * 100) };
}

export default function ProfilePage() {
  const [publicName, setPublicName] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [intention, setIntention] = useState("marriage");
  const [visibility, setVisibility] = useState<Visibility>("hidden");
  const [hobbies, setHobbies] = useState("");
  const [favoriteGames, setFavoriteGames] = useState("");
  const [interests, setInterests] = useState("");
  const [occupation, setOccupation] = useState("");
  const [religion, setReligion] = useState("");
  const [ethnicity, setEthnicity] = useState("");
  const [showSensitiveIdentity, setShowSensitiveIdentity] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/profile", { cache: "no-store" })
      .then(async response => {
        const data = await response.json();
        if (response.status === 401) {
          if (active) setNeedsAuth(true);
          throw new Error("Connectez-vous pour consulter et modifier votre profil.");
        }
        if (!response.ok) throw new Error(data.error || "Impossible de charger votre profil.");
        return data.profile as Profile | null;
      })
      .then(profile => {
        if (!active) return;
        const next = {
          publicName: profile?.public_name ?? "",
          city: profile?.city ?? "",
          bio: profile?.bio ?? "",
          birthDate: profile?.birth_date ? String(profile.birth_date).slice(0, 10) : "",
          intention: profile?.relationship_intention ?? "marriage",
          visibility: profile?.visibility ?? "hidden" as Visibility,
          hobbies: (profile?.hobbies ?? []).join(", "),
          favoriteGames: (profile?.favorite_games ?? []).join(", "),
          interests: (profile?.interests ?? []).join(", "),
          occupation: profile?.occupation ?? "",
          religion: profile?.religion ?? "",
          ethnicity: profile?.ethnicity ?? "",
          showSensitiveIdentity: profile?.show_sensitive_identity ?? false,
        };
        setPublicName(next.publicName);
        setCity(next.city);
        setBio(next.bio);
        setBirthDate(next.birthDate);
        setIntention(next.intention);
        setVisibility(next.visibility as Visibility);
        setHobbies(next.hobbies);
        setFavoriteGames(next.favoriteGames);
        setInterests(next.interests);
        setOccupation(next.occupation);
        setReligion(next.religion);
        setEthnicity(next.ethnicity);
        setShowSensitiveIdentity(next.showSensitiveIdentity);
        setSavedSnapshot(JSON.stringify(next));
      })
      .catch(cause => {
        if (active) {
          setError(true);
          setMessage(cause instanceof Error ? cause.message : "Impossible de charger votre profil.");
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const snapshot = useMemo(() => JSON.stringify({ publicName, city, bio, birthDate, intention, visibility, hobbies, favoriteGames, interests, occupation, religion, ethnicity, showSensitiveIdentity }), [publicName, city, bio, birthDate, intention, visibility, hobbies, favoriteGames, interests, occupation, religion, ethnicity, showSensitiveIdentity]);
  const dirty = Boolean(savedSnapshot) && snapshot !== savedSnapshot;
  const progress = getProfileProgress({ publicName, birthDate, city, bio, intention });
  const selectedIntention = intentions.find(item => item.value === intention)?.label ?? "À discuter";
  const visibilityLabel = visibilityOptions.find(item => item.value === visibility)?.label ?? "Masqué";
  const maxBirthDate = new Date();
  maxBirthDate.setFullYear(maxBirthDate.getFullYear() - 18);
  const maxBirthDateValue = maxBirthDate.toISOString().slice(0, 10);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError(false);
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicName, city, bio, birthDate, relationshipIntention: intention, visibility, hobbies: hobbies.split(",").map(v => v.trim()).filter(Boolean), favoriteGames: favoriteGames.split(",").map(v => v.trim()).filter(Boolean), interests: interests.split(",").map(v => v.trim()).filter(Boolean), occupation, religion, ethnicity, showSensitiveIdentity }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Enregistrement impossible.");
      setSavedSnapshot(snapshot);
      setMessage(visibility === "visible" ? "Votre profil est enregistré et visible dans la découverte." : visibility === "paused" ? "Votre profil est enregistré et mis en pause." : "Votre profil est enregistré et reste masqué.");
    } catch (cause) {
      setError(true);
      setMessage(cause instanceof Error ? cause.message : "Service indisponible. Réessayez.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="personalize-page">
      <header className="personalize-header">
        <Link href="/tableau-de-bord" className="personalize-back"><ArrowLeft size={17} /> Mon espace</Link>
        <Link href="/" className="brand" aria-label="NIKAHYA, accueil"><span className="brand-mark"><Heart size={19}/></span><span className="brand-word">NIKAHYA<span className="brand-dot">.</span></span></Link>
        <Link href="/parametres/securite" className="personalize-security"><ShieldCheck size={16} /><span>Confidentialité</span></Link>
      </header>

      <div className="personalize-layout">
        <section className="personalize-main">
          <div className="personalize-kicker"><Sparkles size={14} /> VOTRE ESPACE PERSONNEL</div>
          <h1>Un profil qui vous <em>ressemble.</em></h1>
          <p className="personalize-intro">Les bonnes rencontres commencent par ce qui compte vraiment pour vous. Prenez votre temps : vous gardez le contrôle sur chaque information.</p>

          {loading ? <div className="personalize-loading" role="status">Chargement de votre profil…</div> : needsAuth ? (
            <section className="personalize-section personalize-auth-required" aria-labelledby="profile-auth-title">
              <div className="personalize-section-heading"><span className="personalize-step"><LockKeyhole size={17}/></span><div><h2 id="profile-auth-title">Connectez-vous pour continuer</h2><p>Votre profil personnel est protégé. Connectez-vous pour consulter vos informations, les modifier et les enregistrer en toute sécurité.</p></div></div>
              <div className="personalize-auth-actions">
                <Link href="/connexion?next=%2Fprofil" className="personalize-save">Se connecter <ArrowRight size={16}/></Link>
                <Link href="/inscription" className="personalize-auth-secondary">Créer mon compte</Link>
              </div>
            </section>
          ) : (
            <form className="personalize-form" onSubmit={submit}>
              <section className="personalize-section">
                <div className="personalize-section-heading"><span className="personalize-step">01</span><div><h2>Votre identité</h2><p>Les premières choses que l’on découvre de vous.</p></div></div>
                <div className="personalize-fields">
                  <label className="personalize-field"><span>Prénom ou nom public <b>*</b></span><input required minLength={2} maxLength={40} value={publicName} onChange={e=>setPublicName(e.target.value)} autoComplete="nickname" placeholder="Comment souhaitez-vous être appelé·e ?" /></label>
                  <label className="personalize-field"><span>Ville <small>Facultatif</small></span><input maxLength={100} value={city} onChange={e=>setCity(e.target.value)} autoComplete="address-level2" placeholder="Ex. Bordeaux" /></label>
                  <label className="personalize-field personalize-field-full"><span>Date de naissance <b>*</b></span><input type="date" required max={maxBirthDateValue} value={birthDate} onChange={e=>setBirthDate(e.target.value)} autoComplete="bday" /><small className="personalize-hint"><LockKeyhole size={13} /> Votre date de naissance n’est jamais affichée sur le profil public. NIKAHYA est réservé aux adultes de 18 ans et plus.</small></label>
                </div>
              </section>

              <section className="personalize-section">
                <div className="personalize-section-heading"><span className="personalize-step">02</span><div><h2>Ce qui vous anime</h2><p>Donnez un aperçu sincère de votre personnalité.</p></div></div>
                <label className="personalize-field"><span>Quelques mots sur vous</span><textarea rows={5} maxLength={1000} value={bio} onChange={e=>setBio(e.target.value)} placeholder="Vos valeurs, vos centres d’intérêt, ce qui vous fait sourire et ce que vous aimeriez construire…" /><div className="personalize-character-count">{bio.length}/1000 caractères <span>{bio.trim().length >= 40 ? "Belle présentation !" : "Quelques phrases suffisent."}</span></div></label>
                <div className="personalize-field"><span>Votre intention relationnelle</span><div className="personalize-intentions">{intentions.map(item=><button type="button" key={item.value} className={intention === item.value ? "personalize-intention is-selected" : "personalize-intention"} onClick={()=>setIntention(item.value)} aria-pressed={intention === item.value}><span className="personalize-radio">{intention === item.value && <Check size={12}/>}</span><span><strong>{item.label}</strong><small>{item.detail}</small></span></button>)}</div></div>
              </section>

              <section className="personalize-section">
                <div className="personalize-section-heading"><span className="personalize-step">03</span><div><h2>Vos points communs</h2><p>Des sujets concrets pour lancer une conversation et retrouver des personnes qui aiment les mêmes choses.</p></div></div>
                <div className="personalize-fields">
                  <label className="personalize-field personalize-field-full"><span>Jeux auxquels vous aimez jouer</span><input maxLength={500} value={favoriteGames} onChange={e=>setFavoriteGames(e.target.value)} placeholder="Ex. échecs, Mario Kart, jeux de société, énigmes…"/><small className="personalize-hint">Séparez les jeux par des virgules.</small></label>
                  <label className="personalize-field personalize-field-full"><span>Hobbies et activités</span><input maxLength={500} value={hobbies} onChange={e=>setHobbies(e.target.value)} placeholder="Ex. randonnée, cuisine, lecture, photographie…"/></label>
                  <label className="personalize-field personalize-field-full"><span>Centres d’intérêt</span><input maxLength={700} value={interests} onChange={e=>setInterests(e.target.value)} placeholder="Ex. voyages, technologie, famille, culture, sport…"/></label>
                  <label className="personalize-field"><span>Métier ou domaine</span><input maxLength={100} value={occupation} onChange={e=>setOccupation(e.target.value)} placeholder="Ex. infirmier·ère, ingénierie…"/></label>
                  <label className="personalize-field"><span>Religion ou spiritualité <small>Facultatif</small></span><input maxLength={100} value={religion} onChange={e=>setReligion(e.target.value)} placeholder="Si vous souhaitez le partager"/></label>
                  <label className="personalize-field"><span>Origine / ethnicité <small>Facultatif</small></span><input maxLength={100} value={ethnicity} onChange={e=>setEthnicity(e.target.value)} placeholder="Si vous souhaitez le partager"/></label>
                  <label className="personalize-field personalize-field-full" style={{display:"flex",alignItems:"flex-start",gap:10}}>
                    <input type="checkbox" checked={showSensitiveIdentity} onChange={e=>setShowSensitiveIdentity(e.target.checked)} style={{marginTop:4,width:18,height:18}}/>
                    <span>J’accepte explicitement d’afficher ma religion/spiritualité et mon origine sur mon profil public. <small>Sans cette case cochée, ces informations restent privées.</small></span>
                  </label>
                </div>
              </section>

              <section className="personalize-section">
                <div className="personalize-section-heading"><span className="personalize-step">04</span><div><h2>Vous choisissez la visibilité</h2><p>Changez ce réglage à tout moment.</p></div></div>
                <div className="personalize-visibility">{visibilityOptions.map(item=><button type="button" key={item.value} className={visibility === item.value ? "personalize-visibility-option is-selected" : "personalize-visibility-option"} onClick={()=>setVisibility(item.value)} aria-pressed={visibility === item.value}><span className="personalize-visibility-icon">{item.value === "visible" ? <Eye size={18}/> : item.value === "paused" ? <EyeOff size={18}/> : <LockKeyhole size={18}/>}</span><span><strong>{item.label}</strong><small>{item.detail}</small></span><span className="personalize-radio">{visibility === item.value && <Check size={12}/>}</span></button>)}</div>
              </section>

              <div className="personalize-submit-row"><div className="personalize-save-note"><ShieldCheck size={16}/><span>Vos changements sont enregistrés uniquement quand vous appuyez sur le bouton.</span></div><button className="personalize-save" type="submit" disabled={saving || loading}><Save size={17}/>{saving ? "Enregistrement…" : dirty ? "Enregistrer les changements" : "Enregistrer mon profil"}</button></div>
              {message && <p className={error ? "personalize-message is-error" : "personalize-message"} role={error ? "alert" : "status"}>{message}</p>}
            </form>
          )}
        </section>

        {!loading && !needsAuth && <aside className="personalize-aside">
          <section className="personalize-progress-card">
            <div className="personalize-progress-top"><span>VOTRE PROFIL</span><BadgeCheck size={18}/></div>
            <div className="personalize-progress-number">{progress.percent}<span>%</span></div>
            <div className="personalize-progress-track"><span style={{ width: progress.percent + "%" }} /></div>
            <p>{progress.percent === 100 ? "Votre profil a toutes les informations essentielles." : "Chaque détail partagé aide les autres à mieux vous connaître. Rien n’est obligatoire à part les informations essentielles."}</p>
            <div className="personalize-progress-list">{[
              ["Prénom public", publicName.trim().length >= 2],
              ["Date de naissance", Boolean(birthDate)],
              ["Présentation", bio.trim().length >= 40],
              ["Intention", Boolean(intention)],
              ["Ville", Boolean(city.trim())],
            ].map(([label, complete])=><div key={String(label)}><span className={complete ? "personalize-check is-done" : "personalize-check"}>{complete ? <Check size={12}/> : <span/>}</span><span>{label}</span><small>{complete ? "Complété" : "À renseigner"}</small></div>)}</div>
          </section>

          <section className="personalize-preview-card">
            <div className="personalize-preview-label"><Eye size={14}/> APERÇU DE VOTRE PROFIL</div>
            <div className="personalize-avatar">{publicName.trim().charAt(0).toLocaleUpperCase() || <UserRound size={25}/>}</div>
            <h3>{publicName.trim() || "Votre prénom public"}</h3>
            <p className="personalize-preview-meta">{city.trim() || "Votre ville"} <span>·</span> {selectedIntention}</p>
            <p className="personalize-preview-bio">{bio.trim() || "Votre présentation apparaîtra ici. Partagez quelques mots sur vos valeurs et ce qui vous tient à cœur."}</p>
            <div className={"personalize-preview-status status-" + visibility}><span/> {visibilityLabel}</div>
            <p className="personalize-preview-private"><LockKeyhole size={13}/> E-mail et date de naissance privés.</p>
          </section>

          <section className="personalize-tip"><span><WandSparkles size={18}/></span><div><strong>Un conseil pour une rencontre sincère</strong><p>Parlez de ce qui compte pour vous plutôt que de chercher la phrase parfaite. L’authenticité est un bon début.</p></div></section>
          <Link href="/tableau-de-bord" className="personalize-dashboard-link">Retourner à mon tableau de bord <ArrowRight size={15}/></Link>
        </aside>}
      </div>
    </main>
  );
}
