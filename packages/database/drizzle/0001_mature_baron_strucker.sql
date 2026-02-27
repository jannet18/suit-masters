CREATE TABLE "idempotency_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"user_id" integer NOT NULL,
	"order_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "idempotency_keys_key_unique" UNIQUE("key")
);
--> statement-breakpoint
DROP TABLE "promotion_category" CASCADE;--> statement-breakpoint
DROP TABLE "promotion" CASCADE;