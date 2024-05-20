CREATE TABLE `regularization_date` (
	`id` varchar(24) NOT NULL,
	`date` date,
	`punch_in` time(0) NOT NULL,
	`punch_out` time(0) NOT NULL,
	`reason` varchar(1024),
	`accepted` boolean DEFAULT false,
	`regularization_id` varchar(24) NOT NULL,
	CONSTRAINT `regularization_date_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `regularization` (
	`id` varchar(24) NOT NULL,
	`created_at` datetime NOT NULL,
	`emp_id` varchar(24) NOT NULL,
	`reviewer_id` varchar(24) NOT NULL,
	CONSTRAINT `regularization_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `regularization_date` ADD CONSTRAINT `regularization_date_regularization_id_regularization_id_fk` FOREIGN KEY (`regularization_id`) REFERENCES `regularization`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `regularization` ADD CONSTRAINT `regularization_emp_id_user_id_fk` FOREIGN KEY (`emp_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `regularization` ADD CONSTRAINT `regularization_reviewer_id_user_id_fk` FOREIGN KEY (`reviewer_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;