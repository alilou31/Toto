"use client";

import { GameChallenges } from "@/app/components/game-challenges";
import { GameShell, PageHeading } from "@/app/components/game-shell";

export default function DefisPage() {
  return (
    <GameShell active="/cockpit/defis">
      <PageHeading
        eyebrow="VOS CONNEXIONS EN MOUVEMENT"
        title={<>Les défis qui vous <em>rapprochent.</em></>}
        description="Invitez une personne, jouez chacun votre tour et retrouvez ici les parties en attente ou terminées."
      />
      <GameChallenges />
    </GameShell>
  );
}
