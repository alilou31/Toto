import { Eye, LockKeyhole } from "lucide-react";
import { GameShell, PageHeading } from "@/app/components/game-shell";
import VisitsList from "./visits-list";

export default function VisitesPage() {
  return (
    <GameShell active="/cockpit/visites">
      <PageHeading
        eyebrow="UN PREMIER SIGNE DE CURIOSITÉ"
        title={<>Les visites de votre <em>profil.</em></>}
        description="Retrouvez les membres qui ont consulté votre profil récemment. La présence est indiquée séparément et n'affiche pas l'heure exacte de connexion."
      />
      <VisitsList />
      <div className="game-privacy-inline">
        <LockKeyhole size={19} />
        <span><strong>Respect de la vie privée.</strong> Seuls les visiteurs dont le profil est visible et accessible apparaissent ici. Les visites sont mises à jour lors d'une nouvelle consultation.</span>
      </div>
    </GameShell>
  );
}
