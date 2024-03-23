CREATE TABLE `session` (
	`id` varchar(256) NOT NULL,
	`expires_at` datetime NOT NULL,
	`user_id` varchar(256) NOT NULL,
	CONSTRAINT `session_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_profile` (
	`id` varchar(256) NOT NULL,
	`emp_id` varchar(256) NOT NULL,
	`joining_date` timestamp NOT NULL,
	`dept` varchar(128),
	`designation` varchar(128),
	`location` varchar(256),
	`salary` int,
	CONSTRAINT `user_profile_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(256) NOT NULL,
	`name` varchar(256) NOT NULL,
	`email` varchar(256) NOT NULL,
	`password` varchar(256) NOT NULL,
	`role` enum('ADMIN','EMPLOYEE') NOT NULL DEFAULT 'EMPLOYEE',
	`image_url` text,
	`is_team_lead` boolean DEFAULT false,
	CONSTRAINT `user_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `verification_token` (
	`email` varchar(256) NOT NULL,
	`token` varchar(256) NOT NULL,
	`expires_at` timestamp NOT NULL,
	CONSTRAINT `verification_token_email_unique` UNIQUE(`email`),
	CONSTRAINT `verification_token_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_profile` ADD CONSTRAINT `user_profile_emp_id_user_id_fk` FOREIGN KEY (`emp_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;