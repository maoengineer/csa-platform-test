-- ============================================================
-- CSA Platform — Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- UNIVERSITIES
-- ============================================================
CREATE TABLE IF NOT EXISTS universities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en TEXT NOT NULL,
  name_kh TEXT NOT NULL,
  abbreviation TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DEPARTMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  name_en TEXT NOT NULL,
  name_kh TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USERS (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  student_id TEXT,
  university_id UUID REFERENCES universities(id),
  department_id UUID REFERENCES departments(id),
  year_of_study SMALLINT CHECK (year_of_study BETWEEN 1 AND 6),
  bio TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  is_banned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

-- Full-text search on users
CREATE INDEX IF NOT EXISTS idx_users_username_trgm ON users USING GIN (username gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_users_full_name_trgm ON users USING GIN (full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_users_university ON users(university_id);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department_id);

-- ============================================================
-- POSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  font_style TEXT DEFAULT '{"fontFamily":"Inter","fontSize":"normal","textAlign":"left","bold":false,"italic":false,"underline":false,"strikethrough":false,"color":"#000000"}',
  is_announcement BOOLEAN NOT NULL DEFAULT false,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_announcement ON posts(is_announcement) WHERE is_announcement = true;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- REACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'love', 'haha', 'sad', 'angry')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_reactions_post ON reactions(post_id);

-- ============================================================
-- COMMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);

-- ============================================================
-- MESSAGES (Realtime enabled)
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

-- Enable Realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- ============================================================
-- REPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES users(id),
  reporter_name TEXT,        -- for guest reports
  reporter_student_id TEXT,  -- for guest reports
  reported_post_id UUID REFERENCES posts(id),
  reported_user_id UUID REFERENCES users(id),
  reason TEXT NOT NULL CHECK (reason IN ('politics', 'adult', 'fake', 'harassment', 'spam', 'impersonation', 'other')),
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  moderator_id UUID REFERENCES users(id),
  moderator_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_post ON reports(reported_post_id);
CREATE INDEX IF NOT EXISTS idx_reports_user ON reports(reported_user_id);

-- ============================================================
-- PASSWORD RESET REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS password_reset_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_name TEXT NOT NULL,
  student_id TEXT NOT NULL,
  university_id UUID REFERENCES universities(id),
  email TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  moderator_id UUID REFERENCES users(id),
  moderator_notes TEXT,
  reset_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_status ON password_reset_requests(status);

-- ============================================================
-- MODERATOR PERMISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS moderator_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  moderator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  can_reset_password BOOLEAN NOT NULL DEFAULT false,
  can_handle_reports BOOLEAN NOT NULL DEFAULT false,
  can_edit_universities BOOLEAN NOT NULL DEFAULT false,
  can_manage_users BOOLEAN NOT NULL DEFAULT false,
  assigned_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('comment', 'reaction', 'message', 'mention', 'system', 'announcement')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- Enable Realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ============================================================
-- PLATFORM SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO platform_settings (key, value) VALUES
  ('maintenance_mode', 'false'),
  ('registration_open', 'true'),
  ('site_name_en', 'CSA'),
  ('site_name_kh', 'ស.ស.ក'),
  ('welcome_message_en', 'Welcome to CSA — Cambodia Student Association'),
  ('welcome_message_kh', 'សូមស្វាគមន៍មកកាន់ CSA — សមាគមសិស្ស​ស្រុកខ្មែរ'),
  ('default_language', 'en'),
  ('accent_color', '#1e3a8a')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- TRIGGER: Create user profile on auth signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, username, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- UNIVERSITIES: public read, admin write
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Universities are publicly readable" ON universities FOR SELECT USING (true);
CREATE POLICY "Admins can manage universities" ON universities FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- DEPARTMENTS: public read, admin+moderator write
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Departments are publicly readable" ON departments FOR SELECT USING (true);
CREATE POLICY "Admins can manage departments" ON departments FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

-- USERS: public read (non-banned), own write
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public users are viewable" ON users FOR SELECT
  USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE
  USING (auth.uid() = id);
CREATE POLICY "Admins can manage all users" ON users FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- POSTS: public read (non-deleted), auth write
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published posts are publicly readable" ON posts FOR SELECT
  USING (is_deleted = false);
CREATE POLICY "Authenticated users can create posts" ON posts FOR INSERT
  WITH CHECK (auth.uid() = author_id AND EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND is_banned = false
  ));
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE
  USING (auth.uid() = author_id);
CREATE POLICY "Admins and moderators can manage posts" ON posts FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

-- REACTIONS: public read, auth write (own)
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reactions are publicly readable" ON reactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can react" ON reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND is_banned = false
  ));
CREATE POLICY "Users can change own reaction" ON reactions FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reaction" ON reactions FOR DELETE
  USING (auth.uid() = user_id);

-- COMMENTS: public read, auth write
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments are publicly readable" ON comments FOR SELECT
  USING (is_deleted = false);
CREATE POLICY "Authenticated users can comment" ON comments FOR INSERT
  WITH CHECK (auth.uid() = author_id AND EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND is_banned = false
  ));
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE
  USING (auth.uid() = author_id);
CREATE POLICY "Admins and moderators can delete comments" ON comments FOR DELETE
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

-- MESSAGES: sender/receiver access only
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own messages" ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id AND EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND is_banned = false
  ));
CREATE POLICY "Receivers can mark messages as read" ON messages FOR UPDATE
  USING (auth.uid() = receiver_id);

-- REPORTS: auth insert, admin/mod read
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit reports" ON reports FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Admin and moderators can view reports" ON reports FOR SELECT
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator')));
CREATE POLICY "Admin and moderators can update reports" ON reports FOR UPDATE
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

-- PASSWORD RESET REQUESTS: public insert, mod/admin read/update
ALTER TABLE password_reset_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit password reset requests" ON password_reset_requests FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Moderators and admins can view password requests" ON password_reset_requests FOR SELECT
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator')));
CREATE POLICY "Moderators and admins can update password requests" ON password_reset_requests FOR UPDATE
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

-- MODERATOR PERMISSIONS: admin manage, moderator self-read
ALTER TABLE moderator_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Moderators can read own permissions" ON moderator_permissions FOR SELECT
  USING (auth.uid() = moderator_id OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));
CREATE POLICY "Admins can manage moderator permissions" ON moderator_permissions FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- NOTIFICATIONS: user access only
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON notifications FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- PLATFORM SETTINGS: public read, admin write
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Platform settings are publicly readable" ON platform_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage platform settings" ON platform_settings FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
