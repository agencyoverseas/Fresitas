#!/data/data/com.termux/files/usr/bin/bash
# ═══════════════════════════════════════════════════════════════
#  Fresitas — publier une mise a jour
#
#  A lancer depuis le dossier du projet :
#      bash maj.sh "ce que j'ai change"
#
#  Ce qui se passe ensuite, tout seul :
#    1. les fichiers partent sur GitHub
#    2. Vercel compile et met en ligne tout seul (1 a 3 minutes)
#    3. la banniere "Nouvelle version" s'affiche chez Fresita
#    4. elle touche "Mettre a jour" -> nouvelle version, donnees gardees
# ═══════════════════════════════════════════════════════════════
set -euo pipefail
cd "$(dirname "$0")"

vert(){ printf '\033[32m%s\033[0m\n' "$*"; }
rouge(){ printf '\033[31m%s\033[0m\n' "$*"; }

[ -d .git ] || { rouge "Pas un depot git. Lance ce script depuis le dossier du projet."; exit 1; }

MSG="${1:-Mise a jour $(date '+%d/%m/%Y %H:%M')}"

if [ -z "$(git status --porcelain)" ]; then
  vert "Rien n'a change, rien a publier."
  exit 0
fi

echo "Fichiers qui vont partir :"
git status --short
echo

git add -A
git -c user.name="${GIT_NOM:-Obrayan}" -c user.email="${GIT_MAIL:-hello@nexusai-agency.fr}" \
    commit -q -m "$MSG"
git push origin HEAD:main

echo
vert "Envoye."
echo "Suivi du deploiement : https://vercel.com/dashboard"
echo "L'app en ligne      : https://fresitas-five.vercel.app"
echo "Dans 1 a 3 minutes, la banniere apparaitra dans l'app."
echo
echo "Si tu t'es trompe :  git revert HEAD && git push origin HEAD:main"
