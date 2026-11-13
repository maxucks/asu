import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const languages = sqliteTable("languages", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
})

export const cases = sqliteTable(
  "cases",
  {
    id: text("id").primaryKey(),
    languageId: text("language_id")
      .notNull()
      .references(() => languages.id, { onDelete: "cascade" }),
    lemmaText: text("lemma_text").notNull(),
    meaning: text("meaning"),
  },
  (table) => [index("cases_language_id_idx").on(table.languageId)],
)

export const associations = sqliteTable(
  "associations",
  {
    id: text("id").primaryKey(),
    caseId: text("case_id")
      .notNull()
      .references(() => cases.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    contentRef: text("content_ref").notNull(),
    sortOrder: integer("sort_order").notNull(),
    createdAt: text("created_at").notNull(),
    hiddenFromPractice: integer("hidden_from_practice", { mode: "boolean" }).notNull(),
  },
  (table) => [index("associations_case_id_idx").on(table.caseId)],
)

export const studyRecords = sqliteTable("study_records", {
  caseId: text("case_id")
    .primaryKey()
    .references(() => cases.id, { onDelete: "cascade" }),
  reviewStatus: text("review_status").notNull(),
  dueAt: text("due_at"),
})
