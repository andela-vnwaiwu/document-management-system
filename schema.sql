-- Database: dms-vault


CREATE DATABASE dmsvault;

CREATE TABLE `Roles` (
	`id` INT NOT NULL,
	`title` varchar(128) NOT NULL UNIQUE,
	PRIMARY KEY (`id`)
);

CREATE TABLE `Users` (
	`id` INT NOT NULL,
	`username` varchar(128) NOT NULL UNIQUE,
	`firstName` varchar(128) NOT NULL,
	`lastName` varchar(128) NOT NULL,
	`email` varchar(128) NOT NULL UNIQUE,
	`password` varchar(256) NOT NULL,
	`RoleId` INT NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `Documents` (
	`id` INT NOT NULL,
	`title` varchar(256) NOT NULL,
	`content` TEXT NOT NULL,
	`isPublic` BOOLEAN DEFAULT true,
	`OwnerId` INT NOT NULL,
	PRIMARY KEY (`id`)
);

ALTER TABLE `Users` ADD CONSTRAINT `Users_fk0` FOREIGN KEY (`RoleId`) REFERENCES `Roles`(`id`);

ALTER TABLE `Documents` ADD CONSTRAINT `Documents_fk0` FOREIGN KEY (`OwnerId`) REFERENCES `Users`(`id`) ON DELETE CASCADE;
