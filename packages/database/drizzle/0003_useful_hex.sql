ALTER TABLE "collection" ADD COLUMN "category_id" varchar(128) NOT NULL;--> statement-breakpoint
ALTER TABLE "collection" ADD CONSTRAINT "collection_category_id_product_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection" DROP COLUMN "category_slug";