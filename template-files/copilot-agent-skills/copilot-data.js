// copilot-data.js — Données de la présentation GitHub Copilot : Agents & Skills
// Modifier ce fichier pour mettre à jour le contenu sans toucher au moteur HTML.

const PRESENTATION_DATA = {

  meta: {
    title: "GitHub Copilot — Personnaliser son assistant",
    subtitle: "Skills, agents, hooks et plugins",
    date: "Septembre 2026",
    audience: "Équipe de développeurs — première approche"
  },

  // Sections affichées dans la barre de progression bas de page
  sections: [
    { id: "intro",      label: "Intro",              slides: [0, 1, 2] },
    { id: "skills",     label: "01 · Skills",        slides: [3, 4, 5] },
    { id: "agents",     label: "02 · Agents",        slides: [6, 7, 8, 9] },
    { id: "sharing",    label: "03 · Partage",       slides: [10, 11, 12] },
    { id: "extend",     label: "04 · Aller + loin",  slides: [13, 14, 15, 16] },
    { id: "discussion", label: "Discussion",         slides: [17] }
  ],

  // ─────────────────────────────────────────────────────────────────────────────
  // SLIDES — chaque slide a : id, type, sectionId, title, steps[]
  //
  // Types de slide : title | section | agenda | content | twocol | grid | token | table | discussion
  //
  // Types de step :
  //   definition       { text }
  //   rule             { text }
  //   chips            { label?, items[] }
  //   field            { name, badge, desc, sub? }
  //   file             { name, badge, desc }
  //   field-group      { label, fields[{name,desc}] }
  //   location         { scope, path, pros[] }
  //   location-group   { label, items[{path,scope}] }
  //   two-col          { left:{label,tagline,items[]}, right:{label,tagline,items[]} }
  //   comparison-col   { label, tagline, items[] }
  //   token-row        { label, context, behavior, impactLevel, impact }
  //   flow             { items[{label, note?, accent?}] }
  //   best-practice    { icon, text }
  //   strategy         { rank, title, desc, pros[], cons[] }
  //   distribution     { rank, title, desc }
  //   code             { lang, label?, content }
  //   bullet           { text }
  //   agenda-item      { num, text }
  // ─────────────────────────────────────────────────────────────────────────────

  slides: [

    // ── 00 · Titre ─────────────────────────────────────────────────────
    {
      id: "s00", type: "title", sectionId: "intro",
      title: "GitHub Copilot",
      accent: "Le personnaliser",
      tagline: "Skills, agents, hooks et plugins — comment lui apprendre notre façon de travailler",
      meta: "Septembre 2026 · Équipe développeurs",
      steps: []
    },

    // ── 01 · Agenda ────────────────────────────────────────────────────
    {
      id: "s01", type: "agenda", sectionId: "intro",
      title: "Au programme",
      steps: [
        { type: "agenda-item", num: "01", text: "Les <strong>skills</strong> — apprendre une tâche à Copilot" },
        { type: "agenda-item", num: "02", text: "Les <strong>agents</strong> — lui déléguer un rôle" },
        { type: "agenda-item", num: "03", text: "Partager tout ça avec l'équipe" },
        { type: "agenda-item", num: "04", text: "Aller plus loin : <strong>hooks</strong>, <strong>plugins</strong>, <strong>marketplace</strong>" }
      ]
    },

    // ── 02 · Vue d'ensemble ────────────────────────────────────────────
    {
      id: "s02", type: "token", sectionId: "intro",
      title: "Le vocabulaire, en une slide",
      context: "Quatre façons de donner du contexte à Copilot — plus une pour les empaqueter",
      columns: ["Brique", "Où ça vit", "À quoi ça sert", "Coût en tokens"],
      steps: [
        { type: "token-row", label: "Instructions", context: "copilot-instructions.md",
          behavior: "Le contexte permanent du projet : stack, conventions, règles. Injecté à <strong>chaque</strong> message.",
          impactLevel: "high", impact: "Élevé" },
        { type: "token-row", label: "Skill", context: ".github/skills/&lt;nom&gt;/",
          behavior: "Le mode d'emploi d'<strong>une tâche</strong> précise et répétable. Chargé seulement quand il sert.",
          impactLevel: "low", impact: "Faible" },
        { type: "token-row", label: "Agent", context: ".github/agents/*.agent.md",
          behavior: "Un <strong>rôle délégué</strong> : Copilot raisonne, choisit ses outils et enchaîne les actions.",
          impactLevel: "medium", impact: "Moyen" },
        { type: "token-row", label: "Hook", context: ".github/hooks/*.json",
          behavior: "Du code déclenché <strong>automatiquement</strong> à un moment clé. Ne passe pas par le modèle.",
          impactLevel: "zero", impact: "Zéro" },
        { type: "token-row", label: "Plugin", context: "plugin.json",
          behavior: "Le <strong>paquet</strong> qui regroupe skills, agents et hooks pour les installer d'un coup.",
          impactLevel: "zero", impact: "Conteneur" }
      ]
    },

    // ══════════════════════════════════════════════════════════════════
    // ── 03 · Section 01 ────────────────────────────────────────────────
    {
      id: "s03", type: "section", sectionId: "skills",
      num: "01", title: "Les skills",
      items: ["Apprendre une tâche à Copilot", "Anatomie d'un skill", "Le chargement à la demande"],
      steps: []
    },

    // ── 04 · Qu'est-ce qu'un skill ? ───────────────────────────────────
    {
      id: "s04", type: "content", sectionId: "skills",
      title: "Qu'est-ce qu'un skill ?",
      steps: [
        {
          type: "definition",
          text: "Un skill est un <em>mode d'emploi</em> écrit une fois pour toutes. Il décrit <strong>une tâche précise et répétable</strong> — telle que notre équipe la fait. Copilot l'applique ensuite à l'identique, sans qu'on ait à réexpliquer."
        },
        {
          type: "chips",
          label: "Exemples",
          items: ["Générer un ADR", "Rédiger un changelog", "Écrire un test selon nos conventions", "Ouvrir une PR au bon format"]
        },
        {
          type: "rule",
          text: "Copilot ne lit d'abord que le <code>name</code> et la <code>description</code>. Le reste n'est chargé <strong>que si le skill est pertinent</strong> — d'où un catalogue de cinquante skills qui ne coûte presque rien."
        },
        {
          type: "bullet",
          text: "Déclenchement : automatique quand la description correspond à la demande, ou en le nommant explicitement."
        }
      ]
    },

    // ── 05 · Anatomie d'un skill ───────────────────────────────────────
    {
      id: "s05", type: "content", sectionId: "skills",
      title: "Anatomie d'un skill",
      context: "Un dossier, un seul fichier obligatoire : les métadonnées en tête, les instructions en dessous",
      steps: [
        {
          type: "code", lang: "yaml", label: ".github/skills/generate-adr/SKILL.md",
          content: "---\nname: generate-adr\ndescription: Génère un Architecture Decision Record à partir d'une décision technique\n---\n\n## Instructions\n\nQuand l'utilisateur décrit une décision d'architecture, produis un ADR suivant\nle modèle de templates/adr-template.md — sections Contexte, Décision, Conséquences.\nNomme le fichier docs/adr/AAAA-MM-JJ-<sujet-en-kebab-case>.md"
        },
        {
          type: "field-group", label: "Sous-dossiers optionnels, à côté du SKILL.md — lus seulement si la tâche l'exige",
          fields: [
            { name: "templates/",  desc: "Modèles de fichiers que Copilot remplit (template d'ADR, de test…)" },
            { name: "references/", desc: "Documentation à consulter : conventions, glossaire métier, specs" },
            { name: "scripts/",    desc: "Scripts exécutables quand la tâche demande de l'automatisation réelle" }
          ]
        }
      ]
    },

    // ══════════════════════════════════════════════════════════════════
    // ── 06 · Section 02 ────────────────────────────────────────────────
    {
      id: "s06", type: "section", sectionId: "agents",
      num: "02", title: "Les agents",
      items: ["Déléguer un rôle, pas une tâche", "Anatomie d'un agent", "Skill ou agent : comment choisir"],
      steps: []
    },

    // ── 07 · Qu'est-ce qu'un agent ? ───────────────────────────────────
    {
      id: "s07", type: "content", sectionId: "agents",
      title: "Qu'est-ce qu'un agent ?",
      steps: [
        {
          type: "definition",
          text: "Un agent est un <em>collègue virtuel spécialisé</em>. On lui confie un rôle et on limite les outils auxquels il a droit — puis il <strong>raisonne, décide et enchaîne les actions</strong> jusqu'à l'objectif."
        },
        {
          type: "chips",
          label: "Exemples de rôles",
          items: ["Relecteur sécurité", "Planificateur", "Rédacteur de documentation", "Assistant de migration"]
        },
        {
          type: "rule",
          text: "Invocation : <code>/agent</code> dans le CLI, <code>copilot --agent &lt;nom&gt;</code> en ligne de commande — ou <strong>automatiquement</strong>, quand Copilot juge sa <code>description</code> pertinente."
        },
        {
          type: "bullet",
          text: "La différence tient en une phrase : un skill sait <strong>comment</strong> faire, un agent cherche <strong>quoi</strong> faire."
        }
      ]
    },

    // ── 08 · Anatomie d'un agent ───────────────────────────────────────
    {
      id: "s08", type: "content", sectionId: "agents",
      title: "Anatomie d'un agent",
      context: "Un seul fichier : <nom>.agent.md",
      steps: [
        {
          type: "field-group", label: "Métadonnées YAML",
          fields: [
            { name: "description", desc: "REQUIS — ce qu'il fait : c'est ce qui décide si Copilot l'invoque seul" },
            { name: "name",        desc: "Nom affiché ; à défaut, c'est le nom du fichier qui sert d'identifiant" },
            { name: "tools",       desc: "Les outils auxquels il a droit — non renseigné, il les a tous" }
          ]
        },
        {
          type: "code", lang: "yaml", label: ".github/agents/security-reviewer.agent.md",
          content: "---\nname: security-reviewer\ndescription: Analyse le code pour détecter les vulnérabilités. Ne modifie jamais de fichier.\ntools: view, grep, glob\n---\n\nTu es un expert en sécurité applicative : OWASP Top 10, injections, secrets exposés.\nTu produis un rapport — sévérité, localisation, recommandation — sans jamais corriger toi-même."
        },
        {
          type: "rule",
          text: "Aucun outil d'écriture n'est listé : l'agent est <strong>structurellement incapable</strong> de modifier un fichier."
        }
      ]
    },

    // ── 09 · Skill ou agent ? ──────────────────────────────────────────
    {
      id: "s09", type: "table", sectionId: "agents",
      title: "Skill ou agent ?",
      context: "La dernière ligne suffit à trancher dans 90 % des cas",
      columns: ["", "Skill", "Agent"],
      steps: [
        { type: "table-row", cells: ["Ce que c'est",  "Le mode d'emploi d'une tâche",     "Un rôle avec un objectif"] },
        { type: "table-row", cells: ["Autonomie",     "Aucune — il applique",             "Forte — il décide et enchaîne"] },
        { type: "table-row", cells: ["Résultat",      "Reproductible à l'identique",      "Variable selon le raisonnement"] },
        { type: "table-row", cells: ["Format",        "Un dossier + SKILL.md",            "Un fichier .agent.md"] },
        { type: "table-row", cells: ["Coût",          "Faible — chargé à la demande",     "Moyen — rôle chargé en entier"] },
        { type: "table-row", cells: ["À choisir si…", "La façon de faire est connue et fixe", "Le chemin est à trouver au cas par cas"] }
      ]
    },

    // ══════════════════════════════════════════════════════════════════
    // ── 10 · Section 03 ────────────────────────────────────────────────
    {
      id: "s10", type: "section", sectionId: "sharing",
      num: "03", title: "Partager avec l'équipe",
      items: ["Où ranger ses skills et agents", "Qui y a accès", "Bonnes pratiques"],
      steps: []
    },

    // ── 11 · Où ça vit ─────────────────────────────────────────────────
    {
      id: "s11", type: "content", sectionId: "sharing",
      title: "Où ça vit — et donc qui y a accès",
      steps: [
        {
          type: "location", scope: "Dans le projet",
          path: ".github/agents/ · .github/skills/",
          pros: ["Versionné avec le code", "Disponible dès le clone du repo", "Évolue en pull request, donc relu"]
        },
        {
          type: "location", scope: "Sur ma machine",
          path: "~/.copilot/agents/ · ~/.copilot/skills/",
          pros: ["Présent dans tous mes projets", "Aucune configuration par repo", "Idéal pour mes outils perso"]
        },
        {
          type: "location", scope: "Repo d'équipe",
          path: "mon-org/copilot-toolbox",
          pros: ["Un seul endroit pour toute l'équipe", "Pas de duplication entre projets", "Versionnable par releases"]
        },
        {
          type: "location-group",
          label: "Emplacements également reconnus — un skill écrit une fois sert aux deux assistants",
          items: [
            { path: ".claude/skills/<nom>/", scope: "Projet · Claude Code + Copilot" },
            { path: ".agents/skills/<nom>/", scope: "Projet · format neutre" }
          ]
        },
        {
          type: "rule",
          text: "En cas de doublon, la version <strong>personnelle</strong> prend le dessus sur celle du projet — on peut donc surcharger un outil d'équipe sans toucher au repo."
        }
      ]
    },

    // ── 12 · Bonnes pratiques ──────────────────────────────────────────
    {
      id: "s12", type: "content", sectionId: "sharing",
      title: "Bonnes pratiques",
      steps: [
        { type: "best-practice", icon: "✦", text: "Soigner la <strong>description</strong> avant tout le reste — c'est elle qui décide du déclenchement automatique" },
        { type: "best-practice", icon: "✦", text: "Nommer en <strong>verbe-objet, en kebab-case</strong> : <code>generate-adr</code>, <code>review-security</code>" },
        { type: "best-practice", icon: "✦", text: "<strong>Restreindre les outils</strong> au strict nécessaire — un agent sans outil d'écriture ne peut rien casser" },
        { type: "best-practice", icon: "✦", text: "Mettre des <strong>exemples concrets</strong> dans le fichier : c'est ce qui guide le mieux le comportement" },
        { type: "best-practice", icon: "✦", text: "Tester chez soi, puis promouvoir dans le repo d'équipe une fois le comportement stable" },
        { type: "best-practice", icon: "✦", text: "Commencer <strong>petit</strong> : un skill utile cette semaine vaut mieux qu'un agent parfait un jour" }
      ]
    },

    // ══════════════════════════════════════════════════════════════════
    // ── 13 · Section 04 ────────────────────────────────────────────────
    {
      id: "s13", type: "section", sectionId: "extend",
      num: "04", title: "Aller plus loin",
      items: ["Les hooks — automatiser sans le modèle", "Les plugins — tout empaqueter", "Distribution et marketplace"],
      steps: []
    },

    // ── 14 · Hooks ─────────────────────────────────────────────────────
    {
      id: "s14", type: "content", sectionId: "extend",
      title: "Les hooks",
      context: "Quand la règle doit s'appliquer à coup sûr, on ne la demande pas — on la branche",
      steps: [
        {
          type: "definition",
          text: "Un hook est un <strong>script déclenché automatiquement</strong> à un moment clé de la session. Il ne passe pas par le modèle : c'est du code, donc <em>déterministe, immédiat et gratuit en tokens</em>."
        },
        {
          type: "flow",
          items: [
            { label: "Début de session", note: "sessionStart" },
            { label: "Prompt envoyé",    note: "userPromptSubmitted", accent: true },
            { label: "Avant un outil",   note: "preToolUse",          accent: true },
            { label: "Après un outil",   note: "postToolUse",         accent: true },
            { label: "Fin de session",   note: "sessionEnd" }
          ]
        },
        { type: "bullet", text: "<code>preToolUse</code> peut répondre <em>allow</em>, <em>ask</em> ou <em>deny</em> — de quoi bloquer une commande destructrice <strong>avant</strong> qu'elle s'exécute" },
        { type: "bullet", text: "<code>postToolUse</code> pour lancer le formateur et le linter après chaque fichier modifié" },
        {
          type: "rule",
          text: "Déclarés en JSON dans <code>.github/hooks/</code> pour l'équipe, <code>~/.copilot/hooks/</code> pour soi. Règle de tri : si la consigne est <strong>toujours vraie</strong> et vérifiable par du code, c'est un hook — pas une instruction que le modèle pourrait oublier."
        }
      ]
    },

    // ── 15 · Plugins ───────────────────────────────────────────────────
    {
      id: "s15", type: "content", sectionId: "extend",
      title: "Les plugins",
      context: "Le format officiel pour distribuer tout ce qu'on vient de voir",
      steps: [
        {
          type: "definition",
          text: "Un plugin est un <em>paquet installable</em>. Il regroupe skills, agents, hooks et connexions à des outils externes en une seule unité — on l'installe d'une commande, on le met à jour comme une dépendance."
        },
        { type: "file", name: "plugin.json", badge: "REQUIS",    desc: "Le manifeste : nom, version, description et composants inclus" },
        { type: "file", name: "skills/",     badge: "Optionnel",  desc: "Les dossiers de skills, avec leur SKILL.md" },
        { type: "file", name: "agents/",     badge: "Optionnel",  desc: "Les fichiers .agent.md — les rôles personnalisés" },
        { type: "file", name: "hooks/",      badge: "Optionnel",  desc: "Les scripts branchés sur les événements de session" }
      ]
    },

    // ── 16 · Distribution & marketplace ────────────────────────────────
    {
      id: "s16", type: "grid", sectionId: "extend",
      title: "Distribution & marketplace",
      steps: [
        {
          type: "distribution", rank: "Le plus simple",
          title: "Dépôt Git ou dossier local",
          desc: "On installe depuis un dépôt GitHub, public ou privé — ou depuis un simple chemin local.",
          cmd: "copilot plugin install org/toolbox"
        },
        {
          type: "distribution", rank: "À l'échelle de l'équipe",
          title: "Marketplace",
          desc: "Un catalogue déclaré une fois, que chacun parcourt et installe à la demande. Deux sont fournis d'office : copilot-plugins et awesome-copilot.",
          cmd: "copilot plugin marketplace add org/repo"
        },
        {
          type: "distribution", rank: "Gouvernance",
          title: "Déploiement centralisé",
          desc: "Les administrateurs peuvent imposer un jeu de plugins à toute l'organisation — tout le monde travaille alors avec les mêmes règles, sans rien installer."
        }
      ]
    },

    // ── 17 · Discussion ────────────────────────────────────────────────
    {
      id: "s17", type: "discussion", sectionId: "discussion",
      title: "À nous de jouer",
      prompt: "Quelle tâche répétitive aimeriez-vous ne plus jamais réexpliquer ?",
      hints: [
        "Un skill qui génère nos ADR au bon format",
        "Un skill qui écrit les tests selon nos conventions",
        "Un agent qui relit la sécurité de nos PR",
        "Un hook qui lance le linter après chaque modification"
      ],
      steps: []
    }

  ] // end slides

}; // end PRESENTATION_DATA
