// copilot-data.js — Données de la présentation GitHub Copilot : Agents & Skills
// Modifier ce fichier pour mettre à jour le contenu sans toucher au moteur HTML.

const PRESENTATION_DATA = {

  meta: {
    title: "GitHub Copilot — Agents & Skills",
    subtitle: "Personnaliser et partager son assistant IA",
    date: "Juin 2026",
    audience: "Équipe de développeurs"
  },

  // Sections affichées dans la barre de progression bas de page
  sections: [
    { id: "intro",      label: "Intro",             slides: [0, 1] },
    { id: "agents",     label: "01 · Agents",       slides: [2, 3, 4, 5, 6] },
    { id: "skills",     label: "02 · Skills",       slides: [7, 8, 9, 10, 11] },
    { id: "compare",    label: "03 · Comparaison",  slides: [12, 13, 14, 15] },
    { id: "sharing",    label: "04 · Partage",      slides: [16, 17, 18, 19] },
    { id: "plugins",    label: "05 · Plugins",      slides: [20, 21, 22] },
    { id: "discussion", label: "Discussion",        slides: [23] }
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
      accent: "Agents & Skills",
      tagline: "Personnaliser et partager son assistant IA",
      meta: "Juin 2026 · Équipe développeurs",
      steps: []
    },

    // ── 01 · Agenda ────────────────────────────────────────────────────
    {
      id: "s01", type: "agenda", sectionId: "intro",
      title: "Au programme",
      steps: [
        { type: "agenda-item", num: "01", text: "Anatomie d'un custom agent" },
        { type: "agenda-item", num: "02", text: "Anatomie d'un custom skill" },
        { type: "agenda-item", num: "03", text: "Skill vs Agent — Quelle différence ?" },
        { type: "agenda-item", num: "04", text: "Partager agents & skills en équipe" },
        { type: "agenda-item", num: "05", text: "Agent Plugins — Packager et distribuer" }
      ]
    },

    // ── 02 · Section 01 ────────────────────────────────────────────────
    {
      id: "s02", type: "section", sectionId: "agents",
      num: "01", title: "Anatomie d'un custom agent",
      items: ["Définition & invocation", "Structure du fichier .agent.md", "Où le placer ?"],
      steps: []
    },

    // ── 03 · Qu'est-ce qu'un agent ? ───────────────────────────────────
    {
      id: "s03", type: "content", sectionId: "agents",
      title: "Qu'est-ce qu'un agent ?",
      steps: [
        {
          type: "definition",
          text: "Un agent est une <em>persona spécialisée</em> confiée à Copilot. Il pense, planifie et exécute des tâches <strong>multi-étapes de façon autonome</strong>. On lui attribue un rôle précis, des outils autorisés et des permissions explicites."
        },
        {
          type: "chips",
          label: "Exemples de rôles",
          items: ["Security Reviewer", "Planner", "Documentateur", "Migration Assistant"]
        },
        {
          type: "rule",
          text: "Invocation : <code>@nom-agent</code> explicitement — ou <strong>automatique</strong> quand Copilot détecte la pertinence via la <code>description</code>."
        }
      ]
    },

    // ── 04 · Structure YAML Frontmatter ────────────────────────────────
    {
      id: "s04", type: "content", sectionId: "agents",
      title: "Fichier .agent.md — Métadonnées YAML",
      context: "Deux parties : YAML frontmatter (métadonnées) + corps Markdown (instructions)",
      steps: [
        { type: "field", name: "name",         badge: "REQUIS",      desc: "Identifiant unique de l'agent",                   sub: "Caractères autorisés : a-z, A-Z, 0-9, ., -, _" },
        { type: "field", name: "description",  badge: "REQUIS",      desc: "Ce que l'agent fait",                             sub: "Utilisé par Copilot pour décider quand l'invoquer automatiquement" },
        { type: "field", name: "tools",        badge: "Recommandé",  desc: "Liste des outils autorisés",                      sub: "#tool:web/fetch · #tool:github — restreindre réduit tokens et surface d'attaque" },
        { type: "field", name: "permissions",  badge: "Recommandé",  desc: "Droits d'accès : lecture, écriture, exécution",   sub: "Principe de moindre privilège — content: read | write | execute" },
        { type: "field", name: "safe-outputs", badge: "Optionnel",   desc: "Sorties considérées comme sûres",                 sub: "Important pour les agents autonomes qui exécutent du code" },
        { type: "field", name: "on",           badge: "Optionnel",   desc: "Déclencheur de workflow agentique",               sub: "Événements GitHub : issue ouverte, PR créée, push, etc." }
      ]
    },

    // ── 05 · Corps Markdown + Exemple minimal ──────────────────────────
    {
      id: "s05", type: "content", sectionId: "agents",
      title: "Corps Markdown + Exemple minimal",
      steps: [
        {
          type: "definition",
          text: "Le corps Markdown contient la <strong>persona</strong>, le comportement attendu, les contraintes métier et des exemples d'interactions. C'est la partie la plus libre — écrivez en langage naturel."
        },
        {
          type: "code", lang: "yaml", label: "security-reviewer.agent.md",
          content: "---\nname: security-reviewer\ndescription: Analyse le code pour détecter les vulnérabilités. Ne modifie jamais les fichiers.\ntools:\n  - \"#tool:github\"\npermissions:\n  content: read\n---\n\nTu es un expert en sécurité applicative (OWASP Top 10, injection, XSS, secrets exposés).\nTu fournis un rapport structuré avec sévérité, localisation et recommandation.\nTu ne proposes jamais de correctif directement — tu documentes uniquement."
        }
      ]
    },

    // ── 06 · Où placer un agent ? ──────────────────────────────────────
    {
      id: "s06", type: "content", sectionId: "agents",
      title: "Où placer un agent ?",
      steps: [
        {
          type: "location", scope: "Projet / Équipe",
          path: ".github/agents/<nom>.agent.md",
          pros: ["Versionné avec le code", "Visible dans l'historique Git", "Disponible dès le clone du repo"]
        },
        {
          type: "location", scope: "Personnel",
          path: "~/.copilot/agents/<nom>.agent.md",
          pros: ["Disponible dans tous les workspaces", "Idéal pour les assistants perso"]
        },
        {
          type: "rule",
          text: "Priorité : <code>~/.copilot/agents/</code> prend la priorité sur <code>.github/agents/</code> → permet de surcharger un agent d'équipe avec sa version personnelle."
        },
        {
          type: "bullet",
          text: "CLI : <code>gh copilot @nom-agent</code> — invoque l'agent depuis le terminal"
        }
      ]
    },

    // ── 07 · Section 02 ────────────────────────────────────────────────
    {
      id: "s07", type: "section", sectionId: "skills",
      num: "02", title: "Anatomie d'un custom skill",
      items: ["Définition & différence vs agent", "Structure du dossier", "SKILL.md & exemple", "Où le placer ?"],
      steps: []
    },

    // ── 08 · Qu'est-ce qu'un skill ? ───────────────────────────────────
    {
      id: "s08", type: "content", sectionId: "skills",
      title: "Qu'est-ce qu'un skill ?",
      steps: [
        {
          type: "definition",
          text: "Un skill est un <em>module d'instruction</em> qui apprend à Copilot à réaliser <strong>UNE action précise et répétable</strong>. Contrairement à un agent, il ne pense pas — il exécute exactement ce pour quoi il a été conçu."
        },
        {
          type: "two-col",
          left:  { label: "Skill",  tagline: "Atomique · Stateless · Prévisible",  items: ["Exécute une seule action et s'arrête", "Résultat reproductible à chaque appel", "Chargement lazy — tokens proportionnels à l'usage"] },
          right: { label: "Agent",  tagline: "Autonome · Stateful · Orchestre",    items: ["Raisonne, sélectionne ses outils, enchaîne les actions", "Maintient son contexte sur toute une session", "Persona complète chargée à l'invocation"] }
        },
        {
          type: "rule",
          text: "Copilot lit d'abord <strong>uniquement</strong> <code>name + description</code>. Les instructions complètes ne sont chargées <strong>que si le skill est jugé pertinent</strong>."
        }
      ]
    },

    // ── 09 · Structure du dossier ──────────────────────────────────────
    {
      id: "s09", type: "content", sectionId: "skills",
      title: "Structure du dossier skill",
      context: "Racine : .github/skills/<nom-du-skill>/",
      steps: [
        { type: "file", name: "SKILL.md",    badge: "REQUIS",     desc: "Frontmatter YAML + instructions complètes — injecté dans le contexte quand le skill est activé" },
        { type: "file", name: "scripts/",     badge: "Optionnel",  desc: "Scripts Python ou PowerShell — automatisation concrète exécutée par le skill" },
        { type: "file", name: "references/",  badge: "Optionnel",  desc: "Documentation chargée dans le contexte (specs, conventions, glossaire métier)" },
        { type: "file", name: "templates/",   badge: "Optionnel",  desc: "Fichiers starter modifiés par l'agent (ex : template de PR, de test unitaire)" },
        { type: "file", name: "assets/",      badge: "Optionnel",  desc: "Fichiers statiques utilisés tels quels dans la sortie (logo, config fixe…)" },
        { type: "file", name: "LICENSE.txt",  badge: "Recommandé", desc: "Licence du skill — Apache 2.0 souvent utilisé pour les skills open source" }
      ]
    },

    // ── 10 · SKILL.md + Exemple ────────────────────────────────────────
    {
      id: "s10", type: "content", sectionId: "skills",
      title: "SKILL.md — Exemple : generate-adr",
      steps: [
        {
          type: "field-group", label: "Champs YAML frontmatter",
          fields: [
            { name: "name",        desc: "Identifiant unique, minuscules, tirets (ex : generate-adr)" },
            { name: "description", desc: "Décrit la tâche — clé pour la détection automatique par Copilot" },
            { name: "version",     desc: "Suivi de version sémantique (ex : 1.0.0)" }
          ]
        },
        {
          type: "code", lang: "yaml", label: "generate-adr/SKILL.md",
          content: "---\nname: generate-adr\ndescription: Génère un Architecture Decision Record (ADR) structuré à partir d'une décision technique\nversion: 1.0.0\n---\n\n## Instructions\n\nQuand l'utilisateur décrit une décision d'architecture, génère un fichier ADR\nsuivant le template dans templates/adr-template.md.\n\nChamps obligatoires : Titre, Statut, Contexte, Décision, Conséquences.\nNomme le fichier : docs/adr/YYYY-MM-DD-<sujet-en-kebab-case>.md"
        }
      ]
    },

    // ── 11 · Où placer un skill ? ──────────────────────────────────────
    {
      id: "s11", type: "content", sectionId: "skills",
      title: "Où placer un skill ?",
      steps: [
        {
          type: "location", scope: "Projet (Git)",
          path: ".github/skills/<nom>/",
          pros: ["Versionné, partagé avec l'équipe", "Détecté automatiquement par Copilot"]
        },
        {
          type: "location", scope: "Personnel",
          path: "~/.copilot/skills/<nom>/",
          pros: ["Disponible dans tous les workspaces de la machine"]
        },
        {
          type: "location-group",
          label: "Standard ouvert — reconnu aussi par Claude Code",
          items: [
            { path: ".claude/skills/<nom>/", scope: "Projet · Claude Code + Copilot" },
            { path: ".agents/skills/<nom>/", scope: "Projet · autre emplacement reconnu" }
          ]
        },
        {
          type: "rule",
          text: "VS Code : paramètre <code>chat.agentSkillsLocations</code> — tableau de chemins pour pointer vers un repo outils partagé."
        }
      ]
    },

    // ── 12 · Section 03 ────────────────────────────────────────────────
    {
      id: "s12", type: "section", sectionId: "compare",
      num: "03", title: "Skill vs Agent — Quelle différence ?",
      items: ["Raison d'être", "Économie de tokens", "Lifecycle et contrôle", "Tableau comparatif complet"],
      steps: []
    },

    // ── 13 · Raison d'être ─────────────────────────────────────────────
    {
      id: "s13", type: "twocol", sectionId: "compare",
      title: "Raison d'être — Skill vs Agent",
      steps: [
        {
          type: "comparison-col", label: "Skill",
          tagline: "Enseigne UNE action précise",
          items: [
            "Déclaratif, prévisible, stateless",
            "Exemples : générer un ADR, rédiger un changelog, créer un test unitaire selon un template"
          ]
        },
        {
          type: "comparison-col", label: "Agent",
          tagline: "Persona autonome avec un objectif",
          items: [
            "Raisonne, sélectionne ses outils, enchaîne les actions",
            "Exemples : analyser toute la sécurité d'un PR, planifier une migration et produire un plan d'implémentation"
          ]
        }
      ]
    },

    // ── 14 · Économie de tokens ────────────────────────────────────────
    {
      id: "s14", type: "token", sectionId: "compare",
      title: "Économie de tokens",
      steps: [
        { type: "token-row", label: "Instructions globales", context: "copilot-instructions.md",           behavior: "Toujours injectées — à chaque message, même pour des questions simples",                     impactLevel: "high",   impact: "Élevé"  },
        { type: "token-row", label: "Skills",                context: "name + description seuls au départ", behavior: "Instructions complètes chargées uniquement si le skill est jugé pertinent",                  impactLevel: "low",    impact: "Faible" },
        { type: "token-row", label: "Agents",                context: "Persona complète à l'invocation",   behavior: "Réduit en restreignant outils et permissions — proportionnel à la taille du .agent.md",       impactLevel: "medium", impact: "Moyen"  },
        { type: "token-row", label: "Hooks natifs",          context: "Exécution directe, sans LLM",        behavior: "Code exécuté directement — aucun passage par le modèle de langage",                          impactLevel: "zero",   impact: "Zéro"   }
      ]
    },

    // ── 15 · Tableau comparatif ────────────────────────────────────────
    {
      id: "s15", type: "table", sectionId: "compare",
      title: "Tableau comparatif complet",
      columns: ["Dimension", "Skill", "Agent"],
      steps: [
        { type: "table-row", cells: ["Granularité",       "Une action atomique",                    "Workflow multi-étapes"] },
        { type: "table-row", cells: ["Autonomie",         "Nulle — exécute et s'arrête",            "Haute — raisonne et décide"] },
        { type: "table-row", cells: ["Tokens consommés",  "Faibles (chargement lazy)",              "Moyens à élevés (persona complète)"] },
        { type: "table-row", cells: ["Prévisibilité",     "Très haute — résultat reproductible",    "Variable selon le raisonnement"] },
        { type: "table-row", cells: ["Format fichier",    "Dossier + SKILL.md",                     "Fichier .agent.md unique"] },
        { type: "table-row", cells: ["Déclenchement",     "Automatique ou mention",                 "Explicite ou événement GitHub"] },
        { type: "table-row", cells: ["État entre appels", "Stateless",                              "Avec mémoire de session"] },
        { type: "table-row", cells: ["Cas d'usage",       "Générer un rapport, créer un fichier",   "Analyser, planifier, orchestrer"] }
      ]
    },

    // ── 16 · Section 04 ────────────────────────────────────────────────
    {
      id: "s16", type: "section", sectionId: "sharing",
      num: "04", title: "Partager dans l'équipe",
      items: ["Stratégies de distribution", "Niveaux de portée", "Bonnes pratiques"],
      steps: []
    },

    // ── 17 · Stratégies 1/2 ────────────────────────────────────────────
    {
      id: "s17", type: "grid", sectionId: "sharing",
      title: "Stratégies de partage",
      badge: "1 / 2",
      steps: [
        {
          type: "strategy", rank: "★ Recommandé",
          title: "Via le repository du projet",
          desc: "Agents dans .github/agents/ et skills dans .github/skills/ — versionnés avec le code, disponibles dès le clone.",
          pros: ["Pas de config supplémentaire", "Évolution dans les PR → revue possible", "Cohérence garantie : même version pour tous"],
          cons: ["Scope limité à ce repo"]
        },
        {
          type: "strategy", rank: "Scalable",
          title: "Via un repository dédié",
          desc: "Repo central (ex : mon-org/copilot-toolbox) — un seul endroit pour tous les outils d'équipe.",
          pros: ["Évite la duplication", "Découvrabilité centralisée", "Versionnable avec des releases"],
          cons: ["Nécessite chat.agentSkillsLocations dans VS Code"]
        }
      ]
    },

    // ── 18 · Stratégies 2/2 ────────────────────────────────────────────
    {
      id: "s18", type: "grid", sectionId: "sharing",
      title: "Stratégies de partage",
      badge: "2 / 2",
      steps: [
        {
          type: "strategy", rank: "Personnel",
          title: "Via les dotfiles",
          desc: "~/.copilot/ dans ses dotfiles (chezmoi, stow…) — disponible dans tous les projets sans config.",
          pros: ["Personnalisation individuelle", "Tous projets sans config par repo"],
          cons: ["Non partagé automatiquement"]
        },
        {
          type: "strategy", rank: "Bientôt",
          title: "Niveau Organisation / Enterprise",
          desc: "Support centralisé au niveau org/enterprise annoncé par GitHub — sans configuration par repo.",
          pros: ["Déploiement à grande échelle par les admins"],
          cons: ["Pas encore en GA — à suivre dans GitHub Changelog"]
        },
        {
          type: "strategy", rank: "Cross-tools",
          title: "Standard ouvert",
          desc: "Skills dans .claude/skills/ — reconnus par Copilot ET Claude Code.",
          pros: ["Investissement rentabilisé pour les équipes multi-assistants IA"],
          cons: []
        }
      ]
    },

    // ── 19 · Bonnes pratiques ──────────────────────────────────────────
    {
      id: "s19", type: "content", sectionId: "sharing",
      title: "Bonnes pratiques",
      steps: [
        { type: "best-practice", icon: "✦", text: "Nommer en <strong>kebab-case, verbe-objet</strong> : <code>generate-adr</code>, <code>review-security</code>" },
        { type: "best-practice", icon: "✦", text: "<strong>Versionner</strong> les skills — champ <code>version</code> dans le frontmatter YAML" },
        { type: "best-practice", icon: "✦", text: "<strong>Restreindre</strong> outils et permissions des agents au strict nécessaire (principe de moindre privilège)" },
        { type: "best-practice", icon: "✦", text: "Soigner la <strong>description</strong> — c'est la clé du déclenchement automatique par Copilot" },
        { type: "best-practice", icon: "✦", text: "Tester dans <code>.github/skills/</code> avant de promouvoir dans un repo partagé" },
        { type: "best-practice", icon: "✦", text: "Inclure des <strong>exemples concrets</strong> dans SKILL.md pour guider le comportement de Copilot" },
        { type: "best-practice", icon: "✦", text: "Ajouter un <code>README.md</code> dans <code>.github/skills/</code> listant les skills et leur usage" }
      ]
    },

    // ── 20 · Section 05 ────────────────────────────────────────────────
    {
      id: "s20", type: "section", sectionId: "plugins",
      num: "05", title: "Agent Plugins",
      items: ["Concept & Rôle", "Anatomie d'un plugin", "Distribution & Installation"],
      steps: []
    },

    // ── 21 · Plugins — Concept & Anatomie ─────────────────────────────
    {
      id: "s21", type: "content", sectionId: "plugins",
      title: "Agent Plugins — Concept & Anatomie",
      steps: [
        {
          type: "definition",
          text: "Un <strong>Agent Plugin</strong> est le mécanisme de <em>packaging officiel</em> de Copilot. Il empaquète agents, skills, hooks et configurations MCP en une seule unité distribuable et installable."
        },
        { type: "file", name: ".github/plugin.json", badge: "REQUIS",    desc: "Manifeste déclarant métadonnées, nom et composants inclus dans le plugin" },
        { type: "file", name: "agents/",              badge: "Optionnel", desc: "Les fichiers .agent.md — les personas personnalisés" },
        { type: "file", name: "skills/",              badge: "Optionnel", desc: "Les sous-dossiers de skills avec leurs SKILL.md" },
        { type: "file", name: "hooks/ + mcp/",        badge: "Optionnel", desc: "Scripts événementiels (cycle de vie) + configuration MCP pour serveurs externes" }
      ]
    },

    // ── 22 · Distribution & Installation ──────────────────────────────
    {
      id: "s22", type: "grid", sectionId: "plugins",
      title: "Distribution & Installation",
      steps: [
        {
          type: "distribution", rank: "Local",
          title: "Local / Git direct",
          desc: "Installation depuis un dossier local ou un dépôt GitHub public ou privé."
        },
        {
          type: "distribution", rank: "Équipe",
          title: "Marketplace d'entreprise",
          desc: "Publication sur un catalogue interne — meilleure découvrabilité et gouvernance d'équipe."
        },
        {
          type: "distribution", rank: "Admin",
          title: "Installation centralisée",
          desc: "Les administrateurs peuvent pré-installer ou imposer des plugins à toute l'organisation."
        }
      ]
    },

    // ── 23 · Discussion ────────────────────────────────────────────────
    {
      id: "s23", type: "discussion", sectionId: "discussion",
      title: "Idées pour notre équipe",
      prompt: "Quels agents ou skills pourrions-nous créer ?",
      hints: [
        "Un skill pour générer les ADR de nos projets",
        "Un agent de revue de sécurité sur nos PR",
        "Un skill de création de tests unitaires selon nos conventions",
        "Un agent de migration de code legacy"
      ],
      steps: []
    }

  ] // end slides

}; // end PRESENTATION_DATA
