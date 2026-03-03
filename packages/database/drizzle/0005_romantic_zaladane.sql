CREATE TABLE "order_measurements" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_item_id" integer NOT NULL,
	"unit" varchar(5) NOT NULL,
	"height" numeric(5, 2) NOT NULL,
	"chest" numeric(5, 2) NOT NULL,
	"waist" numeric(5, 2) NOT NULL,
	"hips" numeric(5, 2) NOT NULL,
	"inseam" numeric(5, 2) NOT NULL,
	"shoulder" numeric(5, 2) NOT NULL,
	"profile_name" varchar(64)
);
--> statement-breakpoint
ALTER TABLE "collection" DROP CONSTRAINT "collection_category_id_product_category_id_fk";
--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "selected_options" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "selected_options" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "shop_order" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "customization_option" ALTER COLUMN "price_delta" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "user_measurements" ALTER COLUMN "chest" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_measurements" ALTER COLUMN "waist" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "final_price" numeric(12, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "user_measurements" ADD COLUMN "unit" varchar(5) NOT NULL;--> statement-breakpoint
ALTER TABLE "user_measurements" ADD COLUMN "height" numeric(5, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "user_measurements" ADD COLUMN "hips" numeric(5, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "user_measurements" ADD COLUMN "inseam" numeric(5, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "user_measurements" ADD COLUMN "shoulder" numeric(5, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "order_measurements" ADD CONSTRAINT "order_measurements_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection" DROP COLUMN "category_id";--> statement-breakpoint
ALTER TABLE "shop_order" DROP COLUMN "ordered_items";--> statement-breakpoint
ALTER TABLE "shop_order" DROP COLUMN "order_date";--> statement-breakpoint
ALTER TABLE "user_measurements" DROP COLUMN "sleeve";