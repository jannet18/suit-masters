CREATE TYPE "public"."order_status" AS ENUM('pending', 'paid', 'processing', 'production', 'quality_check', 'shipped', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TABLE "idempotency_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"user_id" integer NOT NULL,
	"order_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "idempotency_keys_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "cart_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"configuration_id" uuid NOT NULL,
	"measurement_profile_id" uuid,
	"qty" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customization_group" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"name" varchar(64) NOT NULL,
	"is_required" boolean DEFAULT true,
	"display_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "customization_option" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_id" integer NOT NULL,
	"name" varchar(128) NOT NULL,
	"price_delta" numeric(12, 2) DEFAULT '0.00',
	"thumbnail_url" varchar(255),
	"factory_code" varchar(32)
);
--> statement-breakpoint
CREATE TABLE "fabric" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"sku" varchar(64) NOT NULL,
	"composition" varchar(255),
	"weight" varchar(64),
	"brand" varchar(64),
	"image_url" varchar(255),
	"is_active" boolean DEFAULT true,
	CONSTRAINT "fabric_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "order_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"fabric_snapshot" jsonb NOT NULL,
	"configuration_snapshot" jsonb NOT NULL,
	"measurement_snapshot" jsonb NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"quantity" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"fabric_id" integer NOT NULL,
	"name" varchar(128) NOT NULL,
	"slug" varchar(128) NOT NULL,
	"base_price" numeric(12, 2) NOT NULL,
	"description" text,
	"main_image" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "product_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "product_category" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"slug" varchar(128) NOT NULL,
	"parent_id" integer,
	CONSTRAINT "product_category_slug_unique" UNIQUE("slug")
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
CREATE TABLE "shop_order" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"total" numeric(12, 2) NOT NULL,
	"status" varchar(64) NOT NULL,
	"shipping_name" varchar(255) NOT NULL,
	"shipping_email" varchar(255) NOT NULL,
	"shipping_phone" varchar(32) NOT NULL,
	"shipping_address_line1" varchar(255) NOT NULL,
	"shipping_address_line2" varchar(255),
	"shipping_city" varchar(128) NOT NULL,
	"shipping_region" varchar(128) NOT NULL,
	"shipping_postal_code" varchar(16) NOT NULL,
	"shipping_country" varchar(64) NOT NULL
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
CREATE TABLE "user_measurement_profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"profile_name" varchar(64) NOT NULL,
	"unit" varchar(8) NOT NULL,
	"height" numeric(5, 2),
	"weight" numeric(5, 2),
	"neck" numeric(5, 2),
	"chest" numeric(5, 2),
	"shoulder" numeric(5, 2),
	"waist" numeric(5, 2),
	"hip" numeric(5, 2),
	"sleeve" numeric(5, 2),
	"inseam" numeric(5, 2),
	"is_default" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_name" varchar NOT NULL,
	"sku" varchar,
	"customization_snapshot" jsonb,
	"measurement_snapshot" jsonb,
	"price_at_purchase" numeric(12, 2) NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"quantity" integer NOT NULL
);
--> statement-breakpoint
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
CREATE TABLE "user_measurements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"profile_name" varchar(64) NOT NULL,
	"unit" varchar(5) NOT NULL,
	"height" numeric(5, 2) NOT NULL,
	"chest" numeric(5, 2) NOT NULL,
	"waist" numeric(5, 2) NOT NULL,
	"hips" numeric(5, 2) NOT NULL,
	"inseam" numeric(5, 2) NOT NULL,
	"shoulder" numeric(5, 2) NOT NULL,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_user_id_site_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."site_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_configuration_id_product_configuration_id_fk" FOREIGN KEY ("configuration_id") REFERENCES "public"."product_configuration"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_measurement_profile_id_user_measurement_profile_id_fk" FOREIGN KEY ("measurement_profile_id") REFERENCES "public"."user_measurement_profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customization_group" ADD CONSTRAINT "customization_group_category_id_product_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customization_option" ADD CONSTRAINT "customization_option_group_id_customization_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."customization_group"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_order_id_shop_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."shop_order"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_category_id_product_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_fabric_id_fabric_id_fk" FOREIGN KEY ("fabric_id") REFERENCES "public"."fabric"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_configuration" ADD CONSTRAINT "product_configuration_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_order" ADD CONSTRAINT "shop_order_user_id_site_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."site_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_measurement_profile" ADD CONSTRAINT "user_measurement_profile_user_id_site_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."site_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_shop_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."shop_order"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_measurements" ADD CONSTRAINT "order_measurements_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_method" ADD CONSTRAINT "payment_method_payment_type_id_payments_type_id_fk" FOREIGN KEY ("payment_type_id") REFERENCES "public"."payments_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_measurements" ADD CONSTRAINT "user_measurements_user_id_site_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."site_users"("id") ON DELETE no action ON UPDATE no action;