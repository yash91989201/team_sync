CREATE TABLE `salary_component` (
	`id` varchar(24) NOT NULL,
	`name` varchar(256),
	CONSTRAINT `salary_component_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `leave_type` ADD `paid_leave` boolean DEFAULT false;