ALTER TABLE `emp_attendance` MODIFY COLUMN `punch_in` time(0) NOT NULL;--> statement-breakpoint
ALTER TABLE `emp_attendance` MODIFY COLUMN `punch_out` time(0);--> statement-breakpoint
ALTER TABLE `emp_attendance` MODIFY COLUMN `hours` time(0);