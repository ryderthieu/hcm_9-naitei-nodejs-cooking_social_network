/*
  Warnings:

  - The primary key for the `PostShare` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `id` to the `PostShare` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `PostShare` DROP FOREIGN KEY `PostShare_postId_fkey`;
ALTER TABLE `PostShare` DROP FOREIGN KEY `PostShare_userId_fkey`;

ALTER TABLE `PostShare` DROP PRIMARY KEY;

ALTER TABLE `PostShare`
    ADD COLUMN `id` INT NOT NULL AUTO_INCREMENT FIRST,
    ADD PRIMARY KEY (`id`);

ALTER TABLE `PostShare`
    ADD CONSTRAINT `PostShare_postId_fkey`
        FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE CASCADE,
    ADD CONSTRAINT `PostShare_userId_fkey`
        FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE;
