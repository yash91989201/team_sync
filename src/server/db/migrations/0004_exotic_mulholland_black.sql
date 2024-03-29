CREATE TABLE `employee_attendance` (
	`id` varchar(256) NOT NULL,
	`date` date,
	`punchIn` time,
	`punchOut` time,
	`shift_hours` enum('0','0.5','0.75','1'),
	`emp_id` varchar(256) NOT NULL,
	CONSTRAINT `employee_attendance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `employee_shift` ADD `break_minutes` int NOT NULL;--> statement-breakpoint
ALTER TABLE `employee_attendance` ADD CONSTRAINT `employee_attendance_emp_id_user_id_fk` FOREIGN KEY (`emp_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;