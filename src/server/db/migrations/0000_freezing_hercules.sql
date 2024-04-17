CREATE TABLE `admin_profile` (
	`admin_id` varchar(24) NOT NULL,
	CONSTRAINT `admin_profile_admin_id` PRIMARY KEY(`admin_id`)
);
--> statement-breakpoint
CREATE TABLE `department` (
	`id` varchar(24) NOT NULL,
	`name` varchar(128) NOT NULL,
	CONSTRAINT `department_id` PRIMARY KEY(`id`),
	CONSTRAINT `department_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `designation` (
	`id` varchar(24) NOT NULL,
	`name` varchar(128) NOT NULL,
	`dept_id` varchar(24) NOT NULL,
	CONSTRAINT `designation_id` PRIMARY KEY(`id`),
	CONSTRAINT `designation_name_dept_id_unique` UNIQUE(`name`,`dept_id`)
);
--> statement-breakpoint
CREATE TABLE `document_type` (
	`id` varchar(24) NOT NULL,
	`type` varchar(256) NOT NULL,
	`file_type` enum('image/jpg','image/jpeg','image/png','image/webp','application/pdf') NOT NULL,
	`required_files` int NOT NULL,
	CONSTRAINT `document_type_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employee_attendance` (
	`id` varchar(24) NOT NULL,
	`date` date NOT NULL,
	`punchIn` time NOT NULL,
	`punchOut` time,
	`shift_hours` enum('0','0.5','0.75','1'),
	`emp_id` varchar(24) NOT NULL,
	CONSTRAINT `employee_attendance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employee_document_file` (
	`id` varchar(24) NOT NULL,
	`file_url` text NOT NULL,
	`emp_document_id` varchar(24) NOT NULL,
	CONSTRAINT `employee_document_file_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employee_document` (
	`id` varchar(24) NOT NULL,
	`verified` boolean NOT NULL,
	`unique_document_id` varchar(128),
	`emp_id` varchar(24) NOT NULL,
	`document_type_id` varchar(24) NOT NULL,
	CONSTRAINT `employee_document_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employee_profile` (
	`emp_id` varchar(24) NOT NULL,
	`joining_date` timestamp NOT NULL,
	`emp_band` enum('U1','U2','U3') NOT NULL,
	`salary` int NOT NULL,
	`location` varchar(256) NOT NULL,
	`dob` date NOT NULL,
	`is_profile_updated` boolean NOT NULL DEFAULT false,
	`dept_id` varchar(24) NOT NULL,
	`designation_id` varchar(24) NOT NULL,
	CONSTRAINT `employee_profile_emp_id` PRIMARY KEY(`emp_id`)
);
--> statement-breakpoint
CREATE TABLE `employee_shift` (
	`emp_id` varchar(24) NOT NULL,
	`shift_start` time(0) NOT NULL,
	`shift_end` time(0) NOT NULL,
	`break_minutes` int NOT NULL,
	CONSTRAINT `employee_shift_emp_id` PRIMARY KEY(`emp_id`)
);
--> statement-breakpoint
CREATE TABLE `leave_balance` (
	`id` varchar(24) NOT NULL,
	`createdAt` date NOT NULL,
	`balance` int NOT NULL,
	`emp_id` varchar(24) NOT NULL,
	`leave_type_id` varchar(24) NOT NULL,
	CONSTRAINT `leave_balance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leave_request` (
	`id` varchar(24) NOT NULL,
	`from_date` date NOT NULL,
	`to_date` date NOT NULL,
	`leave_days` int NOT NULL,
	`reason` text,
	`applied_on` date NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL,
	`emp_id` varchar(24) NOT NULL,
	`leave_type_id` varchar(24) NOT NULL,
	`reviewer_id` varchar(24) NOT NULL,
	CONSTRAINT `leave_request_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leave_type` (
	`id` varchar(24) NOT NULL,
	`type` varchar(128) NOT NULL,
	`days_allowed` int NOT NULL,
	`renew_period` enum('month','year') NOT NULL,
	`renew_period_count` int NOT NULL,
	`carry_over` boolean NOT NULL DEFAULT false,
	CONSTRAINT `leave_type_id` PRIMARY KEY(`id`),
	CONSTRAINT `leave_type_type_unique` UNIQUE(`type`)
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
	`id` varchar(48) NOT NULL,
	`expires_at` datetime NOT NULL,
	`user_id` varchar(24) NOT NULL,
	CONSTRAINT `session_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `two_factor_confirmation` (
	`id` varchar(24) NOT NULL,
	`userId` varchar(24) NOT NULL,
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
	`id` varchar(24) NOT NULL,
	`code` varchar(128) NOT NULL,
	`name` varchar(256) NOT NULL,
	`email` varchar(256) NOT NULL,
	`password` varchar(256) NOT NULL,
	`role` enum('ADMIN','EMPLOYEE') NOT NULL DEFAULT 'EMPLOYEE',
	`is_team_lead` boolean NOT NULL DEFAULT false,
	`email_verified` timestamp,
	`two_factor_enabled` boolean NOT NULL DEFAULT false,
	`image_url` text,
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
ALTER TABLE `designation` ADD CONSTRAINT `designation_dept_id_department_id_fk` FOREIGN KEY (`dept_id`) REFERENCES `department`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employee_attendance` ADD CONSTRAINT `employee_attendance_emp_id_user_id_fk` FOREIGN KEY (`emp_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employee_document_file` ADD CONSTRAINT `employee_document_file_emp_document_id_employee_document_id_fk` FOREIGN KEY (`emp_document_id`) REFERENCES `employee_document`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employee_document` ADD CONSTRAINT `employee_document_emp_id_user_id_fk` FOREIGN KEY (`emp_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employee_document` ADD CONSTRAINT `employee_document_document_type_id_document_type_id_fk` FOREIGN KEY (`document_type_id`) REFERENCES `document_type`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employee_profile` ADD CONSTRAINT `employee_profile_emp_id_user_id_fk` FOREIGN KEY (`emp_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employee_profile` ADD CONSTRAINT `employee_profile_dept_id_department_id_fk` FOREIGN KEY (`dept_id`) REFERENCES `department`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employee_profile` ADD CONSTRAINT `employee_profile_designation_id_designation_id_fk` FOREIGN KEY (`designation_id`) REFERENCES `designation`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employee_shift` ADD CONSTRAINT `employee_shift_emp_id_user_id_fk` FOREIGN KEY (`emp_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `leave_balance` ADD CONSTRAINT `leave_balance_emp_id_user_id_fk` FOREIGN KEY (`emp_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `leave_balance` ADD CONSTRAINT `leave_balance_leave_type_id_leave_type_id_fk` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_type`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `leave_request` ADD CONSTRAINT `leave_request_emp_id_user_id_fk` FOREIGN KEY (`emp_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `leave_request` ADD CONSTRAINT `leave_request_leave_type_id_leave_type_id_fk` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_type`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `leave_request` ADD CONSTRAINT `leave_request_reviewer_id_user_id_fk` FOREIGN KEY (`reviewer_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `two_factor_confirmation` ADD CONSTRAINT `two_factor_confirmation_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;