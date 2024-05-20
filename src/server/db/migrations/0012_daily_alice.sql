ALTER TABLE `regularization_date` MODIFY COLUMN `reason` varchar(1024) NOT NULL;--> statement-breakpoint
ALTER TABLE `regularization` ADD `remarks` varchar(1024) NOT NULL;