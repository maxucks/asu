# Schema sketch (legacy)

```ts
export type Scope = (typeof SCOPE_VALUES)[number];
export type RelationDirection = (typeof RELATION_DIR_VALUES)[number];

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name"),
  username: text("username").notNull().unique(),
});

export const languages = sqliteTable("languages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
});

export const words = sqliteTable("words", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  languageId: integer("language_id")
    .notNull()
    .references(() => languages.id, { onDelete: "cascade" }),
  value: text("value").notNull(),
});

export const usecases = sqliteTable(
  "usecases",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    scope: text("scope", { enum: SCOPE_VALUES }).notNull(),
    userId: integer("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    parentId: integer("parent_id").references(
      (): AnySQLiteColumn => usecases.id,
      {
        onDelete: "set null",
      },
    ),
    imgUrl: text("img_url"),
    description: text("description"),
    meaning: text("meaning"),
    rudeness: integer("rudeness").notNull().default(0),
    formality: integer("formality").notNull().default(0),
    connotation: integer("connotation").notNull().default(0),
  },
  (t) => [
    check(
      "usecase_scope_rules",
      sql`(
        ${t.scope} = 'app'
        AND ${t.userId} IS NULL
        AND ${t.parentId} IS NULL
      ) OR (
        ${t.scope} = 'user'
        AND ${t.userId} IS NOT NULL
      )`,
    ),
  ],
);

export const wordsUsecases = sqliteTable(
  "words_usecases",
  {
    wordId: integer("word_id")
      .notNull()
      .references(() => words.id, { onDelete: "restrict" }),
    usecaseId: integer("usecase_id")
      .notNull()
      .references(() => usecases.id, { onDelete: "cascade" }),
    usedAs: text("used_as"),
  },
  (t) => [primaryKey({ columns: [t.wordId, t.usecaseId] })],
);

export const examples = sqliteTable("examples", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  usecaseId: integer("usecase_id")
    .notNull()
    .references(() => usecases.id, { onDelete: "cascade" }),
  value: text("value").notNull(),
});

export const relations = sqliteTable(
  "relations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    scope: text("scope", { enum: SCOPE_VALUES }).notNull(),
    userId: integer("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    name: text("name").notNull(),
    direction: text("direction", { enum: RELATION_DIR_VALUES }).notNull(),
  },
  (t) => [
    uniqueIndex("idx_relations_scope_user_name").on(t.scope, t.userId, t.name),
    check(
      "relations_scope_rules",
      sql`(
        ${t.scope} = 'app' AND ${t.userId} IS NULL
      ) OR (
        ${t.scope} = 'user' AND ${t.userId} IS NOT NULL
      )`,
    ),
  ],
);

export const usecasesRelations = sqliteTable(
  "usecases_relations",
  {
    leftUsecaseId: integer("left_usecase_id")
      .notNull()
      .references(() => usecases.id, { onDelete: "cascade" }),
    rightUsecaseId: integer("right_usecase_id")
      .notNull()
      .references(() => usecases.id, { onDelete: "cascade" }),
    relationId: integer("relation_id")
      .notNull()
      .references(() => relations.id, { onDelete: "restrict" }),
  },
  (t) => [
    primaryKey({ columns: [t.leftUsecaseId, t.rightUsecaseId, t.relationId] }),
  ],
);

export const notes = sqliteTable("notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  content: text("content").notNull(),
});

export const usecaseNotes = sqliteTable(
  "usecase_notes",
  {
    usecaseId: integer("usecase_id")
      .notNull()
      .references(() => usecases.id, { onDelete: "restrict" }),
    noteId: integer("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.usecaseId, t.noteId] })],
);

export const vocabulary = sqliteTable(
  "vocabulary",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    usecaseId: integer("usecase_id")
      .notNull()
      .references(() => usecases.id, { onDelete: "cascade" }),
    score: integer("score").notNull().default(0),
    lastRepetitionDate: integer("last_repetition_date", { mode: "timestamp" }),
    repetitionsCount: integer("repetitions_count").notNull().default(0),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.usecaseId] }),
    check("vocab_score_non_negative", sql`${t.score} >= 0`),
    check("vocab_reps_non_negative", sql`${t.repetitionsCount} >= 0`),
    index("vocab_user_repetition_score_idx").on(
      t.userId,
      t.lastRepetitionDate,
      t.score,
    ),
  ],
);
```

This is the scheme from previous idea

# Terminology

- Word - atomic unit
- Usecase - specific use of the word in a context
- Usecase relation - shows a relation between different usecases (e.g one could be a synonym of another)
- Example/Context - a sentence (sample) showing the usecase usage
- Language - a collection of words/usecases and everything connected to them. Also I'm considering adding some specific modules for some languages (e.g. japanese symbols drilling mini-app for Japanese)

# Idea

An app for learning new words by assosiations. There are 2 different parts for now - vocabulary and practice. Vocabulary is the thing describes in precious scheme, but it need to be refined for the current idea. Practice part is a framework for remembering these words (usecases)

Basically it's a user-defined vocabulary containing the usecases of the words. User can manage it, add different languages, group them into collections, add contexts, notes, meanings

Now the second part, the interesting part. It's something like anki. But anki is a text based vacuum learning where this app gives all kind of tools for users to add different assosiations to the usecases. It can be a drawing, image from the internet, voice note, text note helping to remember, text description of the meaning, a song fragment audio, video hint and so on. There are so many tools yet to be thought of. The main flow of the practice part is the same as anki, so the core should contain SRS logic. The main difference is that user could attach assosiasions right during the sesstion and instead of meaning or just text description they will see a bunch of assosiations to try to remember the original word.

# Important

- There is no connection between words and usecases for now as the only reason of its separation is specifying their role in the context (e.g. "answer" is used as a noun in a context "The answer is 42"). If there are different things to consider that can affect my descision of removing word entity, please, tell me about.

```

```
