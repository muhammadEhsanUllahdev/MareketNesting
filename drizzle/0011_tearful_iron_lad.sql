CREATE TABLE "user_sessions" (
	"sid" varchar NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp (6) NOT NULL,
	CONSTRAINT "user_sessions_sid_pk" PRIMARY KEY("sid")
);
--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "user_sessions" USING btree ("expire");