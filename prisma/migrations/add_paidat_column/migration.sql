-- Add paidAt column to Payment table to track when payment was confirmed
ALTER TABLE "Payment" ADD COLUMN "paidAt" TIMESTAMP(3);
