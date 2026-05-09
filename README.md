# Flashlinks

Flashlinks is a plugin that turns custom `::links::` into intelligent flashcards.

Flashlinks est un plugin qui transforme des liens personnalisés `::comme ceci::` en flashcards intelligentes.

## English

### What it does

Write a flashcard link directly inside any note:

```markdown
The capital of France is Paris. ::Capital of France::
```

Flashlinks displays the link as `Capital of France`, without the `::`, and opens a review card when clicked.

Features:

- create flashcards from note text with the `::label::` syntax;
- edit the front and back of each card;
- flip cards by clicking or pressing Space;
- review with `Hard`, `Good`, and `Easy`;
- see review count, last review, and next review;
- return from a flashcard to its source note;
- organize cards with virtual folders that do not modify your vault structure;
- drag and drop cards between folders;
- render native Obsidian image embeds such as `![[image.png]]`;
- export all cards to Markdown;
- export all cards to an Anki-compatible tab-separated `.txt` file;
- switch the interface language between English and French.

### Installation

Copy this folder into your Obsidian vault:

```text
YourVault/.obsidian/plugins/flashlinks/
```

Then open Obsidian and enable `Flashlinks` from `Settings > Community plugins`.

### Commands

Flashlinks adds these commands to the command palette:

- `Create flashcard link from selection`
- `Review due flashcards`
- `Open flashcard library`

### Data

Flashcards are saved automatically in one JSON file at the root of your vault:

```text
smart-flashcards.json
```

The Markdown export creates:

```text
Flashcards.md
```

The Anki export opens a save dialog and creates a tab-separated text file:

```text
Flashcards-Anki.txt
```

Import it into Anki as a text file using tab as the field separator.

## Français

### Ce que fait le plugin

Dans une note, écris :

```markdown
La capitale de la France, c'est Paris. ::Capitale de la France::
```

Le texte `::Capitale de la France::` devient un lien flashcard cliquable affiché sous la forme `Capitale de la France`, sans les `::`. Au clic, Obsidian ouvre une carte.

Fonctionnalités :

- créer des flashcards depuis une note avec la syntaxe `::label::` ;
- modifier le recto et le verso ;
- retourner les cartes au clic ou avec la barre espace ;
- réviser avec `Difficile`, `Correct` et `Facile` ;
- voir le nombre de révisions, la dernière révision et la prochaine révision ;
- revenir à la note source depuis une flashcard ;
- organiser les cartes dans des dossiers virtuels qui ne modifient pas le coffre ;
- déplacer les cartes entre dossiers par glisser-déposer ;
- afficher les images natives Obsidian comme `![[image.png]]` ;
- exporter toutes les cartes en Markdown ;
- exporter toutes les cartes vers Anki avec un fichier `.txt` tabulé ;
- choisir la langue de l'interface entre français et anglais.

### Installation

Copie ce dossier dans ton coffre Obsidian :

```text
TonCoffre/.obsidian/plugins/flashlinks/
```

Puis ouvre Obsidian et active `Flashlinks` dans `Réglages > Modules communautaires`.

### Commandes

Flashlinks ajoute ces commandes dans la palette :

- `Créer un lien flashcard depuis la sélection`
- `Réviser les flashcards dues`
- `Ouvrir la bibliothèque de flashcards`

### Données

Les cartes sont sauvegardées automatiquement dans un fichier JSON unique à la racine du coffre :

```text
smart-flashcards.json
```

L'export Markdown crée :

```text
Flashcards.md
```

L'export Anki ouvre une fenêtre de sauvegarde et crée un fichier texte tabulé :

```text
Flashcards-Anki.txt
```

Dans Anki, importe ce fichier comme fichier texte avec le séparateur tabulation.
