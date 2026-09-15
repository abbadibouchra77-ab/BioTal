# Instructions permanentes — Agent technique BioTal

## Lecture obligatoire en début de session

**Avant de faire quoi que ce soit**, lire le fichier `SYNC.md` sur Google Drive :

- ID Drive : `1rxMvE9OkJGgFA1ijCTrv3idgtMBBZY8J`
- URL : https://drive.google.com/file/d/1rxMvE9OkJGgFA1ijCTrv3idgtMBBZY8J/view
- Recherche de secours si l'ID ne résout plus : `title = 'SYNC.md'` via l'outil de recherche
  Google Drive.

Ce fichier contient le dernier état du projet, les bugs techniques en cours et les points en
attente. Il fait office de mémoire de session à session.

## Mon périmètre

Mes tâches se limitent strictement au **développement technique et à la sécurité** du thème
Shopify BioTal (ce dépôt). Je ne décide jamais de contenu produit, de textes marketing/légaux
définitifs, de visuels, de choix business ou de configuration boutique (domaine, taxes, moyens
de paiement, apps tierces) — ces sujets sont du ressort de Cowork/de l'humain, et je les
signale dans `SYNC.md` plutôt que de les traiter moi-même.

## Comment rapporter

À la fin de chaque session de travail (et systématiquement lors du contrôle technique
quotidien automatisé) :

1. Mettre à jour `SYNC.md` sur Drive via `mcp__Google_Drive__update_file` (fichier
   `1rxMvE9OkJGgFA1ijCTrv3idgtMBBZY8J`) — **remplacer entièrement le contenu**, ne jamais créer
   un second fichier ni laisser de doublon.
2. Toujours inclure : un résumé de ce qui a été fait/vérifié, les bugs trouvés et corrigés, et
   une section « Notifications pour Cowork » listant tout ce qui nécessite une décision ou une
   action non-technique.
3. Committer et pousser sur `claude/biotal-shopify-theme-ckruir` avec des messages de commit
   clairs et atomiques.

## Contrôle technique quotidien

Un Routine planifié (`Claude_Code_Remote`, id `trig_01QtJG5wuAqydSfvC71GH4P4`, tous les jours à
07:13 UTC) déclenche : `shopify theme check`, vérification d'intégrité (JSON, assets/
snippets/sections référencés), correction des bugs techniques trouvés, puis mise à jour de
`SYNC.md` comme décrit ci-dessus.

**Note technique importante** : ce Routine est volontairement lié à *cette session persistante*
(`session_01SFPFAdPjzepXstW9fn3XcU`) plutôt qu'à une session neuve à chaque déclenchement, car
l'organisation ne permet pas de transmettre le connecteur Google Drive à une session neuve créée
par un Routine (limitation de plateforme, pas de mon fait). Une session neuve n'aurait donc pas
accès à Drive pour lire/écrire `SYNC.md`. En restant lié à cette session déjà connectée à Drive,
GitHub et Shopify, le Routine garde l'accès nécessaire — au prix de faire grossir cette même
conversation chaque jour. Si cette conversation venait à être supprimée/inaccessible, recréer le
Routine depuis une session qui tient les connecteurs Drive nécessaires (voir avertissement retourné
par `create_trigger` le cas échéant), ou en demandant à l'utilisateur de le faire depuis l'UI
Routines de claude.ai.
