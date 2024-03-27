CREATE TABLE `admin_profile` (
	`admin_id` varchar(256) NOT NULL,
	CONSTRAINT `admin_profile_admin_id` PRIMARY KEY(`admin_id`)
);
--> statement-breakpoint
CREATE TABLE `department` (
	`id` varchar(256) NOT NULL,
	`name` varchar(128) NOT NULL,
	CONSTRAINT `department_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employee_profile` (
	`emp_id` varchar(256) NOT NULL,
	`joining_date` timestamp NOT NULL,
	`band` enum('U1','U2','U3') NOT NULL,
	`dept` varchar(128) NOT NULL,
	`designation` varchar(128) NOT NULL,
	`paid_leaves` int NOT NULL,
	`salary` int NOT NULL,
	`location` varchar(256) NOT NULL,
	`image_url` text,
	`is_profile_updated` boolean NOT NULL DEFAULT false,
	CONSTRAINT `employee_profile_emp_id` PRIMARY KEY(`emp_id`)
);
--> statement-breakpoint
CREATE TABLE `password_reset_token` (
	`token` varchar(256) NOT NULL,
	`email` varchar(256) NOT NULL,
	`expires_at` timestamp NOT NULL,
	CONSTRAINT `password_reset_token_token` PRIMARY KEY(`token`),
	CONSTRAINT `password_reset_token_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` varchar(256) NOT NULL,
	`expires_at` datetime NOT NULL,
	`user_id` varchar(256) NOT NULL,
	CONSTRAINT `session_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `two_factor_confirmation` (
	`id` varchar(256) NOT NULL,
	`userId` varchar(256) NOT NULL,
	CONSTRAINT `two_factor_confirmation_id` PRIMARY KEY(`id`),
	CONSTRAINT `two_factor_confirmation_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `two_factor_token` (
	`token` varchar(256) NOT NULL,
	`email` varchar(256) NOT NULL,
	`expires_at` timestamp NOT NULL,
	CONSTRAINT `two_factor_token_token` PRIMARY KEY(`token`),
	CONSTRAINT `two_factor_token_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(256) NOT NULL,
	`code` varchar(128) NOT NULL,
	`name` varchar(256) NOT NULL,
	`email` varchar(256) NOT NULL,
	`password` varchar(256) NOT NULL,
	`role` enum('ADMIN','EMPLOYEE') NOT NULL DEFAULT 'EMPLOYEE',
	`is_team_lead` boolean NOT NULL DEFAULT false,
	`email_verified` timestamp,
	`two_factor_enabled` boolean NOT NULL DEFAULT false,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `verification_token` (
	`token` varchar(256) NOT NULL,
	`email` varchar(256) NOT NULL,
	`expires_at` timestamp NOT NULL,
	CONSTRAINT `verification_token_token` PRIMARY KEY(`token`),
	CONSTRAINT `verification_token_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `admin_profile` ADD CONSTRAINT `admin_profile_admin_id_user_id_fk` FOREIGN KEY (`admin_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employee_profile` ADD CONSTRAINT `employee_profile_emp_id_user_id_fk` FOREIGN KEY (`emp_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `two_factor_confirmation` ADD CONSTRAINT `two_factor_confirmation_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;