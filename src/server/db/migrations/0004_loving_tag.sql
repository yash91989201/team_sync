CREATE TABLE `employee_salary_component` (
	`id` varchar(24) NOT NULL,
	`name` varchar(256),
	`amount` int,
	`emp_id` varchar(24) NOT NULL,
	CONSTRAINT `employee_salary_component_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `employee_salary_component` ADD CONSTRAINT `employee_salary_component_emp_id_user_id_fk` FOREIGN KEY (`emp_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;