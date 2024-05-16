CREATE INDEX `date_idx` ON `emp_payslip` (`date`);--> statement-breakpoint
CREATE INDEX `date_idx` ON `holiday` (`date`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `leave_balance` (`created_at`);--> statement-breakpoint
CREATE INDEX `from_date_idx` ON `leave_request` (`from_date`);--> statement-breakpoint
CREATE INDEX `to_date_idx` ON `leave_request` (`to_date`);