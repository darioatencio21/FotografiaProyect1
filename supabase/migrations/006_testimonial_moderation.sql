-- Client-submitted testimonials remain hidden until approved by the studio.
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT TRUE;
