-- AlterTable
ALTER TABLE "Lead" ADD COLUMN "lastInteraction" DATETIME;

-- AlterTable
ALTER TABLE "LeadLog" ADD COLUMN "userId" TEXT;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN "mediaUrl" TEXT;
ALTER TABLE "Message" ADD COLUMN "status" TEXT DEFAULT 'sent';
ALTER TABLE "Message" ADD COLUMN "whatsappId" TEXT;
