export const shorthands = undefined;

export const up = (pgm) => {
  // 1. Create categories table
  pgm.createTable("categories", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    name: {
      type: "TEXT",
      notNull: true,
    },
    createdAt: {
      type: "TIMESTAMPTZ",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updatedAt: {
      type: "TIMESTAMPTZ",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // 2. Add categoryId column to glosarium
  pgm.addColumn("glosarium", {
    categoryId: {
      type: "VARCHAR(50)",
      references: '"categories"',
      onDelete: "SET NULL",
    },
  });

  // 3. Migrate existing data
  // We'll generate temporary IDs for existing categories
  pgm.sql(`
    INSERT INTO categories (id, name)
    SELECT 'cat-' || floor(random() * 1000000)::text, category
    FROM (SELECT DISTINCT category FROM glosarium) as distinct_cats
    WHERE category IS NOT NULL;
  `);

  pgm.sql(`
    UPDATE glosarium
    SET "categoryId" = categories.id
    FROM categories
    WHERE glosarium.category = categories.name;
  `);
};

export const down = (pgm) => {
  pgm.dropColumn("glosarium", "categoryId");
  pgm.dropTable("categories");
};
