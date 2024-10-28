-- Drop existing comments table and recreate with proper relations
DROP TABLE IF EXISTS comments CASCADE;

CREATE TABLE comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content TEXT NOT NULL,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create view to join comments with user profiles
CREATE OR REPLACE VIEW comment_details AS
SELECT 
    c.id,
    c.content,
    c.artwork_id,
    c.created_at,
    c.updated_at,
    p.username,
    p.avatar_url,
    p.id as user_id
FROM comments c
JOIN profiles p ON c.user_id = p.id;

-- Update RLS policies
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone"
    ON comments FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own comments"
    ON comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
    ON comments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
    ON comments FOR DELETE
    USING (auth.uid() = user_id);

-- Recreate comment count trigger
CREATE OR REPLACE FUNCTION update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE artworks 
        SET comments_count = comments_count + 1
        WHERE id = NEW.artwork_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE artworks 
        SET comments_count = comments_count - 1
        WHERE id = OLD.artwork_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_artwork_comments_count ON comments;
CREATE TRIGGER update_artwork_comments_count
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_comments_count();