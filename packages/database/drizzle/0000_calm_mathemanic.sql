CREATE TABLE "shop_order" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"total" numeric(12, 2) NOT NULL,
	"order_date" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "shopping_cart_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"cart_id" integer NOT NULL,
	"product_item_id" integer NOT NULL,
	"configuration_id" uuid,
	"measurement_id" uuid,
	"qty" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shopping_cart" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_method" (
	"id" serial PRIMARY KEY NOT NULL,
	"payment_type_id" integer NOT NULL,
	"provider" varchar(128) NOT NULL,
	"account_number" varchar(128) NOT NULL,
	"expiry_date" varchar(32) NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments_type" (
	"id" serial PRIMARY KEY NOT NULL,
	"value" varchar(64) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customization_group" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"name" varchar(64) NOT NULL,
	"required" boolean DEFAULT true,
	"display_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customization_option" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_id" integer NOT NULL,
	"value" varchar(128) NOT NULL,
	"price_delta" numeric(12, 2) DEFAULT '0',
	"metadata" jsonb,
	"is_default" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"name" varchar(128) NOT NULL,
	"description" varchar(128) NOT NULL,
	"product_image" varchar(255) NOT NULL,
	"product_type" varchar(32) NOT NULL,
	"base_price" numeric(12, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_category" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_name" varchar(128) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_configuration" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" integer NOT NULL,
	"selected_options" jsonb NOT NULL,
	"final_price" numeric(12, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"sku" varchar(128) NOT NULL,
	"stock" integer NOT NULL,
	"price" numeric(12, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promotion_category" (
	"category_id" integer NOT NULL,
	"promotion_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promotion" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"description" varchar(128) NOT NULL,
	"discount_rate" numeric(12, 2) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_measurements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"profile_name" varchar(64) NOT NULL,
	"chest" numeric(5, 2),
	"sleeve" numeric(5, 2),
	"waist" numeric(5, 2),
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kinde_user_id" varchar NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar NOT NULL,
	"picture" varchar(1024) DEFAULT '',
	"roles" varchar DEFAULT 'CUSTOMER' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "site_users_kinde_user_id_unique" UNIQUE("kinde_user_id"),
	CONSTRAINT "site_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "shop_order" ADD CONSTRAINT "shop_order_user_id_site_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."site_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shopping_cart_item" ADD CONSTRAINT "shopping_cart_item_cart_id_shopping_cart_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."shopping_cart"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shopping_cart_item" ADD CONSTRAINT "shopping_cart_item_product_item_id_product_item_id_fk" FOREIGN KEY ("product_item_id") REFERENCES "public"."product_item"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shopping_cart_item" ADD CONSTRAINT "shopping_cart_item_configuration_id_product_configuration_id_fk" FOREIGN KEY ("configuration_id") REFERENCES "public"."product_configuration"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shopping_cart_item" ADD CONSTRAINT "shopping_cart_item_measurement_id_user_measurements_id_fk" FOREIGN KEY ("measurement_id") REFERENCES "public"."user_measurements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shopping_cart" ADD CONSTRAINT "shopping_cart_user_id_site_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."site_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_method" ADD CONSTRAINT "payment_method_payment_type_id_payments_type_id_fk" FOREIGN KEY ("payment_type_id") REFERENCES "public"."payments_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customization_group" ADD CONSTRAINT "customization_group_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customization_option" ADD CONSTRAINT "customization_option_group_id_customization_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."customization_group"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_category_id_product_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_item" ADD CONSTRAINT "product_item_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promotion_category" ADD CONSTRAINT "promotion_category_category_id_product_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promotion_category" ADD CONSTRAINT "promotion_category_promotion_id_promotion_id_fk" FOREIGN KEY ("promotion_id") REFERENCES "public"."promotion"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_measurements" ADD CONSTRAINT "user_measurements_user_id_site_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."site_users"("id") ON DELETE no action ON UPDATE no action;