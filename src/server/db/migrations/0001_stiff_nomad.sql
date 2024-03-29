CREATE TABLE `employee_shift` (
	`emp_id` varchar(256) NOT NULL,
	`shift_start` time(0) NOT NULL,
	`shift_end` time(0) NOT NULL,
	CONSTRAINT `employee_shift_emp_id` PRIMARY KEY(`emp_id`)
);
--> statement-breakpoint
ALTER TABLE `employee_shift` ADD CONSTRAINT `employee_shift_emp_id_user_id_fk` FOREIGN KEY (`emp_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;