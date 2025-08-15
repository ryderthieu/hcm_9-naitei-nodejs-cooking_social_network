-- AlterTable
ALTER TABLE `message` MODIFY `type` ENUM('MEDIA', 'POST', 'TEXT', 'RECIPE', 'SYSTEM') NOT NULL;
