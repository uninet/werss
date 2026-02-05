-- CreateTable
CREATE TABLE "bloggers" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "avatar" VARCHAR(500),
    "description" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_checked_at" TIMESTAMP(3),
    "fetch_status" VARCHAR(20) DEFAULT 'pending',
    "fetch_error" TEXT,
    "fetch_fail_count" INTEGER NOT NULL DEFAULT 0,
    "last_fetch_success_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bloggers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contents" (
    "id" SERIAL NOT NULL,
    "blogger_id" INTEGER NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "content" TEXT,
    "url" VARCHAR(1000) NOT NULL,
    "published_at" TIMESTAMP(3),
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_notified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "email" VARCHAR(100),
    "avatar" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configs" (
    "id" SERIAL NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "value" TEXT NOT NULL,
    "description" VARCHAR(500),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "read_history" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "content_id" INTEGER NOT NULL,
    "read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "read_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_subscriptions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "blogger_id" INTEGER NOT NULL,
    "subscribed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rss_market" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "description" VARCHAR(1000),
    "category" VARCHAR(50) NOT NULL,
    "icon" VARCHAR(500),
    "language" VARCHAR(10),
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "subscriber_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rss_market_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_logs" (
    "id" SERIAL NOT NULL,
    "send_date" TIMESTAMP(3) NOT NULL,
    "content_count" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bloggers_url_key" ON "bloggers"("url");

-- CreateIndex
CREATE INDEX "bloggers_type_idx" ON "bloggers"("type");

-- CreateIndex
CREATE INDEX "bloggers_is_active_idx" ON "bloggers"("is_active");

-- CreateIndex
CREATE INDEX "bloggers_fetch_status_idx" ON "bloggers"("fetch_status");

-- CreateIndex
CREATE INDEX "bloggers_created_at_idx" ON "bloggers"("created_at");

-- CreateIndex
CREATE INDEX "contents_blogger_id_idx" ON "contents"("blogger_id");

-- CreateIndex
CREATE INDEX "contents_published_at_idx" ON "contents"("published_at");

-- CreateIndex
CREATE INDEX "contents_fetched_at_idx" ON "contents"("fetched_at");

-- CreateIndex
CREATE INDEX "contents_is_notified_idx" ON "contents"("is_notified");

-- CreateIndex
CREATE INDEX "contents_blogger_id_is_notified_idx" ON "contents"("blogger_id", "is_notified");

-- CreateIndex
CREATE INDEX "contents_blogger_id_published_at_idx" ON "contents"("blogger_id", "published_at");

-- CreateIndex
CREATE UNIQUE INDEX "contents_blogger_id_url_key" ON "contents"("blogger_id", "url");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "configs_key_key" ON "configs"("key");

-- CreateIndex
CREATE INDEX "read_history_user_id_idx" ON "read_history"("user_id");

-- CreateIndex
CREATE INDEX "read_history_content_id_idx" ON "read_history"("content_id");

-- CreateIndex
CREATE UNIQUE INDEX "read_history_user_id_content_id_key" ON "read_history"("user_id", "content_id");

-- CreateIndex
CREATE INDEX "user_subscriptions_user_id_idx" ON "user_subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "user_subscriptions_blogger_id_idx" ON "user_subscriptions"("blogger_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_subscriptions_user_id_blogger_id_key" ON "user_subscriptions"("user_id", "blogger_id");

-- CreateIndex
CREATE INDEX "rss_market_category_idx" ON "rss_market"("category");

-- CreateIndex
CREATE INDEX "rss_market_is_featured_idx" ON "rss_market"("is_featured");

-- CreateIndex
CREATE INDEX "rss_market_subscriber_count_idx" ON "rss_market"("subscriber_count");

-- CreateIndex
CREATE INDEX "email_logs_send_date_idx" ON "email_logs"("send_date");

-- CreateIndex
CREATE INDEX "email_logs_status_idx" ON "email_logs"("status");

-- AddForeignKey
ALTER TABLE "contents" ADD CONSTRAINT "contents_blogger_id_fkey" FOREIGN KEY ("blogger_id") REFERENCES "bloggers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
