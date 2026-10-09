/**
 * One-off data migration: monetary columns from numeric pounds (499.99) to
 * integer pence (49999), and promotion.discount_rate split into percent_off /
 * amount_off.
 *
 * Run BEFORE `db:push`. drizzle-kit would otherwise cast numeric -> integer
 * without multiplying by 100, turning £499.99 into 500 pence.
 *
 *   npm run db:migrate:money -w @repo/db            # apply
 *   npm run db:migrate:money -w @repo/db -- --dry-run
 *
 * Safe to re-run: columns that are already integer are skipped. Everything
 * runs in one transaction, original values are copied to backup tables first
 * (schema money_backup, which drizzle-kit leaves alone), and per-column totals
 * are verified before commit.
 */
import pg from "pg";

const MONEY_COLUMNS: Record<string, string[]> = {
  product: ["base_price"],
  customization_option: ["price_delta"],
  product_configuration: ["final_price"],
  product_item: ["price"],
  shop_order: [
    "total",
    "subtotal",
    "discount_total",
    "shipping_total",
    "export_vat_relief",
    "vat_total",
  ],
  order_items: ["price_at_purchase", "unit_price"],
  shopping_cart_item: ["price"],
  refund_request: ["refund_amount"],
  promotion: ["min_order_amount", "max_discount_amount"],
};

// Columns that have a zero default after migration (all others: no default)
const ZERO_DEFAULT = new Set([
  "customization_option.price_delta",
  "shop_order.discount_total",
  "shop_order.shipping_total",
  "shop_order.export_vat_relief",
  "shop_order.vat_total",
]);

const dryRun = process.argv.includes("--dry-run");
const ident = (name: string) => `"${name.replace(/"/g, '""')}"`;

async function columnType(
  client: pg.PoolClient,
  table: string,
  column: string,
) {
  const { rows } = await client.query<{ data_type: string }>(
    `select data_type from information_schema.columns
     where table_schema = current_schema() and table_name = $1 and column_name = $2`,
    [table, column],
  );
  return rows[0]?.data_type ?? null;
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL missing");
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.DATABASE_SSL === "false"
        ? false
        : { rejectUnauthorized: false },
    max: 1,
  });
  const client = await pool.connect();

  try {
    await client.query("begin");
    await client.query("create schema if not exists money_backup");
    let changed = 0;

    for (const [table, columns] of Object.entries(MONEY_COLUMNS)) {
      const pending: string[] = [];
      for (const column of columns) {
        const type = await columnType(client, table, column);
        if (type === null)
          console.log(`  skip ${table}.${column}: column does not exist`);
        else if (type !== "numeric")
          console.log(`  skip ${table}.${column}: already ${type}`);
        else pending.push(column);
      }
      if (!pending.length) continue;

      // Back up original values, keyed by id
      await client.query(
        `create table if not exists money_backup.${ident(table)} as
         select id, ${pending.map(ident).join(", ")}, now() as backed_up_at
         from ${ident(table)}`,
      );

      for (const column of pending) {
        const col = ident(column);
        const before = await client.query<{
          rows: number;
          pence: string;
          fractional: number;
        }>(
          `select count(${col})::int as rows,
                  coalesce(sum(round(${col} * 100)), 0)::text as pence,
                  count(*) filter (where ${col} * 100 <> round(${col} * 100))::int as fractional
           from ${ident(table)}`,
        );
        const { rows, pence, fractional } = before.rows[0]!;
        if (fractional > 0) {
          throw new Error(
            `${table}.${column}: ${fractional} value(s) have fractions of a penny`,
          );
        }

        await client.query(
          `alter table ${ident(table)} alter column ${col} drop default`,
        );
        await client.query(
          `alter table ${ident(table)} alter column ${col} type integer using round(${col} * 100)::integer`,
        );
        if (ZERO_DEFAULT.has(`${table}.${column}`)) {
          await client.query(
            `update ${ident(table)} set ${col} = 0 where ${col} is null`,
          );
          await client.query(
            `alter table ${ident(table)} alter column ${col} set default 0`,
          );
          await client.query(
            `alter table ${ident(table)} alter column ${col} set not null`,
          );
        }

        const after = await client.query<{ pence: string }>(
          `select coalesce(sum(${col}), 0)::text as pence from ${ident(table)}`,
        );
        if (after.rows[0]!.pence !== pence) {
          throw new Error(
            `${table}.${column}: total changed (${pence} -> ${after.rows[0]!.pence})`,
          );
        }
        console.log(
          `  ${table}.${column}: ${rows} value(s) -> pence, total ${pence}p verified`,
        );
        changed++;
      }
    }

    // promotion.discount_rate meant a percentage or pounds depending on type
    if ((await columnType(client, "promotion", "discount_rate")) !== null) {
      await client.query(`create table if not exists money_backup.promotion_discount as
                          select id, type, discount_rate, now() as backed_up_at from promotion`);
      await client.query(
        `alter table promotion add column if not exists percent_off numeric(5,2)`,
      );
      await client.query(
        `alter table promotion add column if not exists amount_off integer`,
      );
      const split = await client.query(`
        update promotion set
          percent_off = case when type = 'percentage' then discount_rate end,
          amount_off  = case when type = 'fixed_amount' then round(discount_rate * 100)::integer end`);
      const invalid = await client.query<{ id: number; code: string }>(`
        select id, code from promotion
        where (type = 'percentage' and not (percent_off > 0 and percent_off <= 100))
           or (type = 'fixed_amount' and not (amount_off > 0))`);
      if (invalid.rows.length) {
        throw new Error(
          `promotions with an invalid discount: ${invalid.rows.map((r) => `#${r.id} ${r.code}`).join(", ")}`,
        );
      }
      await client.query(`alter table promotion drop column discount_rate`);
      console.log(
        `  promotion.discount_rate -> percent_off / amount_off (${split.rowCount} row(s))`,
      );
      changed++;
    } else {
      console.log("  skip promotion.discount_rate: already split");
    }

    if (dryRun) {
      await client.query("rollback");
      console.log(`\nDry run: ${changed} change(s) verified and rolled back.`);
    } else {
      await client.query("commit");
      console.log(
        `\nCommitted ${changed} change(s). Originals are backed up in schema money_backup.`,
      );
    }
  } catch (error) {
    await client.query("rollback");
    console.error(
      "\nMigration failed and was rolled back:",
      (error as Error).message,
    );
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
