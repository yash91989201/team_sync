CREATE TABLE `document_type` (
	`id` varchar(24) NOT NULL,
	`type` varchar(256) NOT NULL,
	`file_type` enum('image/jpg','image/jpeg','image/png','image/webp','application/pdf') NOT NULL,
	`required_files` int NOT NULL,
	CONSTRAINT `document_type_id` PRIMARY KEY(`id`)
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
ALTER TABLE `employee_document_file` ADD CONSTRAINT `employee_document_file_emp_document_id_employee_document_id_fk` FOREIGN KEY (`emp_document_id`) REFERENCES `employee_document`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employee_document` ADD CONSTRAINT `employee_document_emp_id_user_id_fk` FOREIGN KEY (`emp_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employee_document` ADD CONSTRAINT `employee_document_document_type_id_document_type_id_fk` FOREIGN KEY (`document_type_id`) REFERENCES `document_type`(`id`) ON DELETE no action ON UPDATE no action;