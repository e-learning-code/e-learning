-- Add time tracking to quiz_attempts table
-- This will track how long students take to complete quizzes

-- Add time_taken_seconds column to quiz_attempts table
ALTER TABLE public.quiz_attempts 
ADD COLUMN IF NOT EXISTS time_taken_seconds INTEGER DEFAULT 0;

-- Add comment to the new column
COMMENT ON COLUMN public.quiz_attempts.time_taken_seconds IS 'Time taken by student to complete the quiz in seconds';

-- Update existing records to have a default time (optional - set to 0 for existing records)
UPDATE public.quiz_attempts 
SET time_taken_seconds = 0 
WHERE time_taken_seconds IS NULL;
