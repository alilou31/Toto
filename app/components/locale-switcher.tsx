"use client";
import { useEffect,useState } from "react";
import { useRouter } from "next/navigation";
import { localeNames,normalizeLocale,supportedLocales,type SupportedLocale } from "@/lib/i18n";
export default function LocaleSwitcher() {
 const router=useRouter(); const [locale,setLocale]=useState<SupportedLocale>("fr");
 useEffect(()=>{const m=document.cookie.match(/(?:^|; )nikahya_locale=([^;]+)/);const saved=m?decodeURIComponent(m[1]):navigator.language;const n=normalizeLocale(saved);setLocale(n);document.documentElement.lang=n},[]);
 function change(value:string){const n=normalizeLocale(value);setLocale(n);document.cookie="nikahya_locale="+n+"; Path=/; Max-Age=31536000; SameSite=Lax";document.documentElement.lang=n;router.refresh()}
 return <label className="locale-switcher"><span className="sr-only">Langue / Language / Idioma / Lingua</span><select aria-label="Langue" value={locale} onChange={e=>change(e.target.value)}>{supportedLocales.map(item=><option key={item} value={item}>{localeNames[item]}</option>)}</select></label>;
}
