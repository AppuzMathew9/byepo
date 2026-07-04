CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`userId` int NOT NULL,
	`action` enum('create','update','delete','toggle') NOT NULL,
	`resourceType` enum('flag','user','targeting') NOT NULL,
	`resourceId` int NOT NULL,
	`resourceName` varchar(255),
	`changes` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `featureFlags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`enabled` enum('true','false') NOT NULL DEFAULT 'false',
	`rolloutPercentage` decimal(5,2) NOT NULL DEFAULT '100',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `featureFlags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `flagTargetingRules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`flagId` int NOT NULL,
	`targetType` enum('organization','user') NOT NULL,
	`targetId` int NOT NULL,
	`enabled` enum('true','false') NOT NULL DEFAULT 'true',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `flagTargetingRules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organizations_id` PRIMARY KEY(`id`),
	CONSTRAINT `organizations_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('super_admin','org_admin','user') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `organizationId` int;--> statement-breakpoint
CREATE INDEX `idx_organizationId` ON `auditLogs` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_userId` ON `auditLogs` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_createdAt` ON `auditLogs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_organizationId` ON `featureFlags` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_org_name` ON `featureFlags` (`organizationId`,`name`);--> statement-breakpoint
CREATE INDEX `idx_flagId` ON `flagTargetingRules` (`flagId`);--> statement-breakpoint
CREATE INDEX `idx_target` ON `flagTargetingRules` (`targetType`,`targetId`);--> statement-breakpoint
CREATE INDEX `idx_organizationId` ON `users` (`organizationId`);