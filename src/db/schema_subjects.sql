
-- Create a new table for subjects
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_type TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    description TEXT,
    icon_name TEXT,
    display_order INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(course_type, subject_name)
);
