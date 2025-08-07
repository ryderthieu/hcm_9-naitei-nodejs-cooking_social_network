-- AlterTable
ALTER TABLE `PostComment` ADD COLUMN `repliesCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `replyOf` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `PostComment` ADD CONSTRAINT `PostComment_replyOf_fkey` FOREIGN KEY (`replyOf`) REFERENCES `PostComment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
