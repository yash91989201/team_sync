ALTER TABLE `employee_leave_type` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `leave_type` MODIFY COLUMN `carry_over` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `leave_type` MODIFY COLUMN `paid_leave` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `employee_leave_type` ADD CONSTRAINT `employee_leave_type_emp_id_user_id_fk` FOREIGN KEY (`emp_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employee_leave_type` ADD CONSTRAINT `employee_leave_type_leave_type_id_leave_type_id_fk` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_type`(`id`) ON DELETE no action ON UPDATE no action;