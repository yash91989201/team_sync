ALTER TABLE `employee_attendance` RENAME COLUMN `punchIn` TO `punch_in`;--> statement-breakpoint
ALTER TABLE `employee_attendance` RENAME COLUMN `punchOut` TO `punch_out`;--> statement-breakpoint
ALTER TABLE `employee_attendance` RENAME COLUMN `shift_hours` TO `shift`;--> statement-breakpoint
ALTER TABLE `employee_attendance` ADD `hours` time;