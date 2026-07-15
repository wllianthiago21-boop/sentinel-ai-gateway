CREATE TABLE `audit_events` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`decision` text NOT NULL,
	`severity` text NOT NULL,
	`risk_score` integer NOT NULL,
	`categories` text NOT NULL,
	`redacted_preview` text NOT NULL,
	`prompt_hash` text NOT NULL,
	`model_version` text NOT NULL,
	`policy_version` text NOT NULL,
	`processing_ms` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `audit_events_created_at_idx` ON `audit_events` (`created_at`);--> statement-breakpoint
CREATE INDEX `audit_events_decision_idx` ON `audit_events` (`decision`);--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`client_hash` text NOT NULL,
	`bucket` integer NOT NULL,
	`request_count` integer DEFAULT 1 NOT NULL,
	`expires_at` integer NOT NULL,
	PRIMARY KEY(`client_hash`, `bucket`)
);
--> statement-breakpoint
CREATE INDEX `rate_limits_expires_at_idx` ON `rate_limits` (`expires_at`);