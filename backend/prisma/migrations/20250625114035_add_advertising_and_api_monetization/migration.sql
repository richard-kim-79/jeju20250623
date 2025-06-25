-- AlterTable
ALTER TABLE "api_keys" ADD COLUMN     "planId" INTEGER;

-- CreateTable
CREATE TABLE "advertisements" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "linkUrl" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "maxClicks" INTEGER,
    "maxImpressions" INTEGER,
    "advertiserId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "advertisements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad_stats" (
    "id" SERIAL NOT NULL,
    "advertisementId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "userId" INTEGER,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ad_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_key_usage" (
    "id" SERIAL NOT NULL,
    "apiKeyId" INTEGER NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "responseTime" INTEGER,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_key_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_key_plans" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "monthlyLimit" INTEGER NOT NULL,
    "dailyLimit" INTEGER NOT NULL,
    "rateLimit" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "features" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_key_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_key_subscriptions" (
    "id" SERIAL NOT NULL,
    "apiKeyId" INTEGER NOT NULL,
    "planId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_key_subscriptions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_planId_fkey" FOREIGN KEY ("planId") REFERENCES "api_key_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertisements" ADD CONSTRAINT "advertisements_advertiserId_fkey" FOREIGN KEY ("advertiserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_stats" ADD CONSTRAINT "ad_stats_advertisementId_fkey" FOREIGN KEY ("advertisementId") REFERENCES "advertisements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_stats" ADD CONSTRAINT "ad_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_key_usage" ADD CONSTRAINT "api_key_usage_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "api_keys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_key_subscriptions" ADD CONSTRAINT "api_key_subscriptions_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "api_keys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_key_subscriptions" ADD CONSTRAINT "api_key_subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "api_key_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
