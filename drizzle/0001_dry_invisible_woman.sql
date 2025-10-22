CREATE TABLE `attendance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`boothId` int NOT NULL,
	`scannedAt` timestamp NOT NULL DEFAULT (now()),
	`scannedBy` int NOT NULL,
	CONSTRAINT `attendance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `booths` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`location` varchar(255),
	`adminId` int,
	`isActive` int unsigned NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `booths_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`phone` varchar(20),
	`major` varchar(255),
	`year` int,
	`qrCode` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `students_id` PRIMARY KEY(`id`),
	CONSTRAINT `students_studentId_unique` UNIQUE(`studentId`)
);
--> statement-breakpoint
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_studentId_students_id_fk` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_boothId_booths_id_fk` FOREIGN KEY (`boothId`) REFERENCES `booths`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_scannedBy_users_id_fk` FOREIGN KEY (`scannedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `booths` ADD CONSTRAINT `booths_adminId_users_id_fk` FOREIGN KEY (`adminId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;