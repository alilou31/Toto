import { History } from "lucide-react";
import { GameShell, PageHeading } from "@/app/components/game-shell";
import { GameHistory } from "@/app/components/game-history";
export default function HistoriquePage(){return <GameShell active="/cockpit/historique"><PageHeading eyebrow="CHAQUE PARTIE VOUS APPREND QUELQUE CHOSE" title={<>Votre chemin, <em>à votre rythme.</em></>} description="Retrouvez vos parties et les résultats enregistrés au fil de votre aventure."/><GameHistory/></GameShell>}
