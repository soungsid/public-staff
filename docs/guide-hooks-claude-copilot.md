# Guide des hooks — Claude Code & Copilot CLI

> Objectif : comprendre ce qu'est un hook, quand il se déclenche, ce qu'il reçoit,
> ce qu'il peut répondre — puis construire de A à Z un hook court et réellement utile :
> **interdire un `git commit` ou un `git push` sur `main` / `master` / `develop`**.

## Sommaire

- [1. Ce qu'est un hook](#1-ce-quest-un-hook)
- [2. Les événements](#2-les-événements)
  - [2.1 Claude Code](#21-claude-code)
  - [2.2 Copilot CLI](#22-copilot-cli)
  - [2.3 Correspondance entre les deux](#23-correspondance-entre-les-deux)
- [3. Le contrat d'un hook](#3-le-contrat-dun-hook)
  - [3.1 Ce qu'il reçoit](#31-ce-quil-reçoit)
  - [3.2 Ce qu'il répond](#32-ce-quil-répond)
- [4. Où se déclare un hook](#4-où-se-déclare-un-hook)
  - [4.1 Claude Code](#41-claude-code)
  - [4.2 Copilot CLI](#42-copilot-cli)
- [5. Travaux pratiques : le garde-fou de branche](#5-travaux-pratiques--le-garde-fou-de-branche)
  - [5.1 Pourquoi celui-là](#51-pourquoi-celui-là)
  - [5.2 Étape 0 — le hook espion](#52-étape-0--le-hook-espion)
  - [5.3 Étape 1 — le script du garde-fou](#53-étape-1--le-script-du-garde-fou)
  - [5.4 Étape 2 — le brancher sur Claude Code](#54-étape-2--le-brancher-sur-claude-code)
  - [5.5 Étape 3 — le brancher sur Copilot CLI](#55-étape-3--le-brancher-sur-copilot-cli)
  - [5.6 Étape 4 — vérifier](#56-étape-4--vérifier)
  - [5.7 Variante : répondre en JSON](#57-variante--répondre-en-json)
- [6. Pièges et règles de survie](#6-pièges-et-règles-de-survie)
- [7. Débogage](#7-débogage)

---

## 1. Ce qu'est un hook

Un hook est un **programme externe que le CLI appelle lui-même, à un moment précis de la
boucle agentique**. Ce n'est pas une instruction dans un fichier Markdown que le modèle peut
choisir d'ignorer : c'est du code déterministe qui tourne à chaque fois.

Le mécanisme est toujours le même, quelle que soit la plateforme :

```
        événement                     ton programme
  ┌──────────────────┐   JSON   ┌────────────────────┐
  │ le CLI atteint   │ ───────► │  stdin             │
  │ un point de la   │          │  ...traitement...  │
  │ boucle           │ ◄─────── │  stdout + code de  │
  └──────────────────┘  réponse │  sortie            │
                                └────────────────────┘
```

Trois usages qui justifient vraiment un hook :

| Usage | Événement typique |
|---|---|
| **Interdire** une action dangereuse avant qu'elle ait lieu | avant un appel d'outil |
| **Réagir** automatiquement à une action (formater, lancer les tests) | après un appel d'outil |
| **Injecter du contexte** que le modèle n'a pas demandé mais devrait avoir | à la soumission d'un prompt, au démarrage |

Ce qui ne justifie **pas** un hook : ce qu'une consigne dans `CLAUDE.md` suffit à obtenir.
Un hook coûte un processus à chaque déclenchement — donc de la latence sur chaque appel d'outil
si le matcher est trop large.

---

## 2. Les événements

### 2.1 Claude Code

Les principaux, ceux qu'on utilise en pratique :

| Événement | Quand |
|---|---|
| `SessionStart` | démarrage, reprise (`--resume`), après un `/clear` ou un compactage |
| `UserPromptSubmit` | **oui : juste après que tu as appuyé sur Entrée**, avant que le modèle voie le prompt |
| `PreToolUse` | avant l'exécution d'un outil — le seul endroit où on peut encore refuser |
| `PostToolUse` | après l'exécution d'un outil, réussie |
| `PostToolUseFailure` | après un appel d'outil en échec |
| `Stop` | **quand l'agent a fini de répondre et va rendre la main** — fin de tour, pas fin de session |
| `SubagentStop` | idem pour un sous-agent |
| `PreCompact` | avant un compactage du contexte |
| `SessionEnd` | fin de session |
| `Notification` | le CLI affiche une notification (demande de permission, inactivité…) |

Il en existe beaucoup d'autres (`FileChanged`, `PreModelSwitch`, `TaskCompleted`,
`WorktreeCreate`…), mais les dix ci-dessus couvrent l'immense majorité des besoins.

**Les deux qui prêtent à confusion :**

- `UserPromptSubmit` — c'est bien la **capture du prompt fraîchement soumis par l'utilisateur**,
  avant tout traitement. Le hook peut le journaliser, y ajouter du contexte, ou **bloquer la
  soumission** (code de sortie 2). C'est le point d'entrée idéal pour observer ce que l'humain
  demande vraiment.

- `Stop` — **fin de tour de l'agent**, pas arrêt du programme. Il se déclenche chaque fois que
  Claude termine sa réponse et te redonne le clavier. C'est l'endroit pour un bilan de tour
  (« tu as modifié 4 fichiers, les tests n'ont pas tourné »). Particularité : si le hook renvoie
  le code 2, **il empêche l'arrêt** et la conversation continue — d'où le champ
  `stop_hook_active` dans la charge utile, qu'il faut tester pour ne pas boucler à l'infini.
  L'équivalent « la session se termine » est `SessionEnd`.

### 2.2 Copilot CLI

Même idée, autres noms (camelCase) :

`sessionStart`, `sessionEnd`, `userPromptSubmitted`, `userPromptTransformed`, `preToolUse`,
`preMcpToolCall`, `postToolUse`, `postToolUseFailure`, `preCompact`, `agentStop`,
`subagentStart`, `subagentStop`, `errorOccurred`, `permissionRequest`, `notification`.

### 2.3 Correspondance entre les deux

| Claude Code | Copilot CLI |
|---|---|
| `SessionStart` | `sessionStart` |
| `UserPromptSubmit` | `userPromptSubmitted` |
| `PreToolUse` | `preToolUse` |
| `PostToolUse` | `postToolUse` |
| `Stop` | `agentStop` |
| `SessionEnd` | `sessionEnd` |
| `PreCompact` | `preCompact` |

---

## 3. Le contrat d'un hook

### 3.1 Ce qu'il reçoit

Un objet JSON **sur l'entrée standard**. Attention, les deux plateformes n'emploient pas la
même convention de nommage — c'est la première cause de hook qui « ne fait rien » :

| | Claude Code (`snake_case`) | Copilot CLI (`camelCase`) |
|---|---|---|
| identifiant de session | `session_id` | `sessionId` |
| répertoire courant | `cwd` | `cwd` |
| nom de l'événement | `hook_event_name` | `hook_event_name` |
| texte du prompt | `prompt` | `prompt` |
| nom de l'outil | `tool_name` | `toolName` |
| arguments de l'outil | `tool_input` | `toolArgs` |
| résultat de l'outil | `tool_response` | `toolResult` |

> **Ne fais jamais confiance à la documentation sur ce point : vérifie.** Le champ réel est
> celui que le binaire envoie. L'étape 0 du TP existe précisément pour ça.

### 3.2 Ce qu'il répond

Deux canaux, et le plus simple suffit presque toujours.

**Canal 1 — le code de sortie.** Universel, identique sur les deux plateformes :

| Code | Effet |
|---|---|
| `0` | tout va bien, on continue |
| `2` | **blocage**. L'action est refusée et ce qui est écrit sur `stderr` est transmis au modèle comme motif |
| autre | erreur non bloquante, l'action se poursuit |

**Canal 2 — du JSON sur `stdout`.** Plus fin, mais la forme diffère (voir §5.7). Sur Claude Code,
la sortie standard d'un hook `UserPromptSubmit` ou `SessionStart` est **injectée telle quelle dans
le contexte du modèle**, même en texte brut — c'est le moyen le plus court d'ajouter du contexte.

---

## 4. Où se déclare un hook

### 4.1 Claude Code

| Fichier | Portée |
|---|---|
| `~/.claude/settings.json` | tous tes projets |
| `<projet>/.claude/settings.json` | ce projet, versionné avec l'équipe |
| `<projet>/.claude/settings.local.json` | ce projet, non versionné |
| `<plugin>/hooks/hooks.json` | quand le plugin est activé |

Structure — noter le **double niveau** (`matcher` puis tableau `hooks`) :

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash|PowerShell",
        "hooks": [
          {
            "type": "command",
            "command": "python \"${CLAUDE_PROJECT_DIR}/.claude/hooks/garde_branche.py\"",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

Le `matcher` porte sur le **nom de l'outil** pour les événements d'outil : `Bash`, `Edit|Write`,
`mcp__.*`. Une chaîne qui contient autre chose que des lettres, chiffres, `_`, `-`, `|` ou `,`
est traitée comme une expression régulière. Absent ou `"*"` : tout.

Variables disponibles dans `command` : `${CLAUDE_PROJECT_DIR}`, `${CLAUDE_PLUGIN_ROOT}`,
`${CLAUDE_PLUGIN_DATA}`.

### 4.2 Copilot CLI

| Fichier | Portée |
|---|---|
| `<repo>/.github/hooks/*.json` | ce dépôt, versionné |
| `~/.copilot/hooks/*.json` | toutes tes sessions |
| clé `hooks` dans `~/.copilot/config.json` ou `.github/copilot/settings.json` | en ligne, même schéma |

Structure — **un seul niveau**, le `matcher` est dans l'entrée elle-même :

```json
{
  "version": 1,
  "hooks": {
    "preToolUse": [
      {
        "type": "command",
        "matcher": "bash|shell|powershell",
        "bash": "python .github/hooks/garde_branche.py",
        "powershell": "python .github/hooks/garde_branche.py",
        "cwd": ".",
        "timeoutSec": 10
      }
    ]
  }
}
```

Champs utiles : `bash` / `powershell` / `command`, `cwd`, `env`, `timeoutSec` (30 s par défaut),
`matcher`. Le coupe-circuit global est `"disableAllHooks": true` dans les réglages.

---

## 5. Travaux pratiques : le garde-fou de branche

### 5.1 Pourquoi celui-là

Parce que c'est une règle qu'on écrit dans tous les `CLAUDE.md` du monde — « ne jamais commiter
directement sur `main` ou `develop` » — et qu'un modèle finit toujours par l'oublier un mardi
soir. Une consigne en Markdown est une intention ; un hook `PreToolUse` est une garantie.

Il est aussi idéal pédagogiquement : court, sans dépendance, il lit la charge utile, prend une
décision, et bloque. On y touche tous les mécanismes.

### 5.2 Étape 0 — le hook espion

**Ne commence jamais par le vrai hook.** Commence par voir ce que le CLI t'envoie réellement.

`~/.claude/hooks/espion.py` :

```python
# -*- coding: utf-8 -*-
"""Journalise brute la charge utile de n'importe quel hook. Jetable."""
import datetime
import json
import os
import pathlib
import sys

brut = sys.stdin.read()
journal = pathlib.Path(os.path.expanduser("~")) / "hook-espion.jsonl"
with journal.open("a", encoding="utf-8") as f:
    f.write(json.dumps({
        "quand": datetime.datetime.now().isoformat(timespec="seconds"),
        "argv": sys.argv[1:],
        "brut": brut,
    }, ensure_ascii=False) + "\n")
sys.exit(0)
```

Branche-le sur l'événement qui t'intéresse, dans `~/.claude/settings.json` :

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "*",
        "hooks": [
          { "type": "command", "command": "python \"C:/Users/<toi>/.claude/hooks/espion.py\"" }
        ]
      }
    ]
  }
}
```

Relance le CLI, fais deux ou trois actions, puis lis `~/hook-espion.jsonl`. Tu as maintenant les
**vrais** noms de champs et les **vrais** noms d'outils pour écrire ton matcher. Retire l'espion
ensuite : un hook sur `*` ralentit chaque appel d'outil.

### 5.3 Étape 1 — le script du garde-fou

`<projet>/.claude/hooks/garde_branche.py` — le même fichier servira aux deux CLI :

```python
# -*- coding: utf-8 -*-
"""Refuse un commit ou un push direct sur une branche protegee.

Branche sur PreToolUse (Claude Code) / preToolUse (Copilot CLI), avec un matcher
sur les outils shell. Repond par le code de sortie 2 : c'est le seul canal
identique sur les deux plateformes.
"""
import json
import os
import re
import subprocess
import sys

BRANCHES_PROTEGEES = ("main", "master", "develop")

# Bornee volontairement : on cherche `git ... commit` ou `git ... push` en tete
# d'un segment de commande, pour ne pas se faire avoir par un `echo "git push"`
# tout en attrapant l'enchainement `cd x && git push`.
_ECRITURE_GIT = re.compile(r"(?:^|[;&|]\s*)\s*git\b[^;&|]*\b(?:commit|push)\b")


def charge_utile():
    try:
        return json.loads(sys.stdin.read() or "{}")
    except ValueError:
        return {}


def commande(charge):
    """Le champ change de nom selon le CLI : tool_input ou toolArgs."""
    entree = charge.get("tool_input") or charge.get("toolArgs") or {}
    if isinstance(entree, str):
        try:
            entree = json.loads(entree)
        except ValueError:
            return entree
    if not isinstance(entree, dict):
        return ""
    for cle in ("command", "cmd", "script"):
        valeur = entree.get(cle)
        if isinstance(valeur, str):
            return valeur
    return ""


def branche_courante(cwd):
    try:
        sortie = subprocess.run(
            ["git", "-C", cwd or os.getcwd(), "rev-parse", "--abbrev-ref", "HEAD"],
            capture_output=True, text=True, timeout=3,
        )
    except Exception:
        return None
    return sortie.stdout.strip() if sortie.returncode == 0 else None


def main():
    charge = charge_utile()
    if not _ECRITURE_GIT.search(commande(charge)):
        return 0
    branche = branche_courante(charge.get("cwd"))
    if branche not in BRANCHES_PROTEGEES:
        return 0
    sys.stderr.write(
        "Branche protegee : %s.\n"
        "Regle du projet : jamais de commit ni de push direct sur %s.\n"
        "Marche a suivre : git checkout -b SCRUM-XX_description, commiter sur la "
        "branche, pousser, puis gh pr create --base develop --fill.\n"
        % (branche, ", ".join(BRANCHES_PROTEGEES))
    )
    return 2


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception:
        sys.exit(0)     # un garde-fou qui casse la session est pire que pas de garde-fou
```

Trois choix à retenir, ils valent pour tous tes hooks :

1. **Le hook ne casse jamais la session.** L'exception finale renvoie `0`. Un bug dans ton hook
   ne doit pas rendre le CLI inutilisable.
2. **Il lit les deux conventions de nommage** (`tool_input` et `toolArgs`), donc un seul fichier
   pour les deux CLI.
3. **Le motif du refus est actionnable.** Le modèle lit `stderr` : lui dire quoi faire à la place
   évite qu'il retente la même commande.

### 5.4 Étape 2 — le brancher sur Claude Code

Dans `<projet>/.claude/settings.json` (versionné : toute l'équipe en bénéficie) :

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash|PowerShell",
        "hooks": [
          {
            "type": "command",
            "command": "python \"${CLAUDE_PROJECT_DIR}/.claude/hooks/garde_branche.py\"",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

Redémarre la session : les hooks sont lus au démarrage.

### 5.5 Étape 3 — le brancher sur Copilot CLI

Copie le script dans `<repo>/.github/hooks/garde_branche.py`, puis crée
`<repo>/.github/hooks/garde-branche.json` :

```json
{
  "version": 1,
  "hooks": {
    "preToolUse": [
      {
        "type": "command",
        "matcher": "bash|shell|powershell",
        "bash": "python .github/hooks/garde_branche.py",
        "powershell": "python .github/hooks/garde_branche.py",
        "timeoutSec": 10
      }
    ]
  }
}
```

Le `matcher` est à confirmer avec l'espion de l'étape 0 : le nom exact de l'outil shell dépend
de la version du CLI.

### 5.6 Étape 4 — vérifier

```bash
git checkout main
# puis, dans la session :  « commite ce fichier »
```

Attendu : l'appel d'outil est refusé, et l'agent te répond en te proposant de créer une branche.

```bash
git checkout -b test_hook
# puis :  « commite ce fichier »
```

Attendu : ça passe normalement.

### 5.7 Variante : répondre en JSON

Le code de sortie 2 suffit, mais si tu veux un motif structuré, la forme diffère.

**Claude Code** — imbriqué dans `hookSpecificOutput` :

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Branche protegee : main."
  }
}
```

`permissionDecision` vaut `allow`, `deny` ou `skip`. Le même canal permet aussi de **réécrire**
l'appel d'outil (`updatedInput`) plutôt que de le refuser.

**Copilot CLI** — à la racine :

```json
{
  "permissionDecision": "deny",
  "permissionDecisionReason": "Branche protegee : main."
}
```

`permissionDecision` vaut `allow`, `deny` ou `ask`.

Si tu tiens à un seul script pour les deux, passe la plateforme en argument
(`python garde_branche.py claude` / `... copilot`) et choisis la forme à l'écriture — c'est plus
lisible qu'un JSON qui essaie de satisfaire les deux schémas.

---

## 6. Pièges et règles de survie

1. **N'écris pas dans `~/.claude` depuis un hook.** Le garde-fou des chemins sensibles de Claude
   Code y bloque l'écriture. Un hook qui journalise doit viser `%LOCALAPPDATA%` sur Windows ou
   `~/.local/share` ailleurs.
2. **Un hook ne doit jamais faire échouer ce qu'il observe.** Avale les exceptions, sors en `0`.
   Réserve le `2` à une décision voulue.
3. **Un matcher trop large coûte cher.** `"*"` sur `PreToolUse` lance un processus à chaque
   `Read` et chaque `Grep`. Cible les outils qui t'intéressent.
4. **Attention à la boucle sur `Stop`.** Bloquer un `Stop` relance le modèle, qui finira par
   émettre un nouveau `Stop`. Teste `stop_hook_active` dans la charge utile et abandonne s'il
   est vrai.
5. **Sur Windows, la sortie traverse une console cp1252.** Écris ton JSON en ASCII pur
   (`json.dumps(...)` sans `ensure_ascii=False`) pour les réponses destinées au CLI.
6. **Les hooks sont chargés au démarrage.** Modifier un fichier de réglages ne suffit pas :
   relance la session.
7. **Un hook de plugin vit dans le cache.** Éditer la source dans le dépôt ne met pas à jour le
   hook actif : il faut réinstaller le plugin.
8. **Un prompt n'est pas toujours humain.** Sur `UserPromptSubmit`, la charge utile porte un
   champ `source` : réveil de tâche planifiée, injection SDK, boucle. Filtre-le si tu comptes
   des interactions utilisateur.

---

## 7. Débogage

| Symptôme | Où regarder |
|---|---|
| Le hook ne se déclenche pas | `/hooks` dans Claude Code liste ce qui est réellement enregistré |
| Il se déclenche mais ne fait rien | `claude --debug` trace l'exécution et le code de sortie |
| Il lit un champ vide | remets l'espion de l'étape 0 : le nom du champ a changé |
| Côté Copilot | les journaux de session sont dans `~/.copilot/logs/` |
| Tout désactiver proprement | `"disableAllHooks": true` dans les réglages, des deux côtés |

Enfin : teste ton hook **hors du CLI**, c'est un programme comme un autre.

```bash
echo '{"cwd":"D:/workspace/mon-projet","tool_input":{"command":"git commit -m x"}}' \
  | python .claude/hooks/garde_branche.py; echo "code=$?"
```
