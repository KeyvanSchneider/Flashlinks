const { Modal, Notice, Plugin, PluginSettingTab, Setting, setIcon } = require("obsidian");
const { Decoration, ViewPlugin, WidgetType } = require("@codemirror/view");
const { RangeSetBuilder } = require("@codemirror/state");

const FLASHCARD_PATTERN = /::([^:\n][^:\n]*?)::/g;
const FLASHCARD_STORE_PATH = "smart-flashcards.json";
const FLASHCARD_EXPORT_PATH = "Flashcards.md";
const ANKI_EXPORT_PATH = "Flashcards-Anki.txt";
const DEFAULT_FOLDER = "Inbox";
const DEFAULT_DATA = {
  cards: {},
  folders: [DEFAULT_FOLDER],
  settings: {
    language: "fr",
    defaultEase: 2.5,
    hardIntervalDays: 1,
    goodIntervalDays: 3,
    easyIntervalDays: 7
  }
};

const I18N = {
  fr: {
    language: "Langue",
    languageDesc: "Choisis la langue de l'interface du plugin.",
    french: "Français",
    english: "Anglais",
    reviewCount: "Révisions",
    lastTime: "Dernière fois",
    nextTime: "Prochaine fois",
    never: "Jamais",
    dueNow: "A réviser maintenant",
    dueToday: "A réviser aujourd'hui",
    dueTomorrow: "A réviser demain",
    dueInDays: "A réviser dans {{days}} jours",
    front: "Recto",
    back: "Verso",
    frontDesc: "La question ou le déclencheur de mémoire.",
    backDesc: "La réponse à retrouver pendant la révision.",
    frontPlaceholder: "Ex. Quelle est la capitale de la France ?",
    backPlaceholder: "Ex. Paris ou ![[image.png]]",
    missingImage: "Image introuvable : {{path}}",
    saveFlashcard: "Valider la flashcard",
    cancel: "Annuler",
    saved: "Flashcard sauvegardée",
    emptyFront: "Ajoute un recto pour commencer.",
    emptyBack: "Ajoute un verso pour pouvoir te tester.",
    flipHint: "Clique la carte ou appuie sur Espace pour la retourner.",
    hard: "Difficile",
    good: "Correct",
    easy: "Facile",
    editFlashcard: "Modifier la flashcard",
    openSource: "Revenir à la note source",
    sourceMissing: "Note source introuvable.",
    deleteFlashcard: "Supprimer la flashcard",
    deletedFlashcard: "Flashcard supprimée",
    reviewed: "Carte révisée : {{due}}",
    libraryTitle: "Flashcards",
    librarySubtitle: "Toutes tes cartes de révision dans ce coffre.",
    exportMd: "Exporter en MD",
    exportAllMd: "Exporter toutes les flashcards en MD",
    exportAnki: "Exporter pour Anki",
    exportAnkiTitle: "Enregistrer l'export Anki",
    exportAnkiUnavailable: "Impossible d'ouvrir la fenêtre d'enregistrement Anki.",
    exported: "Export créé : {{path}}",
    cards: "Cartes",
    due: "À revoir",
    reviewedCount: "Révisées",
    searchPlaceholder: "Rechercher une flashcard",
    noCards: "Aucune flashcard trouvée.",
    emptyFrontShort: "Recto vide",
    folders: "Dossiers",
    createFolder: "Créer un dossier",
    deleteFolder: "Supprimer le dossier",
    all: "Toutes",
    folderDeleteTitle: "Supprimer le dossier",
    folderDeleteText: "{{folder}} sera supprimé. Les {{count}} carte(s) dedans seront déplacées vers Inbox.",
    delete: "Supprimer",
    folderCreateTitle: "Créer un dossier",
    folderCreateDesc: "Ce dossier reste virtuel et ne crée rien dans le coffre.",
    folderNamePlaceholder: "Nom du dossier",
    create: "Créer",
    folderNameRequired: "Ajoute un nom de dossier.",
    reviewsShort: "{{count}} révisions",
    settingsTitle: "Flashlinks",
    hardInterval: "Intervalle Difficile",
    hardIntervalDesc: "Nombre de jours avant de revoir une carte marquée difficile.",
    goodInterval: "Intervalle Correct",
    goodIntervalDesc: "Nombre de jours avant de revoir une carte réussie normalement.",
    easyInterval: "Intervalle Facile",
    easyIntervalDesc: "Nombre de jours avant de revoir une carte très facile.",
    ribbonLibrary: "Toutes les flashcards",
    createLinkCommand: "Créer un lien flashcard depuis la sélection",
    reviewDueCommand: "Réviser les flashcards dues",
    openLibraryCommand: "Ouvrir la bibliothèque de flashcards",
    selectTextNotice: "Sélectionne un texte pour créer une flashcard.",
    noDueNotice: "Aucune flashcard à réviser maintenant.",
    loadError: "Impossible de lire {{path}}. Données temporaires utilisées."
  },
  en: {
    language: "Language",
    languageDesc: "Choose the plugin interface language.",
    french: "French",
    english: "English",
    reviewCount: "Reviews",
    lastTime: "Last time",
    nextTime: "Next time",
    never: "Never",
    dueNow: "Review now",
    dueToday: "Review today",
    dueTomorrow: "Review tomorrow",
    dueInDays: "Review in {{days}} days",
    front: "Front",
    back: "Back",
    frontDesc: "The question or memory prompt.",
    backDesc: "The answer to recall during review.",
    frontPlaceholder: "E.g. What is the capital of France?",
    backPlaceholder: "E.g. Paris or ![[image.png]]",
    missingImage: "Image not found: {{path}}",
    saveFlashcard: "Save flashcard",
    cancel: "Cancel",
    saved: "Flashcard saved",
    emptyFront: "Add a front side to get started.",
    emptyBack: "Add a back side to test yourself.",
    flipHint: "Click the card or press Space to flip it.",
    hard: "Hard",
    good: "Good",
    easy: "Easy",
    editFlashcard: "Edit flashcard",
    openSource: "Back to source note",
    sourceMissing: "Source note not found.",
    deleteFlashcard: "Delete flashcard",
    deletedFlashcard: "Flashcard deleted",
    reviewed: "Card reviewed: {{due}}",
    libraryTitle: "Flashcards",
    librarySubtitle: "All your review cards in this vault.",
    exportMd: "Export MD",
    exportAllMd: "Export all flashcards to MD",
    exportAnki: "Export for Anki",
    exportAnkiTitle: "Save Anki export",
    exportAnkiUnavailable: "Could not open the Anki save dialog.",
    exported: "Export created: {{path}}",
    cards: "Cards",
    due: "Due",
    reviewedCount: "Reviewed",
    searchPlaceholder: "Search flashcards",
    noCards: "No flashcards found.",
    emptyFrontShort: "Empty front",
    folders: "Folders",
    createFolder: "Create folder",
    deleteFolder: "Delete folder",
    all: "All",
    folderDeleteTitle: "Delete folder",
    folderDeleteText: "{{folder}} will be deleted. The {{count}} card(s) inside will move to Inbox.",
    delete: "Delete",
    folderCreateTitle: "Create folder",
    folderCreateDesc: "This folder is virtual and creates nothing in the vault.",
    folderNamePlaceholder: "Folder name",
    create: "Create",
    folderNameRequired: "Add a folder name.",
    reviewsShort: "{{count}} reviews",
    settingsTitle: "Flashlinks",
    hardInterval: "Hard interval",
    hardIntervalDesc: "Number of days before reviewing a card marked hard.",
    goodInterval: "Good interval",
    goodIntervalDesc: "Number of days before reviewing a card you remembered.",
    easyInterval: "Easy interval",
    easyIntervalDesc: "Number of days before reviewing a very easy card.",
    ribbonLibrary: "All flashcards",
    createLinkCommand: "Create flashcard link from selection",
    reviewDueCommand: "Review due flashcards",
    openLibraryCommand: "Open flashcard library",
    selectTextNotice: "Select text to create a flashcard.",
    noDueNotice: "No flashcards to review right now.",
    loadError: "Could not read {{path}}. Temporary data is being used."
  }
};

function translate(language, key, vars = {}) {
  const dictionary = I18N[language] || I18N.fr;
  return (dictionary[key] || I18N.fr[key] || key).replace(/\{\{(\w+)\}\}/g, (_, name) => String(vars[name] ?? ""));
}

function cloneDefaultData() {
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

function normalizeLabel(label) {
  return String(label || "").trim().replace(/\s+/g, " ");
}

function getCardId(label) {
  return normalizeLabel(label).toLocaleLowerCase();
}

function escapeCell(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\|/g, "\\|")
    .replace(/\n/g, "<br>");
}

function cardToTableRow(card) {
  return [
    card.folder || DEFAULT_FOLDER,
    card.front,
    card.back
  ]
    .map(escapeCell)
    .join(" | ");
}

function escapeAnkiField(value) {
  return String(value ?? "")
    .replace(/\t/g, " ")
    .replace(/\r?\n/g, "<br>")
    .replace(/!\[\[([^\]]+)\]\]/g, (_, rawTarget) => {
      const fileName = rawTarget.split("|")[0].split("#")[0].trim().split("/").pop();
      return fileName ? `<img src="${fileName}">` : "";
    });
}

function cardsToAnkiText(data) {
  const cards = Object.values(data.cards).sort((a, b) => {
    const folderCompare = (a.folder || DEFAULT_FOLDER).localeCompare(b.folder || DEFAULT_FOLDER);
    return folderCompare || a.label.localeCompare(b.label);
  });

  return cards
    .map((card) =>
      [
        escapeAnkiField(card.front),
        escapeAnkiField(card.back),
        escapeAnkiField(card.folder || DEFAULT_FOLDER)
      ].join("\t")
    )
    .join("\n");
}

function cardsToExportMarkdown(data) {
  const folders = [...new Set([DEFAULT_FOLDER, ...(data.folders || []), ...Object.values(data.cards).map((card) => card.folder || DEFAULT_FOLDER)])].sort((a, b) =>
    a.localeCompare(b)
  );
  const cards = Object.values(data.cards).sort((a, b) => {
    const folderCompare = (a.folder || DEFAULT_FOLDER).localeCompare(b.folder || DEFAULT_FOLDER);
    return folderCompare || a.label.localeCompare(b.label);
  });

  return [
    "# Flashcards",
    "",
    "Export manuel depuis Flashlinks.",
    "",
    "## Dossiers",
    "",
    ...folders.map((folder) => `- ${escapeCell(folder)}`),
    "",
    "## Cartes",
    "",
    "| Dossier | Recto | Verso |",
    "| --- | --- | --- |",
    ...cards.map((card) => `| ${cardToTableRow(card)} |`),
    ""
  ].join("\n");
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(days) {
  const date = startOfToday();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function formatDate(value, language = "fr") {
  if (!value) return translate(language, "never");
  return new Date(value).toLocaleDateString(language === "en" ? "en" : "fr", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function dueLabel(card, language = "fr") {
  if (!card.nextReviewAt) return translate(language, "dueNow");
  const due = new Date(card.nextReviewAt);
  const today = startOfToday();
  const diff = Math.ceil((due.getTime() - today.getTime()) / 86400000);
  if (diff <= 0) return translate(language, "dueToday");
  if (diff === 1) return translate(language, "dueTomorrow");
  return translate(language, "dueInDays", { days: diff });
}

function createEmptyCard(label) {
  const now = new Date().toISOString();
  return {
    id: getCardId(label),
    label: normalizeLabel(label),
    front: normalizeLabel(label),
    back: "",
    reviewCount: 0,
    correctCount: 0,
    ease: DEFAULT_DATA.settings.defaultEase,
    intervalDays: 0,
    createdAt: now,
    updatedAt: now,
    lastReviewedAt: null,
    nextReviewAt: now,
    isConfigured: false,
    folder: DEFAULT_FOLDER,
    sourcePath: null
  };
}

function normalizeCard(card) {
  const base = createEmptyCard(card.label || card.front || "Flashcard");
  const normalized = Object.assign(base, card);
  normalized.label = normalizeLabel(normalized.label);
  normalized.id = normalized.id || getCardId(normalized.label);
  normalized.front = normalized.front || normalized.label;
  normalized.ease = normalized.ease || DEFAULT_DATA.settings.defaultEase;
  normalized.reviewCount = normalized.reviewCount || 0;
  normalized.correctCount = normalized.correctCount || 0;
  normalized.intervalDays = normalized.intervalDays || 0;
  normalized.folder = normalizeLabel(normalized.folder || DEFAULT_FOLDER) || DEFAULT_FOLDER;
  normalized.sourcePath = normalized.sourcePath || null;
  normalized.isConfigured = typeof normalized.isConfigured === "boolean" ? normalized.isConfigured : Boolean(normalized.back);
  return normalized;
}

class FlashcardWidget extends WidgetType {
  constructor(plugin, label) {
    super();
    this.plugin = plugin;
    this.label = label;
  }

  eq(other) {
    return other.label === this.label;
  }

  toDOM() {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "smart-flashcard-link cm-smart-flashcard-link";
    button.textContent = this.label;
    button.setAttribute("aria-label", this.plugin.t("editFlashcard"));
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.plugin.openCard(this.label, this.plugin.app.workspace.getActiveFile()?.path || null);
    });
    return button;
  }
}

function buildFlashcardExtension(plugin) {
  return ViewPlugin.fromClass(
    class {
      constructor(view) {
        this.plugin = plugin;
        this.decorations = this.buildDecorations(view);
      }

      update(update) {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = this.buildDecorations(update.view);
        }
      }

      buildDecorations(view) {
        const builder = new RangeSetBuilder();
        for (const range of view.visibleRanges) {
          const text = view.state.doc.sliceString(range.from, range.to);
          const pattern = new RegExp(FLASHCARD_PATTERN);
          let match;
          while ((match = pattern.exec(text)) !== null) {
            const from = range.from + match.index;
            const to = from + match[0].length;
            const label = normalizeLabel(match[1]);
            if (!label) continue;
            builder.add(
              from,
              to,
              Decoration.replace({
                widget: new FlashcardWidget(this.plugin, label)
              })
            );
          }
        }
        return builder.finish();
      }
    },
    {
      decorations: (value) => value.decorations
    }
  );
}

class FlashcardModal extends Modal {
  constructor(app, plugin, label, sourcePath = null) {
    super(app);
    this.plugin = plugin;
    this.label = normalizeLabel(label);
    this.card = plugin.getOrCreateCard(this.label, sourcePath);
    this.showAnswer = false;
    this.editMode = !this.card.isConfigured;
    this.draftFront = this.card.front;
    this.draftBack = this.card.back;
    this.handleKeydown = this.handleKeydown.bind(this);
  }

  onOpen() {
    this.modalEl.addClass("smart-flashcard-shell");
    document.addEventListener("keydown", this.handleKeydown);
    this.render();
  }

  onClose() {
    document.removeEventListener("keydown", this.handleKeydown);
  }

  handleKeydown(event) {
    const target = event.target;
    const isTyping =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target?.isContentEditable;

    if (this.editMode || isTyping || event.code !== "Space") return;
    event.preventDefault();
    this.flipCard();
  }

  flipCard() {
    this.showAnswer = !this.showAnswer;
    this.render();
  }

  render() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("smart-flashcard-modal");

    const header = contentEl.createDiv({ cls: "smart-flashcard-header" });
    header.createEl("h2", { text: this.card.label });
    header.createEl("p", { text: dueLabel(this.card, this.plugin.language()) });

    const stats = contentEl.createDiv({ cls: "smart-flashcard-stats" });
    this.createStat(stats, this.plugin.t("reviewCount"), String(this.card.reviewCount));
    this.createStat(stats, this.plugin.t("lastTime"), formatDate(this.card.lastReviewedAt, this.plugin.language()));
    this.createStat(stats, this.plugin.t("nextTime"), formatDate(this.card.nextReviewAt, this.plugin.language()));

    if (this.editMode) {
      this.renderEditor(contentEl);
      return;
    }

    this.renderReviewer(contentEl);
  }

  renderEditor(contentEl) {
    new Setting(contentEl)
      .setName(this.plugin.t("front"))
      .setDesc(this.plugin.t("frontDesc"))
      .addTextArea((text) => {
        text
          .setPlaceholder(this.plugin.t("frontPlaceholder"))
          .setValue(this.draftFront)
          .onChange((value) => {
            this.draftFront = value;
          });
        text.inputEl.rows = 3;
      });

    new Setting(contentEl)
      .setName(this.plugin.t("back"))
      .setDesc(this.plugin.t("backDesc"))
      .addTextArea((text) => {
        text
          .setPlaceholder(this.plugin.t("backPlaceholder"))
          .setValue(this.draftBack)
          .onChange((value) => {
            this.draftBack = value;
          });
        text.inputEl.rows = 4;
      });

    const editorActions = contentEl.createDiv({ cls: "smart-flashcard-actions smart-flashcard-editor-actions" });
    const saveButton = editorActions.createEl("button", { text: this.plugin.t("saveFlashcard") });
    saveButton.addClass("mod-cta");
    saveButton.addEventListener("click", async () => {
      this.card.front = this.draftFront.trim() || this.card.label;
      this.card.back = this.draftBack.trim();
      this.card.isConfigured = true;
      await this.plugin.saveCard(this.card);
      this.editMode = false;
      this.showAnswer = false;
      new Notice(this.plugin.t("saved"));
      this.render();
    });

    if (this.card.isConfigured) {
      const cancelButton = editorActions.createEl("button", { text: this.plugin.t("cancel") });
      cancelButton.addEventListener("click", () => {
        this.draftFront = this.card.front;
        this.draftBack = this.card.back;
        this.editMode = false;
        this.render();
      });
    }
  }

  renderReviewer(contentEl) {
    const stage = contentEl.createDiv({ cls: "smart-flashcard-stage" });
    const cardButton = stage.createDiv({
      cls: `smart-flashcard-card${this.showAnswer ? " is-answer" : ""}`,
      attr: {
        role: "button",
        tabindex: "0",
        "aria-label": this.showAnswer ? this.plugin.t("front") : this.plugin.t("back")
      }
    });
    cardButton.addEventListener("click", () => this.flipCard());
    cardButton.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      this.flipCard();
    });

    const face = cardButton.createDiv({ cls: "smart-flashcard-face" });
    face.createEl("span", { cls: "smart-flashcard-kicker", text: this.showAnswer ? this.plugin.t("back") : this.plugin.t("front") });
    const cardContent = face.createDiv({ cls: "smart-flashcard-card-text" });
    this.renderCardContent(cardContent, this.showAnswer ? this.card.back || this.plugin.t("emptyBack") : this.card.front || this.plugin.t("emptyFront"));

    const hint = contentEl.createDiv({ cls: "smart-flashcard-hint" });
    const hintIcon = hint.createSpan();
    setIcon(hintIcon, "rotate-cw");
    hint.createSpan({ text: this.plugin.t("flipHint") });

    const actions = contentEl.createDiv({
      cls: `smart-flashcard-actions smart-flashcard-review-actions${this.showAnswer ? " is-visible" : ""}`
    });

    const hardButton = actions.createEl("button", { text: this.plugin.t("hard") });
    hardButton.addClass("smart-flashcard-rating", "is-hard");
    hardButton.disabled = !this.showAnswer;
    hardButton.addEventListener("click", () => this.review("hard"));

    const goodButton = actions.createEl("button", { text: this.plugin.t("good") });
    goodButton.addClass("smart-flashcard-rating", "is-good");
    goodButton.disabled = !this.showAnswer;
    goodButton.addEventListener("click", () => this.review("good"));

    const easyButton = actions.createEl("button", { text: this.plugin.t("easy") });
    easyButton.addClass("smart-flashcard-rating", "is-easy");
    easyButton.disabled = !this.showAnswer;
    easyButton.addEventListener("click", () => this.review("easy"));

    const footer = contentEl.createDiv({ cls: "smart-flashcard-iconbar" });
    const sourceButton = footer.createEl("button", {
      cls: "clickable-icon smart-flashcard-icon-button",
      attr: { "aria-label": this.plugin.t("openSource"), title: this.plugin.t("openSource") }
    });
    setIcon(sourceButton, "corner-up-left");
    sourceButton.disabled = !this.card.sourcePath;
    sourceButton.addEventListener("click", async () => {
      await this.plugin.openSourceNote(this.card);
      this.close();
    });

    const editButton = footer.createEl("button", {
      cls: "clickable-icon smart-flashcard-icon-button",
      attr: { "aria-label": this.plugin.t("editFlashcard"), title: this.plugin.t("editFlashcard") }
    });
    setIcon(editButton, "pencil");
    editButton.addEventListener("click", () => {
      this.draftFront = this.card.front;
      this.draftBack = this.card.back;
      this.editMode = true;
      this.render();
    });

    const deleteButton = footer.createEl("button", {
      cls: "clickable-icon smart-flashcard-icon-button smart-flashcard-delete-button",
      attr: { "aria-label": this.plugin.t("deleteFlashcard"), title: this.plugin.t("deleteFlashcard") }
    });
    setIcon(deleteButton, "trash-2");
    deleteButton.addEventListener("click", async () => {
      await this.plugin.deleteCard(this.card.id);
      new Notice(this.plugin.t("deletedFlashcard"));
      this.close();
    });
  }

  createStat(parent, label, value) {
    const item = parent.createDiv({ cls: "smart-flashcard-stat" });
    item.createEl("span", { text: label });
    item.createEl("strong", { text: value });
  }

  renderCardContent(parent, content) {
    const embedPattern = /!\[\[([^\]]+)\]\]/g;
    let lastIndex = 0;
    let match;

    while ((match = embedPattern.exec(content)) !== null) {
      this.appendTextSegment(parent, content.slice(lastIndex, match.index));
      this.appendImageEmbed(parent, match[1]);
      lastIndex = match.index + match[0].length;
    }

    this.appendTextSegment(parent, content.slice(lastIndex));
  }

  appendTextSegment(parent, text) {
    if (!text) return;
    const lines = text.split("\n");
    lines.forEach((line, index) => {
      if (index > 0) parent.createEl("br");
      if (line) parent.createSpan({ cls: "smart-flashcard-card-text-segment", text: line });
    });
  }

  appendImageEmbed(parent, rawTarget) {
    const [targetPart, sizePart] = rawTarget.split("|").map((part) => part.trim());
    const file = this.resolveVaultFile(targetPart);

    if (!file) {
      parent.createDiv({
        cls: "smart-flashcard-missing-image",
        text: this.plugin.t("missingImage", { path: targetPart })
      });
      return;
    }

    const image = parent.createEl("img", {
      cls: "smart-flashcard-card-image",
      attr: {
        alt: targetPart,
        src: this.app.vault.getResourcePath(file)
      }
    });

    const [widthPart, heightPart] = String(sizePart || "").split("x");
    const width = Number(widthPart);
    const height = Number(heightPart);
    if (Number.isFinite(width) && width > 0) image.style.maxWidth = `${Math.min(width, 900)}px`;
    if (Number.isFinite(height) && height > 0) image.style.maxHeight = `${Math.min(height, 600)}px`;
  }

  resolveVaultFile(rawTarget) {
    const cleanTarget = rawTarget.split("#")[0].trim();
    const sourcePath = this.app.workspace.getActiveFile()?.path || "";
    const linked = this.app.metadataCache.getFirstLinkpathDest(cleanTarget, sourcePath);
    if (linked) return linked;

    const exact = this.app.vault.getAbstractFileByPath(cleanTarget);
    if (exact) return exact;

    const normalizedTarget = cleanTarget.toLocaleLowerCase();
    const basename = normalizedTarget.split("/").pop();
    return this.app.vault
      .getFiles()
      .find((file) => file.path.toLocaleLowerCase() === normalizedTarget || file.name.toLocaleLowerCase() === basename);
  }

  async review(rating) {
    await this.plugin.reviewCard(this.card.id, rating);
    this.card = this.plugin.getOrCreateCard(this.label);
    this.showAnswer = false;
    new Notice(this.plugin.t("reviewed", { due: dueLabel(this.card, this.plugin.language()) }));
    this.render();
  }
}

class FlashcardLibraryModal extends Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
    this.query = "";
    this.selectedFolder = "";
  }

  onOpen() {
    this.modalEl.addClass("smart-flashcard-library-shell");
    this.render();
  }

  getCards() {
    const query = this.query.toLocaleLowerCase();
    return Object.values(this.plugin.data.cards)
      .filter((card) => {
        if (this.selectedFolder && (card.folder || DEFAULT_FOLDER) !== this.selectedFolder) return false;
        if (!query) return true;
        return `${card.label} ${card.front} ${card.back} ${card.folder}`.toLocaleLowerCase().includes(query);
      })
      .sort((a, b) => {
        const folderCompare = (a.folder || DEFAULT_FOLDER).localeCompare(b.folder || DEFAULT_FOLDER);
        if (folderCompare) return folderCompare;
        const aDue = new Date(a.nextReviewAt || 0).getTime();
        const bDue = new Date(b.nextReviewAt || 0).getTime();
        return aDue - bDue || a.label.localeCompare(b.label);
      });
  }

  getFolders() {
    return [
      ...new Set([DEFAULT_FOLDER, ...(this.plugin.data.folders || []), ...Object.values(this.plugin.data.cards).map((card) => card.folder || DEFAULT_FOLDER)])
    ].sort((a, b) => a.localeCompare(b));
  }

  render() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("smart-flashcard-library");

    const allCards = Object.values(this.plugin.data.cards);
    const dueCount = this.plugin.getDueCards().length;
    const reviewedCount = allCards.filter((card) => card.reviewCount > 0).length;

    const header = contentEl.createDiv({ cls: "smart-flashcard-library-header" });
    const titleBlock = header.createDiv();
    titleBlock.createEl("h2", { text: this.plugin.t("libraryTitle") });
    titleBlock.createEl("p", { text: this.plugin.t("librarySubtitle") });

    const tools = header.createDiv({ cls: "smart-flashcard-library-tools" });
    const summary = tools.createDiv({ cls: "smart-flashcard-library-summary" });
    this.createSummaryItem(summary, String(allCards.length), this.plugin.t("cards"));
    this.createSummaryItem(summary, String(dueCount), this.plugin.t("due"));
    this.createSummaryItem(summary, String(reviewedCount), this.plugin.t("reviewedCount"));

    const searchWrap = contentEl.createDiv({ cls: "smart-flashcard-library-search-wrap" });
    const searchIcon = searchWrap.createSpan();
    setIcon(searchIcon, "search");
    const search = searchWrap.createEl("input", {
      cls: "smart-flashcard-library-search",
      attr: {
        type: "search",
        placeholder: this.plugin.t("searchPlaceholder")
      }
    });
    search.value = this.query;
    search.addEventListener("input", () => {
      this.query = search.value;
      this.render();
    });
    search.focus();

    const cards = this.getCards();
    const browser = contentEl.createDiv({ cls: "smart-flashcard-library-browser" });
    this.renderFolders(browser);
    const list = browser.createDiv({ cls: "smart-flashcard-library-list" });

    if (!cards.length) {
      list.createDiv({ cls: "smart-flashcard-library-empty", text: this.plugin.t("noCards") });
      return;
    }

    for (const card of cards) {
      const item = list.createDiv({
        cls: "smart-flashcard-library-item",
        attr: { role: "button", tabindex: "0", draggable: "true" }
      });
      item.addEventListener("dragstart", (event) => {
        event.dataTransfer?.setData("text/plain", card.id);
        item.addClass("is-dragging");
      });
      item.addEventListener("dragend", () => item.removeClass("is-dragging"));

      const main = item.createDiv({ cls: "smart-flashcard-library-item-main" });
      main.createEl("strong", { text: card.label });
      main.createEl("span", { text: card.front || this.plugin.t("emptyFrontShort") });

      const folder = main.createEl("span", { cls: "smart-flashcard-library-folder-label" });
      const folderIcon = folder.createSpan();
      setIcon(folderIcon, "folder");
      folder.createSpan({ text: card.folder || DEFAULT_FOLDER });

      const meta = item.createDiv({ cls: "smart-flashcard-library-item-meta" });
      meta.createEl("span", { cls: "smart-flashcard-library-review-count", text: this.plugin.t("reviewsShort", { count: card.reviewCount || 0 }) });
      meta.createEl("span", { cls: "smart-flashcard-library-due-badge", text: dueLabel(card, this.plugin.language()) });

      item.addEventListener("click", () => {
        this.close();
        this.plugin.openCard(card.label);
      });
      item.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        this.close();
        this.plugin.openCard(card.label);
      });
    }

    const footer = contentEl.createDiv({ cls: "smart-flashcard-library-footer" });
    const exportAllButton = footer.createEl("button", {
      cls: "smart-flashcard-export-button mod-cta",
      attr: { type: "button" }
    });
    const footerExportIcon = exportAllButton.createSpan();
    setIcon(footerExportIcon, "download");
    exportAllButton.createSpan({ text: this.plugin.t("exportAllMd") });
    exportAllButton.addEventListener("click", async () => {
      await this.plugin.exportMarkdown();
      new Notice(this.plugin.t("exported", { path: FLASHCARD_EXPORT_PATH }));
    });

    const exportAnkiButton = footer.createEl("button", {
      cls: "smart-flashcard-export-button",
      attr: { type: "button" }
    });
    const ankiExportIcon = exportAnkiButton.createSpan();
    setIcon(ankiExportIcon, "copy");
    exportAnkiButton.createSpan({ text: this.plugin.t("exportAnki") });
    exportAnkiButton.addEventListener("click", async () => {
      const exportedPath = await this.plugin.exportAnki();
      if (exportedPath) {
        new Notice(this.plugin.t("exported", { path: exportedPath }));
      }
    });
  }

  createSummaryItem(parent, value, label) {
    const item = parent.createDiv({ cls: "smart-flashcard-library-summary-item" });
    item.createEl("strong", { text: value });
    item.createEl("span", { text: label });
  }

  renderFolders(parent) {
    const folders = this.getFolders();
    const panel = parent.createDiv({ cls: "smart-flashcard-folder-panel" });
    const header = panel.createDiv({ cls: "smart-flashcard-folder-panel-header" });
    header.createEl("span", { text: this.plugin.t("folders") });
    const addButton = header.createEl("button", {
      cls: "clickable-icon smart-flashcard-folder-add",
      attr: { type: "button", "aria-label": this.plugin.t("createFolder"), title: this.plugin.t("createFolder") }
    });
    setIcon(addButton, "folder-plus");
    addButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      new FolderCreateModal(this.app, this.plugin, async (folderName) => {
        this.plugin.addFolder(folderName);
        await this.plugin.saveStore();
        this.selectedFolder = folderName;
        this.render();
      }).open();
    });

    this.createFolderButton(panel, "", this.plugin.t("all"), Object.keys(this.plugin.data.cards).length);
    for (const folder of folders) {
      const count = Object.values(this.plugin.data.cards).filter((card) => (card.folder || DEFAULT_FOLDER) === folder).length;
      this.createFolderButton(panel, folder, folder, count);
    }
  }

  createFolderButton(parent, folder, label, count) {
    const row = parent.createDiv({
      cls: `smart-flashcard-folder-row${this.selectedFolder === folder ? " is-active" : ""}`
    });
    const button = row.createEl("button", {
      cls: "smart-flashcard-folder-item",
      attr: { type: "button" }
    });
    button.createEl("span", { text: label });
    button.createEl("strong", { text: String(count) });
    button.addEventListener("click", () => {
      this.selectedFolder = folder;
      this.render();
    });
    button.addEventListener("dragover", (event) => {
      event.preventDefault();
      button.addClass("is-drop-target");
    });
    button.addEventListener("dragleave", () => button.removeClass("is-drop-target"));
    button.addEventListener("drop", async (event) => {
      event.preventDefault();
      button.removeClass("is-drop-target");
      const cardId = event.dataTransfer?.getData("text/plain");
      if (!cardId || !this.plugin.data.cards[cardId]) return;
      this.plugin.data.cards[cardId].folder = folder || DEFAULT_FOLDER;
      await this.plugin.saveCard(this.plugin.data.cards[cardId]);
      this.selectedFolder = folder;
      this.render();
    });

    if (!folder || folder === DEFAULT_FOLDER) return;

    const deleteButton = row.createEl("button", {
      cls: "clickable-icon smart-flashcard-folder-delete",
      attr: { type: "button", "aria-label": this.plugin.t("deleteFolder"), title: this.plugin.t("deleteFolder") }
    });
    setIcon(deleteButton, "trash-2");
    deleteButton.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      new FolderDeleteModal(this.app, this.plugin, folder, count, async () => {
        await this.plugin.deleteFolder(folder);
        if (this.selectedFolder === folder) this.selectedFolder = "";
        this.render();
      }).open();
    });
  }
}

class FolderDeleteModal extends Modal {
  constructor(app, plugin, folderName, cardCount, onConfirm) {
    super(app);
    this.plugin = plugin;
    this.folderName = folderName;
    this.cardCount = cardCount;
    this.onConfirm = onConfirm;
  }

  onOpen() {
    this.modalEl.addClass("smart-flashcard-folder-create-shell");
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("smart-flashcard-folder-create");

    contentEl.createEl("h2", { text: this.plugin.t("folderDeleteTitle") });
    contentEl.createEl("p", {
      text: this.plugin.t("folderDeleteText", { folder: this.folderName, count: this.cardCount })
    });

    const actions = contentEl.createDiv({ cls: "smart-flashcard-folder-create-actions" });
    const cancelButton = actions.createEl("button", { text: this.plugin.t("cancel") });
    cancelButton.addEventListener("click", () => this.close());

    const deleteButton = actions.createEl("button", { text: this.plugin.t("delete") });
    deleteButton.addClass("mod-warning");
    deleteButton.addEventListener("click", async () => {
      await this.onConfirm();
      this.close();
    });
  }
}

class FolderCreateModal extends Modal {
  constructor(app, plugin, onSubmit) {
    super(app);
    this.plugin = plugin;
    this.onSubmit = onSubmit;
    this.folderName = "";
  }

  onOpen() {
    this.modalEl.addClass("smart-flashcard-folder-create-shell");
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("smart-flashcard-folder-create");

    contentEl.createEl("h2", { text: this.plugin.t("folderCreateTitle") });
    contentEl.createEl("p", { text: this.plugin.t("folderCreateDesc") });

    const input = contentEl.createEl("input", {
      cls: "smart-flashcard-folder-create-input",
      attr: {
        type: "text",
        placeholder: this.plugin.t("folderNamePlaceholder")
      }
    });
    input.addEventListener("input", () => {
      this.folderName = input.value;
    });
    input.addEventListener("keydown", async (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      await this.submit();
    });

    const actions = contentEl.createDiv({ cls: "smart-flashcard-folder-create-actions" });
    const cancelButton = actions.createEl("button", { text: this.plugin.t("cancel") });
    cancelButton.addEventListener("click", () => this.close());

    const createButton = actions.createEl("button", { text: this.plugin.t("create") });
    createButton.addClass("mod-cta");
    createButton.addEventListener("click", () => this.submit());

    input.focus();
  }

  async submit() {
    const folderName = normalizeLabel(this.folderName);
    if (!folderName) {
      new Notice(this.plugin.t("folderNameRequired"));
      return;
    }
    await this.onSubmit(folderName);
    this.close();
  }
}

class SmartFlashcardSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: this.plugin.t("settingsTitle") });

    new Setting(containerEl)
      .setName(this.plugin.t("language"))
      .setDesc(this.plugin.t("languageDesc"))
      .addDropdown((dropdown) =>
        dropdown
          .addOption("fr", this.plugin.t("french"))
          .addOption("en", this.plugin.t("english"))
          .setValue(this.plugin.data.settings.language || "fr")
          .onChange(async (value) => {
            this.plugin.data.settings.language = value;
            await this.plugin.saveStore();
            this.display();
          })
      );

    new Setting(containerEl)
      .setName(this.plugin.t("hardInterval"))
      .setDesc(this.plugin.t("hardIntervalDesc"))
      .addText((text) =>
        text
          .setValue(String(this.plugin.data.settings.hardIntervalDays))
          .onChange(async (value) => {
            this.plugin.data.settings.hardIntervalDays = Math.max(1, Number(value) || 1);
            await this.plugin.saveStore();
          })
      );

    new Setting(containerEl)
      .setName(this.plugin.t("goodInterval"))
      .setDesc(this.plugin.t("goodIntervalDesc"))
      .addText((text) =>
        text
          .setValue(String(this.plugin.data.settings.goodIntervalDays))
          .onChange(async (value) => {
            this.plugin.data.settings.goodIntervalDays = Math.max(1, Number(value) || 3);
            await this.plugin.saveStore();
          })
      );

    new Setting(containerEl)
      .setName(this.plugin.t("easyInterval"))
      .setDesc(this.plugin.t("easyIntervalDesc"))
      .addText((text) =>
        text
          .setValue(String(this.plugin.data.settings.easyIntervalDays))
          .onChange(async (value) => {
            this.plugin.data.settings.easyIntervalDays = Math.max(1, Number(value) || 7);
            await this.plugin.saveStore();
          })
      );
  }
}

module.exports = class SmartFlashcardLinksPlugin extends Plugin {
  async onload() {
    this.data = await this.loadStore();
    this.data.settings = Object.assign(cloneDefaultData().settings, this.data.settings || {});
    this.data.cards = this.data.cards || {};
    this.data.folders = [...new Set([DEFAULT_FOLDER, ...(this.data.folders || [])])];
    Object.keys(this.data.cards).forEach((id) => {
      this.data.cards[id] = normalizeCard(this.data.cards[id]);
      this.addFolder(this.data.cards[id].folder);
    });
    await this.saveStore();

    this.addRibbonIcon("library", this.t("ribbonLibrary"), () => this.openLibrary());
    this.addSettingTab(new SmartFlashcardSettingTab(this.app, this));
    this.registerEditorExtension(buildFlashcardExtension(this));
    this.registerMarkdownPostProcessor((element, context) => this.renderReadingModeLinks(element, context?.sourcePath));

    this.addCommand({
      id: "create-flashcard-link-from-selection",
      name: this.t("createLinkCommand"),
      editorCallback: (editor) => {
        const selected = editor.getSelection().trim();
        if (!selected) {
          new Notice(this.t("selectTextNotice"));
          return;
        }
        editor.replaceSelection(`::${selected}::`);
        this.openCard(selected, this.app.workspace.getActiveFile()?.path || null);
      }
    });

    this.addCommand({
      id: "open-due-flashcards",
      name: this.t("reviewDueCommand"),
      callback: () => {
        const due = this.getDueCards();
        if (!due.length) {
          new Notice(this.t("noDueNotice"));
          return;
        }
        this.openCard(due[0].label);
      }
    });

    this.addCommand({
      id: "open-flashcard-library",
      name: this.t("openLibraryCommand"),
      callback: () => this.openLibrary()
    });
  }

  renderReadingModeLinks(element, sourcePath = null) {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    for (const node of nodes) {
      const text = node.nodeValue || "";
      const pattern = new RegExp(FLASHCARD_PATTERN);
      if (!pattern.test(text)) continue;

      pattern.lastIndex = 0;
      const fragment = document.createDocumentFragment();
      let lastIndex = 0;
      let match;

      while ((match = pattern.exec(text)) !== null) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
        const label = normalizeLabel(match[1]);
        const button = document.createElement("button");
        button.type = "button";
        button.className = "smart-flashcard-link";
        button.textContent = label;
        button.addEventListener("click", () => this.openCard(label, sourcePath));
        fragment.appendChild(button);
        lastIndex = match.index + match[0].length;
      }

      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
      node.parentNode.replaceChild(fragment, node);
    }
  }

  getOrCreateCard(label, sourcePath = null) {
    const normalized = normalizeLabel(label);
    const id = getCardId(normalized);
    if (!this.data.cards[id]) {
      this.data.cards[id] = createEmptyCard(normalized);
      this.saveStore();
    }
    if (sourcePath && !this.data.cards[id].sourcePath) {
      this.data.cards[id].sourcePath = sourcePath;
      this.saveStore();
    }
    return this.data.cards[id];
  }

  async saveCard(card) {
    card.updatedAt = new Date().toISOString();
    card.folder = normalizeLabel(card.folder || DEFAULT_FOLDER) || DEFAULT_FOLDER;
    this.data.cards[card.id] = card;
    this.addFolder(card.folder);
    await this.saveStore();
  }

  async deleteCard(id) {
    delete this.data.cards[id];
    await this.saveStore();
  }

  async reviewCard(id, rating) {
    const card = this.data.cards[id];
    if (!card) return;

    const settings = this.data.settings;
    const multiplier = Math.max(1, Math.round(card.intervalDays * card.ease));
    let nextInterval = settings.goodIntervalDays;

    if (rating === "hard") {
      card.ease = Math.max(1.3, card.ease - 0.2);
      nextInterval = settings.hardIntervalDays;
    }

    if (rating === "good") {
      card.ease = Math.min(3.2, card.ease + 0.05);
      nextInterval = Math.max(settings.goodIntervalDays, multiplier);
      card.correctCount += 1;
    }

    if (rating === "easy") {
      card.ease = Math.min(3.5, card.ease + 0.15);
      nextInterval = Math.max(settings.easyIntervalDays, multiplier + settings.easyIntervalDays);
      card.correctCount += 1;
    }

    card.reviewCount += 1;
    card.intervalDays = nextInterval;
    card.lastReviewedAt = new Date().toISOString();
    card.nextReviewAt = addDays(nextInterval);
    card.updatedAt = new Date().toISOString();
    await this.saveStore();
  }

  async loadStore() {
    const fallback = cloneDefaultData();
    let store = fallback;

    try {
      const oldData = (await this.loadData()) || {};
      if (await this.app.vault.adapter.exists(FLASHCARD_STORE_PATH)) {
        const raw = await this.app.vault.adapter.read(FLASHCARD_STORE_PATH);
        store = Object.assign(fallback, oldData, JSON.parse(raw));
      } else {
        store = Object.assign(fallback, oldData);
        await this.app.vault.adapter.write(FLASHCARD_STORE_PATH, JSON.stringify(store, null, 2));
      }
    } catch (error) {
      console.error("Impossible de charger les flashcards", error);
      new Notice(this.t("loadError", { path: FLASHCARD_STORE_PATH }));
    }

    return store;
  }

  async saveStore() {
    await this.app.vault.adapter.write(FLASHCARD_STORE_PATH, JSON.stringify(this.data, null, 2));
    await this.saveData({ settings: this.data.settings });
  }

  async exportMarkdown() {
    await this.app.vault.adapter.write(FLASHCARD_EXPORT_PATH, cardsToExportMarkdown(this.data));
  }

  async exportAnki() {
    try {
      const electron = typeof window !== "undefined" && window.require ? window.require("electron") : require("electron");
      const dialog = electron.remote?.dialog || electron.dialog;
      const fs = require("fs");

      if (!dialog?.showSaveDialog) {
        new Notice(this.t("exportAnkiUnavailable"));
        return null;
      }

      const result = await dialog.showSaveDialog({
        title: this.t("exportAnkiTitle"),
        defaultPath: ANKI_EXPORT_PATH,
        filters: [{ name: "Text", extensions: ["txt"] }]
      });

      if (result.canceled || !result.filePath) return null;

      fs.writeFileSync(result.filePath, cardsToAnkiText(this.data), "utf8");
      return result.filePath;
    } catch (error) {
      console.error("Impossible d'exporter vers Anki", error);
      new Notice(this.t("exportAnkiUnavailable"));
      return null;
    }
  }

  addFolder(folder) {
    const normalized = normalizeLabel(folder || DEFAULT_FOLDER) || DEFAULT_FOLDER;
    if (!this.data.folders) this.data.folders = [DEFAULT_FOLDER];
    if (!this.data.folders.includes(normalized)) this.data.folders.push(normalized);
  }

  async deleteFolder(folder) {
    const normalized = normalizeLabel(folder);
    if (!normalized || normalized === DEFAULT_FOLDER) return;
    Object.values(this.data.cards).forEach((card) => {
      if ((card.folder || DEFAULT_FOLDER) === normalized) {
        card.folder = DEFAULT_FOLDER;
        card.updatedAt = new Date().toISOString();
      }
    });
    this.data.folders = (this.data.folders || []).filter((name) => name !== normalized);
    this.addFolder(DEFAULT_FOLDER);
    await this.saveStore();
  }

  getDueCards() {
    const now = new Date();
    return Object.values(this.data.cards)
      .filter((card) => !card.nextReviewAt || new Date(card.nextReviewAt) <= now)
      .sort((a, b) => new Date(a.nextReviewAt || 0) - new Date(b.nextReviewAt || 0));
  }

  openCard(label, sourcePath = null) {
    new FlashcardModal(this.app, this, label, sourcePath).open();
  }

  openLibrary() {
    new FlashcardLibraryModal(this.app, this).open();
  }

  async openSourceNote(card) {
    if (!card.sourcePath) {
      new Notice(this.t("sourceMissing"));
      return;
    }
    const file = this.app.vault.getAbstractFileByPath(card.sourcePath);
    if (!file) {
      new Notice(this.t("sourceMissing"));
      return;
    }
    await this.app.workspace.getLeaf(false).openFile(file);
  }

  language() {
    return this.data?.settings?.language || "fr";
  }

  t(key, vars) {
    return translate(this.language(), key, vars);
  }
};
