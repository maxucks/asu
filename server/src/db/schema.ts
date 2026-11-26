import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"

export const languages = sqliteTable("languages", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull().default("🌐"),
})

export const cases = sqliteTable(
  "cases",
  {
    id: text("id").primaryKey(),
    languageId: text("language_id")
      .notNull()
      .references(() => languages.id, { onDelete: "cascade" }),
    value: text("value").notNull(),
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
    tileColor: text("tile_color"),
    sortOrder: integer("sort_order").notNull(),
    createdAt: text("created_at").notNull(),
    hiddenFromPractice: integer("hidden_from_practice", { mode: "boolean" }).notNull(),
  },
  (table) => [index("associations_case_id_idx").on(table.caseId)],
)

export const categories = sqliteTable(
  "categories",
  {
    id: text("id").primaryKey(),
    languageId: text("language_id")
      .notNull()
      .references(() => languages.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
  },
  (table) => [
    index("categories_language_id_idx").on(table.languageId),
    uniqueIndex("categories_language_name_uq").on(table.languageId, table.name),
  ],
)

export const caseCategories = sqliteTable(
  "case_categories",
  {
    caseId: text("case_id")
      .notNull()
      .references(() => cases.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.caseId, table.categoryId] }),
    index("case_categories_case_id_idx").on(table.caseId),
    index("case_categories_category_id_idx").on(table.categoryId),
  ],
)

export const studyRecords = sqliteTable("study_records", {
  caseId: text("case_id")
    .primaryKey()
    .references(() => cases.id, { onDelete: "cascade" }),
  reviewStatus: text("review_status").notNull(),
  dueAt: text("due_at"),
  schedulingStrengthNumeric: integer("scheduling_strength_numeric").notNull().default(0),
  repetitionsCount: integer("repetitions_count").notNull().default(0),
  lastRepetitionAt: text("last_repetition_at"),
  lastGradeNumeric: integer("last_grade_numeric"),
})
