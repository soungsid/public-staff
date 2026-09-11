# Guide des hooks Copilot CLI — pour débuter

> Un hook, c'est un petit programme que Copilot CLI lance **tout seul**, à un moment précis.
> Ce guide explique le principe en deux pages, puis fait construire **deux hooks de A à Z** :
> un « bonjour » qui sert juste à voir la mécanique tourner, et un vrai, qui vérifie
> l'encodage d'un fichier à chaque fois que Copilot l'écrit ou le modifie.
>
> Aucune connaissance préalable des hooks n'est nécessaire. Il faut juste Python installé.

## Sommaire

- [1. Ce qu'est un hook](#1-ce-quest-un-hook)
- [2. Les moments de déclenchement](#2-les-moments-de-déclenchement)
- [3. Comment un hook parle avec Copilot](#3-comment-un-hook-parle-avec-copilot)
  - [3.1 Ce qu'il reçoit](#31-ce-quil-reçoit)
  - [3.2 Ce qu'il répond](#32-ce-quil-répond)
- [4. Où se déclare un hook](#4-où-se-déclare-un-hook)
- [5. Exemple 1 — le hook « bonjour »](#5-exemple-1--le-hook--bonjour-)
  - [5.1 Étape 1 — créer le dossier](#51-étape-1--créer-le-dossier)
  - [5.2 Étape 2 — écrire le script](#52-étape-2--écrire-le-script)
  - [5.3 Étape 3 — déclarer le hook](#53-étape-3--déclarer-le-hook)
  - [5.4 Étape 4 — relancer et vérifier](#54-étape-4--relancer-et-vérifier)
  - [5.5 Étape 5 — lire ce que Copilot envoie vraiment](#55-étape-5--lire-ce-que-copilot-envoie-vraiment)
- [6. Exemple 2 — vérifier l'encodage à chaque écriture](#6-exemple-2--vérifier-lencodage-à-chaque-écriture)
  - [6.1 Ce que le hook va faire](#61-ce-que-le-hook-va-faire)
  - [6.2 Étape 1 — trouver le nom exact de l'outil](#62-étape-1--trouver-le-nom-exact-de-loutil)
  - [6.3 Étape 2 — écrire le script](#63-étape-2--écrire-le-script)
  - [6.4 Étape 3 — tester le script hors de Copilot](#64-étape-3--tester-le-script-hors-de-copilot)
  - [6.5 Étape 4 — déclarer le hook](#65-étape-4--déclarer-le-hook)
  - [6.6 Étape 5 — vérifier en vrai](#66-étape-5--vérifier-en-vrai)
- [7. Les pièges classiques](#7-les-pièges-classiques)
- [8. Quand ça ne marche pas](#8-quand-ça-ne-marche-pas)

---

## 1. Ce qu'est un hook

Une consigne écrite dans un fichier Markdown (`copilot-instructions.md`), c'est une **intention** :
le modèle peut l'oublier. Un hook, c'est une **garantie** : c'est du code, il s'exécute à chaque
fois, sans dépendre de la bonne volonté du modèle.

Le mécanisme est toujours identique :

```
  Copilot atteint un moment              ton programme
  ┌──────────────────────┐    JSON    ┌──────────────────┐
  │ ex : « je vais       │ ─────────► │ entrée standard  │
  │ écrire un fichier »  │            │ ...ton code...   │
  │                      │ ◄───────── │ code de sortie   │
  └──────────────────────┘  réponse   └──────────────────┘
```

Trois usages qui justifient vraiment un hook :

| Usage | Exemple |
|---|---|
| **Interdire** une action avant qu'elle arrive | refuser un `git push` sur `main` |
| **Réagir** après une action | vérifier ou formater un fichier qui vient d'être écrit |
| **Ajouter du contexte** que le modèle n'a pas demandé | rappeler la branche courante à chaque prompt |

Ce qui ne justifie **pas** un hook : ce qu'une simple consigne suffit à obtenir. Chaque
déclenchement lance un processus, donc coûte du temps.

---

## 2. Les moments de déclenchement

Copilot CLI nomme ses événements en camelCase. Les six à connaître pour commencer :

| Événement | Quand il se déclenche |
|---|---|
| `sessionStart` | au démarrage d'une session |
| `userPromptSubmitted` | juste après que tu as appuyé sur Entrée, avant que le modèle voie ton texte |
| `preToolUse` | **avant** qu'un outil s'exécute — le seul endroit où on peut encore refuser |
| `postToolUse` | **après** qu'un outil s'est exécuté avec succès |
| `agentStop` | quand l'agent a fini de répondre et te rend le clavier |
| `sessionEnd` | à la fin de la session |

Il en existe d'autres (`preMcpToolCall`, `postToolUseFailure`, `preCompact`, `subagentStart`,
`subagentStop`, `errorOccurred`, `permissionRequest`, `notification`, `userPromptTransformed`),
mais les six ci-dessus couvrent la quasi-totalité des besoins.

Dans ce guide : l'exemple 1 utilise `userPromptSubmitted`, l'exemple 2 utilise `postToolUse`.

---

## 3. Comment un hook parle avec Copilot

### 3.1 Ce qu'il reçoit

Un objet JSON **sur l'entrée standard** (`stdin`). Les champs les plus courants :

| Champ | Contenu |
|---|---|
| `sessionId` | identifiant de la session |
| `cwd` | répertoire de travail |
| `hook_event_name` | nom de l'événement qui a déclenché le hook |
| `prompt` | le texte que tu viens de taper (sur `userPromptSubmitted`) |
| `toolName` | nom de l'outil concerné |
| `toolArgs` | arguments passés à l'outil (chemin du fichier, commande…) |
| `toolResult` | résultat de l'outil (sur `postToolUse`) |

> ⚠️ **Ne fais jamais confiance à une doc sur ce point, vérifie.** Les noms de champs et surtout
> les **noms d'outils** changent d'une version à l'autre. L'étape 5.5 de ce guide sert exactement
> à ça : voir de tes yeux ce que ton Copilot envoie.

### 3.2 Ce qu'il répond

Le plus simple, et ça suffit dans 95 % des cas : **le code de sortie**.

| Code de sortie | Effet |
|---|---|
| `0` | tout va bien, Copilot continue |
| `2` | **blocage / alerte**. Ce que le hook écrit sur `stderr` est transmis au modèle comme motif |
| autre | erreur, mais Copilot continue quand même |

Il existe aussi un canal JSON sur `stdout`, plus fin (`permissionDecision` valant `allow`, `deny`
ou `ask`), mais tu n'en as pas besoin pour démarrer.

---

## 4. Où se déclare un hook

Un hook se déclare dans un fichier JSON. Deux emplacements :

| Fichier | Portée |
|---|---|
| `~/.copilot/hooks/*.json` | **toutes** tes sessions, sur toutes tes machines locales |
| `<ton-repo>/.github/hooks/*.json` | ce dépôt uniquement, versionné avec l'équipe |

Dans ce guide on utilise le premier, `~/.copilot/hooks/`, parce que c'est le plus simple pour
tester : ça marche tout de suite, partout.

Le squelette d'un fichier de hook ressemble toujours à ça :

```json
{
  "version": 1,
  "hooks": {
    "nomDeLEvenement": [
      {
        "type": "command",
        "matcher": "quels outils sont concernés",
        "bash": "la commande à lancer sous bash",
        "powershell": "la commande à lancer sous PowerShell",
        "timeoutSec": 10
      }
    ]
  }
}
```

Champs utiles : `bash` / `powershell` / `command`, `cwd`, `env`, `timeoutSec` (30 s par défaut),
`matcher`. Pour tout couper d'un coup : `"disableAllHooks": true` dans tes réglages.

---

## 5. Exemple 1 — le hook « bonjour »

Objectif : le hook le plus bête possible, qui **affiche quelque chose à l'écran** à chaque fois
que tu envoies un message. Il ne sert à rien d'autre qu'à te prouver que la mécanique marche.
Compte cinq minutes.

### 5.1 Étape 1 — créer le dossier

```bash
mkdir -p ~/.copilot/hooks
```

Sous PowerShell :

```powershell
New-Item -ItemType Directory -Force ~/.copilot/hooks
```

### 5.2 Étape 2 — écrire le script

Crée le fichier `~/.copilot/hooks/bonjour.py` :

```python
# -*- coding: utf-8 -*-
"""Le hook le plus simple du monde : il dit bonjour, et c'est tout."""
import sys

# Code de sortie 2 = "j'ai quelque chose a signaler".
# Ce qui est ecrit sur stderr est transmis au modele, qui te le repetera.
sys.stderr.write("Bonjour ! Ce message vient de mon tout premier hook.\n")
sys.exit(2)
```

Deux choses à comprendre ici, et elles resserviront partout :

1. `sys.exit(2)` est le seul moyen **garanti** de faire remonter un message. Un simple `print()`
   part sur la sortie standard, qui n'est pas toujours affichée.
2. Le texte est écrit sur `stderr`, pas sur `stdout`. C'est la convention : `stderr` = message
   pour le modèle, `stdout` = réponse structurée.

### 5.3 Étape 3 — déclarer le hook

Crée le fichier `~/.copilot/hooks/bonjour.json` :

```json
{
  "version": 1,
  "hooks": {
    "userPromptSubmitted": [
      {
        "type": "command",
        "bash": "python ~/.copilot/hooks/bonjour.py",
        "powershell": "python \"$HOME/.copilot/hooks/bonjour.py\"",
        "timeoutSec": 10
      }
    ]
  }
}
```

> 💡 **Pourquoi deux lignes différentes ?** Sous bash, `~` est remplacé automatiquement par le
> chemin de ton dossier personnel. Sous PowerShell, ce n'est pas le cas quand on passe un
> argument à un programme externe — il faut écrire `$HOME`, que PowerShell, lui, remplace bien.
> Mettre les deux lignes rend le hook portable, Copilot choisit celle qui correspond à ton shell.

Note qu'il n'y a **pas** de `matcher` ici : `userPromptSubmitted` ne concerne aucun outil
particulier, donc il n'y a rien à filtrer.

### 5.4 Étape 4 — relancer et vérifier

Les hooks sont lus **au démarrage**. Ferme ta session Copilot et relance-la :

```bash
copilot
```

Tape n'importe quoi, par exemple `bonjour`. Le modèle devrait te répondre en mentionnant le
message du hook. Bravo : ton premier hook tourne.

### 5.5 Étape 5 — lire ce que Copilot envoie vraiment

Avant de passer au vrai hook, une étape qui t'évitera des heures de perplexité. Remplace le
contenu de `~/.copilot/hooks/bonjour.py` par ceci :

```python
# -*- coding: utf-8 -*-
"""Hook espion : note dans un fichier tout ce que Copilot lui envoie. Jetable."""
import datetime
import os
import pathlib
import sys

brut = sys.stdin.read()

journal = pathlib.Path(os.path.expanduser("~")) / "hook-espion.log"
with journal.open("a", encoding="utf-8") as f:
    f.write("--- %s ---\n%s\n" % (datetime.datetime.now().isoformat(timespec="seconds"), brut))

sys.exit(0)
```

Relance Copilot, envoie deux ou trois messages, puis ouvre `~/hook-espion.log`. Tu y verras le
JSON exact que ton Copilot envoie : **les vrais noms de champs**, avec tes vraies valeurs.

Garde ce script sous la main, tu vas t'en resservir tout de suite.

---

## 6. Exemple 2 — vérifier l'encodage à chaque écriture

### 6.1 Ce que le hook va faire

Le problème est banal et agaçant : un fichier finit avec un mauvais encodage, et on se retrouve
avec des `Ã©` à la place des `é`, ou un BOM invisible en tête de fichier qui casse un script.
Personne ne le remarque avant que ça pète.

Le hook qu'on construit se déclenche **après chaque écriture ou modification de fichier** par
Copilot, ouvre le fichier, et vérifie trois choses :

1. le contenu est bien de l'**UTF-8 valide** ;
2. il n'y a pas de **BOM** UTF-8 en tête (les trois octets `EF BB BF`) ;
3. il n'y a pas de **mojibake** — ces `Ã©`, `Ã¨`, `Â°` qui trahissent un texte UTF-8 relu comme
   du Latin-1.

Si un problème est détecté, le hook sort en code 2 et explique le problème. Le modèle le lit et
peut corriger immédiatement, dans le même tour.

### 6.2 Étape 1 — trouver le nom exact de l'outil

C'est l'étape que tout le monde saute, et c'est celle qui fait perdre le plus de temps. Le hook
doit se déclencher sur les outils d'écriture de fichier — mais **comment s'appellent-ils
exactement dans ta version de Copilot** ?

Reprends le hook espion de l'étape 5.5, mais branche-le sur `postToolUse` en remplaçant
`~/.copilot/hooks/bonjour.json` par :

```json
{
  "version": 1,
  "hooks": {
    "postToolUse": [
      {
        "type": "command",
        "matcher": "*",
        "bash": "python ~/.copilot/hooks/bonjour.py",
        "powershell": "python \"$HOME/.copilot/hooks/bonjour.py\"",
        "timeoutSec": 10
      }
    ]
  }
}
```

Relance Copilot, demande-lui de créer un petit fichier (« crée un fichier test.txt avec le mot
bonjour dedans »), puis ouvre `~/hook-espion.log`. Cherche :

- la valeur de **`toolName`** → c'est ce que tu mettras dans ton `matcher` ;
- dans **`toolArgs`**, la clé qui contient le **chemin du fichier** (`path`, `filePath`,
  `file_path`… ça dépend des versions).

Note les deux, tu en as besoin à l'étape suivante. Puis **supprime l'espion** : un `matcher` à
`"*"` lance un processus à chaque lecture, chaque recherche, chaque commande — c'est lourd.

### 6.3 Étape 2 — écrire le script

Crée `~/.copilot/hooks/verifier_encodage.py` :

```python
# -*- coding: utf-8 -*-
"""Verifie l'encodage d'un fichier qui vient d'etre ecrit par Copilot.

Branche sur postToolUse, avec un matcher sur les outils d'ecriture.
Sort en code 2 si un probleme est detecte : le message part vers le modele,
qui peut corriger tout de suite.
"""
import json
import os
import sys

# Extensions qu'on veut verifier. Le reste (images, binaires) est ignore.
EXTENSIONS = (".py", ".js", ".ts", ".tsx", ".json", ".md", ".txt",
              ".yml", ".yaml", ".html", ".css", ".java", ".sql")

# Sequences typiques d'un texte UTF-8 relu comme du Latin-1.
MOJIBAKE = ("Ã©", "Ã¨", "Ãª", "Ã ", "Ã§", "Ã´", "Ã»", "Ã®", "Â°", "Â«", "Â»", "�")

# Les differentes cles ou peut se cacher le chemin du fichier, selon la version.
# Ajoute la tienne ici si l'espion t'en a montre une autre.
CLES_CHEMIN = ("path", "filePath", "file_path", "absolutePath", "file")


def lire_entree():
    """Lit le JSON envoye par Copilot sur l'entree standard."""
    try:
        return json.loads(sys.stdin.read() or "{}")
    except ValueError:
        return {}


def chemin_du_fichier(charge):
    """Retrouve le chemin du fichier dans les arguments de l'outil."""
    args = charge.get("toolArgs") or charge.get("tool_input") or {}
    if isinstance(args, str):
        try:
            args = json.loads(args)
        except ValueError:
            return ""
    if not isinstance(args, dict):
        return ""
    for cle in CLES_CHEMIN:
        valeur = args.get(cle)
        if isinstance(valeur, str) and valeur:
            return valeur
    return ""


def problemes(chemin):
    """Renvoie la liste des problemes d'encodage trouves dans le fichier."""
    with open(chemin, "rb") as f:
        octets = f.read()

    trouves = []

    if octets.startswith(b"\xef\xbb\xbf"):
        trouves.append("le fichier commence par un BOM UTF-8 (octets EF BB BF)")
        octets = octets[3:]

    try:
        texte = octets.decode("utf-8")
    except UnicodeDecodeError as erreur:
        trouves.append("le fichier n'est pas de l'UTF-8 valide (%s)" % erreur)
        return trouves

    vus = [m for m in MOJIBAKE if m in texte]
    if vus:
        trouves.append(
            "caracteres mal encodes detectes : %s (texte UTF-8 relu comme du Latin-1)"
            % ", ".join(vus)
        )

    return trouves


def main():
    chemin = chemin_du_fichier(lire_entree())

    # Rien a verifier : on laisse passer sans bruit.
    if not chemin or not os.path.isfile(chemin):
        return 0
    if not chemin.lower().endswith(EXTENSIONS):
        return 0

    trouves = problemes(chemin)
    if not trouves:
        return 0

    sys.stderr.write("Probleme d'encodage dans %s :\n" % chemin)
    for probleme in trouves:
        sys.stderr.write("  - %s\n" % probleme)
    sys.stderr.write(
        "Corrige le fichier : reecris-le en UTF-8 sans BOM, "
        "avec les caracteres accentues corrects.\n"
    )
    return 2


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception:
        # Un hook qui plante ne doit JAMAIS casser la session.
        sys.exit(0)
```

Trois décisions dans ce script valent pour tous tes futurs hooks :

1. **Le hook ne casse jamais la session.** Le `try / except` final sort en `0`. Un bug dans ton
   hook ne doit pas rendre Copilot inutilisable.
2. **Il sort en `0` sans rien dire quand il n'a rien à faire.** Un hook bavard devient vite
   insupportable.
3. **Le message d'erreur dit quoi faire**, pas seulement ce qui ne va pas. Le modèle le lit :
   lui donner la marche à suivre évite qu'il retente la même chose.

> ⚠️ **Une limite connue, pour ne pas être surpris.** La détection du mojibake est une simple
> recherche de séquences de caractères. Un fichier qui parle *d'encodage* — ce guide lui-même,
> par exemple — contient légitimement des `Ã©`, et le hook les signalera. C'est un faux positif
> inoffensif : le hook alerte, il ne bloque pas l'écriture. Si le cas te dérange, ajoute les
> chemins concernés à une liste d'exclusion en tête du script.

### 6.4 Étape 3 — tester le script hors de Copilot

Un hook est un programme comme un autre : teste-le **avant** de le brancher. C'est bien plus
rapide que de relancer une session à chaque essai.

Fabrique un fichier volontairement cassé :

```bash
printf 'Caf\xc3\x83\xc2\xa9 et th\xc3\x83\xc2\xa9\n' > /tmp/casse.md
```

Puis envoie au script la même chose que ce que Copilot lui enverrait :

```bash
echo '{"toolArgs":{"path":"/tmp/casse.md"}}' | python ~/.copilot/hooks/verifier_encodage.py
echo "code de sortie = $?"
```

Attendu : le script signale des caractères mal encodés, et affiche `code de sortie = 2`.

Refais le test sur un fichier sain :

```bash
echo 'Café et thé' > /tmp/propre.md
echo '{"toolArgs":{"path":"/tmp/propre.md"}}' | python ~/.copilot/hooks/verifier_encodage.py
echo "code de sortie = $?"
```

Attendu : aucun message, et `code de sortie = 0`.

Tant que ces deux tests ne passent pas, inutile de brancher le hook.

### 6.5 Étape 4 — déclarer le hook

Crée `~/.copilot/hooks/verifier-encodage.json` :

```json
{
  "version": 1,
  "hooks": {
    "postToolUse": [
      {
        "type": "command",
        "matcher": "write|edit|create|str_replace",
        "bash": "python ~/.copilot/hooks/verifier_encodage.py",
        "powershell": "python \"$HOME/.copilot/hooks/verifier_encodage.py\"",
        "timeoutSec": 10
      }
    ]
  }
}
```

> ⚠️ **Le `matcher` est à ajuster** avec ce que l'espion de l'étape 6.2 t'a montré. La valeur
> ci-dessus est un point de départ raisonnable : elle attrape les noms d'outils contenant
> `write`, `edit`, `create` ou `str_replace`. Si ton `toolName` réel est différent, remplace-le
> par le tien. Le `matcher` est une expression régulière ; `|` signifie « ou ».

Et pense à supprimer le hook « bonjour » de l'exemple 1, sinon il continuera à te parler à
chaque message :

```bash
rm ~/.copilot/hooks/bonjour.json ~/.copilot/hooks/bonjour.py
```

### 6.6 Étape 5 — vérifier en vrai

Relance Copilot (les hooks sont lus au démarrage), puis demande-lui :

> crée un fichier `notes.md` avec la phrase « Café, thé et déjeuner »

Attendu : le fichier est créé, le hook tourne, ne trouve rien, et personne ne dit rien. C'est le
comportement normal — un bon hook est silencieux.

Pour voir le hook réagir, demande maintenant :

> ajoute un BOM UTF-8 au début de `notes.md`

Attendu : le hook détecte le BOM, le signale, et Copilot te propose de corriger.

---

## 7. Les pièges classiques

1. **Les hooks sont lus au démarrage.** Modifier un fichier JSON ne suffit pas : **relance ta
   session**. C'est la cause numéro un des « mon hook ne fait rien ».
2. **Un hook ne doit jamais faire échouer ce qu'il observe.** Attrape les exceptions, sors en
   `0`. Réserve le `2` à une décision volontaire.
3. **Un `matcher` trop large coûte cher.** `"*"` sur `postToolUse` lance un processus à chaque
   lecture et chaque recherche. Cible les outils qui t'intéressent.
4. **Le nom des champs n'est pas garanti.** Il change selon les versions. En cas de doute :
   ressors l'espion.
5. **Sur Windows, la console est en cp1252.** Si ton hook répond du JSON, écris-le en ASCII pur
   (`json.dumps(...)` **sans** `ensure_ascii=False`).
6. **N'écris pas dans les dossiers de configuration depuis un hook.** Pour journaliser, vise ton
   dossier personnel ou `%LOCALAPPDATA%`.
7. **Teste toujours hors du CLI d'abord.** Un `echo '{...}' | python ton_hook.py` te fait gagner
   un quart d'heure à chaque itération.

---

## 8. Quand ça ne marche pas

| Symptôme | Que faire |
|---|---|
| Le hook ne se déclenche pas du tout | as-tu relancé la session ? le JSON est-il valide ? |
| Il se déclenche mais ne fait rien | teste le script à la main avec un `echo '{...}' \| python ...` |
| Il lit un chemin vide | remets l'espion : le nom de la clé a changé, ajoute-la dans `CLES_CHEMIN` |
| Il se déclenche sur le mauvais outil | ton `matcher` ne correspond pas au `toolName` réel |
| Besoin de voir les journaux | `~/.copilot/logs/` |
| Tout désactiver d'un coup | `"disableAllHooks": true` dans tes réglages |

---

## Pour aller plus loin

La version complète de ce guide, qui couvre **Claude Code et Copilot CLI** en parallèle
(correspondance des événements, réponses JSON structurées, hooks de plugin, garde-fou de
branche git) : [guide-hooks-claude-copilot.md](./guide-hooks-claude-copilot.md).
