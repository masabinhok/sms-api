-- Create outbox_events table for reliable event publishing
-- This table stores events that need to be published to message brokers
-- Events are stored in the same transaction as business operations

CREATE TABLE IF NOT EXISTS "outbox_events" (
    "id" TEXT NOT NULL,
    "aggregate_id" TEXT NOT NULL,
    "aggregate_type" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);

-- Index for efficient querying of pending events
CREATE INDEX IF NOT EXISTS "outbox_events_status_created_at_idx" ON "outbox_events"("status", "created_at");

-- Index for querying events by aggregate
CREATE INDEX IF NOT EXISTS "outbox_events_aggregate_idx" ON "outbox_events"("aggregate_type", "aggregate_id");
