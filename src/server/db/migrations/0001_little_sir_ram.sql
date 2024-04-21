CREATE TABLE `employee_leave_type` (
	`emp_id` varchar(24) NOT NULL,
	`leave_type_id` varchar(24) NOT NULL,
	CONSTRAINT `emp_leave_id` PRIMARY KEY(`emp_id`,`leave_type_id`)
);
