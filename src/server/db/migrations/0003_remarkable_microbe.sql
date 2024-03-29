ALTER TABLE `employee_shift` MODIFY COLUMN `shift_start` time(0) NOT NULL;--> statement-breakpoint
ALTER TABLE `employee_shift` MODIFY COLUMN `shift_end` time(0) NOT NULL;