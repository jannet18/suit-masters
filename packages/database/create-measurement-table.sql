-- 1. Drop the old broken versions
DROP TABLE IF EXISTS product_collection CASCADE;
DROP TABLE IF EXISTS collection CASCADE;
DROP TABLE IF EXISTS measurement_definitions CASCADE;

-- Create measurement_definitions table for Indochino-style video guides
CREATE TABLE IF NOT EXISTS measurement_definitions (
  id SERIAL PRIMARY KEY,
  body_part VARCHAR(64) NOT NULL UNIQUE,
  display_name VARCHAR(128) NOT NULL,
  description TEXT,
  video_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data for testing
INSERT INTO measurement_definitions (body_part, display_name, description, video_url, display_order) VALUES
('height', 'Height', 'Stand straight with your back against a wall. Measure from the floor to the top of your head. Keep your heels together and look straight ahead.', 'https://assets.mixkit.co/videos/preview/mixkit-measuring-height-against-a-wall-41506-large.mp4', 1),
('chest', 'Chest', 'Measure around the fullest part of your chest. Keep the tape measure parallel to the floor and don''t pull too tight. Breathe normally.', 'https://assets.mixkit.co/videos/preview/mixkit-measuring-chest-circumference-41508-large.mp4', 2),
('waist', 'Waist', 'Find your natural waistline (usually just above the belly button). Measure around this point without sucking in your stomach.', 'https://assets.mixkit.co/videos/preview/mixkit-measuring-waist-circumference-41509-large.mp4', 3),
('hips', 'Seat/Hips', 'Measure around the fullest part of your hips and seat. Stand with your feet together and ensure the tape is level all around.', 'https://assets.mixkit.co/videos/preview/mixkit-measuring-hip-circumference-41510-large.mp4', 4),
('shoulder', 'Shoulder Width', 'Measure from the edge of one shoulder to the other across your back. Keep your arms relaxed at your sides.', 'https://assets.mixkit.co/videos/preview/mixkit-measuring-shoulder-width-41511-large.mp4', 5),
('inseam', 'Inseam', 'Measure from your crotch down to your ankle bone along the inner leg. Stand with your legs slightly apart for accuracy.', 'https://assets.mixkit.co/videos/preview/mixkit-measuring-inseam-length-41512-large.mp4', 6)
ON CONFLICT (body_part) DO NOTHING;

-- Create index for ordering
CREATE INDEX IF NOT EXISTS measurement_definitions_display_order_idx ON measurement_definitions(display_order);

SELECT '✅ measurement_definitions table created and seeded with sample data' as result;