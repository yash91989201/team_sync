ALTER TABLE `employee_shift` MODIFY COLUMN `shift_start` timestamp(0) NOT NULL;--> statement-breakpoint
ALTER TABLE `employee_shift` MODIFY COLUMN `shift_end` timestamp(0) NOT NULL;