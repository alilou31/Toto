export const supportedLocales = ["fr","en","es","it"] as const;
export type SupportedLocale = (typeof supportedLocales)[number];
export const localeNames: Record<SupportedLocale,string> = { fr:"Français", en:"English", es:"Español", it:"Italiano" };
export const localeMessages = {
 fr:{login:"Se connecter",signup:"Créer un compte",discover:"Découvrir",play:"Jouer",dashboard:"Tableau de bord",verification:"Profil vérifié",hero:"Et si vous trouviez la bonne personne en jouant ?",heroCta:"Faire le premier pas",intro:"Une énigme pour briser la glace. Un jeu pour se découvrir. Une conversation pour voir si vos chemins peuvent se rejoindre."},
 en:{login:"Log in",signup:"Create an account",discover:"Discover",play:"Play",dashboard:"Dashboard",verification:"Verified profile",hero:"What if you met the right person by playing?",heroCta:"Take the first step",intro:"A riddle to break the ice. A game to discover each other. A conversation to see whether your paths could meet."},
 es:{login:"Iniciar sesión",signup:"Crear una cuenta",discover:"Descubrir",play:"Jugar",dashboard:"Panel",verification:"Perfil verificado",hero:"¿Y si encontraras a la persona adecuada jugando?",heroCta:"Dar el primer paso",intro:"Un acertijo para romper el hielo. Un juego para conocerse. Una conversación para ver si vuestros caminos pueden unirse."},
 it:{login:"Accedi",signup:"Crea un account",discover:"Scopri",play:"Gioca",dashboard:"Dashboard",verification:"Profilo verificato",hero:"E se incontrassi la persona giusta giocando?",heroCta:"Fai il primo passo",intro:"Un indovinello per rompere il ghiaccio. Un gioco per conoscersi. Una conversazione per capire se i vostri percorsi possono incontrarsi."}
} satisfies Record<SupportedLocale,Record<string,string>>;
export function normalizeLocale(value?:string|null):SupportedLocale { const short=(value??"fr").toLowerCase().split(/[-_]/)[0]; return supportedLocales.includes(short as SupportedLocale)?short as SupportedLocale:"fr"; }
