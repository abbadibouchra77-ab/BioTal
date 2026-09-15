# Instructions permanentes — Agent technique BioTal

## Lecture obligatoire en début de session

**Avant de faire quoi que ce soit**, lire le fichier `SYNC.md` sur Google Drive.

Rechercher via l'outil de recherche Google Drive : `title = 'SYNC.md'`. C'est la méthode
autoritaire — **ne pas se fier à un ID mémorisé d'une session précédente**, car ce fichier est
recréé (pas modifié en place) à chaque rapport, donc son ID change à chaque fois (voir
« Comment rapporter » ci-dessous). S'il y a plusieurs résultats, lire le plus récent
(`createdTime`) et trasher les autres au passage.

Ce fichier contient le dernier état du projet, les bugs techniques en cours et les points en
attente pour Cowork. Il fait office de mémoire de session à session.

## Mon périmètre

Mes tâches se limitent strictement au **développement technique et à la sécurité** du thème
Shopify BioTal (ce dépôt). Je ne décide jamais de contenu produit, de textes marketing/légaux
définitifs, de visuels, de choix business ou de configuration boutique (domaine, taxes, moyens
de paiement, apps tierces) — ces sujets sont du ressort de Cowork/de l'humain, et je les
signale dans `SYNC.md` plutôt que de les traiter moi-même.

## Comment rapporter

À la fin de chaque session de travail (et systématiquement lors du contrôle technique
quotidien automatisé) :

1. Rechercher le(s) fichier(s) Drive `title = 'SYNC.md'` existant(s) (pour connaître leur ID à
   trasher ensuite).
2. Créer un **nouveau** fichier Drive via `mcp__Google_Drive__create_file` (title: "SYNC.md",
   contentMimeType: "text/markdown", disableConversionToGoogleType: true) avec le rapport à
   jour. **Important** : `mcp__Google_Drive__update_file` ne modifie que le titre/dossier d'un
   fichier, jamais son contenu — il est donc impossible d'écraser SYNC.md en place. Le seul
   moyen de « mettre à jour » ce fichier est de recréer + trasher l'ancien.
3. Une fois le nouveau fichier créé avec succès, trasher tous les anciens fichiers "SYNC.md"
   trouvés à l'étape 1 via `mcp__Google_Drive__trash_file` — un seul doit subsister au final,
   jamais de doublon.
4. Le rapport doit toujours inclure : un résumé de ce qui a été fait/vérifié, les bugs trouvés
   et corrigés, et une section « Notifications pour Cowork » listant tout ce qui nécessite une
   décision ou une action non-technique.
5. Committer et pousser sur `claude/biotal-shopify-theme-ckruir` avec des messages de commit
   clairs et atomiques.

## Contrôle technique quotidien

Un Routine planifié (`Claude_Code_Remote`, id `trig_01QtJG5wuAqydSfvC71GH4P4`, tous les jours à
07:13 UTC) exécute : `shopify theme check`, vérification d'intégrité (JSON, assets/snippets/
sections référencés), correction des bugs techniques trouvés, puis republication de `SYNC.md`
(create + trash) comme décrit ci-dessus.

**Contrainte de plateforme (pas de mon fait)** : ce Routine est volontairement lié à *cette
session persistante* (`session_01SFPFAdPjzepXstW9fn3XcU`) plutôt qu'à une session neuve à
chaque déclenchement, car l'organisation ne permet pas de transmettre le connecteur Google
Drive à une session neuve créée par un Routine. Une session neuve n'aurait donc pas eu accès à
Drive pour lire/écrire `SYNC.md`. En restant lié à cette session déjà connectée à Drive, GitHub
et Shopify, le Routine garde l'accès nécessaire — au prix de faire grossir cette même
conversation chaque jour. Si cette conversation venait à être supprimée/inaccessible, recréer
le Routine depuis une session qui tient les connecteurs Drive nécessaires, ou demander à
l'utilisateur de le faire depuis l'UI Routines de claude.ai.
