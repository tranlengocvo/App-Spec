-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  major TEXT,
  year TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Directory whitelist for allowed users
CREATE TABLE directory_whitelist (
  email TEXT PRIMARY KEY
);

-- Courses table
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject TEXT NOT NULL,
  number TEXT NOT NULL,
  title TEXT NOT NULL,
  UNIQUE(subject, number)
);

-- Sections table
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  crn TEXT NOT NULL,
  section_code TEXT NOT NULL,
  meeting_days TEXT,
  meeting_time TEXT,
  instructor TEXT,
  term TEXT NOT NULL,
  UNIQUE(crn, term)
);

-- Swap requests table
CREATE TABLE swap_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  current_crn TEXT NOT NULL,
  desired_crns TEXT[] NOT NULL,
  time_window TEXT,
  notes TEXT,
  term TEXT NOT NULL,
  campus TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'matched', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id, current_crn) WHERE status = 'open'
);

-- Offers table
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  swap_id UUID NOT NULL REFERENCES swap_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  offered_crn TEXT NOT NULL,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'withdrawn')),
  agree_state TEXT NOT NULL DEFAULT 'NONE' CHECK (agree_state IN ('NONE', 'REQ', 'OFFER', 'MATCHED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_swap_requests_status ON swap_requests(status);
CREATE INDEX idx_swap_requests_course_id ON swap_requests(course_id);
CREATE INDEX idx_swap_requests_user_id ON swap_requests(user_id);
CREATE INDEX idx_swap_requests_created_at ON swap_requests(created_at DESC);

CREATE INDEX idx_offers_swap_id ON offers(swap_id);
CREATE INDEX idx_offers_user_id ON offers(user_id);
CREATE INDEX idx_offers_status ON offers(status);

CREATE INDEX idx_messages_offer_id ON messages(offer_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

CREATE INDEX idx_sections_course_id ON sections(course_id);
CREATE INDEX idx_sections_crn ON sections(crn);
CREATE INDEX idx_sections_term ON sections(term);

-- RLS Policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE directory_whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Public read access for courses and sections
CREATE POLICY "Public can read courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Public can read sections" ON sections FOR SELECT USING (true);

-- Public read access for swap_requests (but not private data)
CREATE POLICY "Public can read swap requests" ON swap_requests FOR SELECT USING (true);

-- Public read access for offers (but not private data)
CREATE POLICY "Public can read offers" ON offers FOR SELECT USING (true);

-- Public read access for messages (but not private data)
CREATE POLICY "Public can read messages" ON messages FOR SELECT USING (true);

-- Users can only see their own data
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- Whitelist is readable by authenticated users
CREATE POLICY "Authenticated users can read whitelist" ON directory_whitelist FOR SELECT USING (auth.role() = 'authenticated');

-- Swap requests: users can only modify their own
CREATE POLICY "Users can insert own swap requests" ON swap_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own swap requests" ON swap_requests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own swap requests" ON swap_requests FOR DELETE USING (auth.uid() = user_id);

-- Offers: users can only modify their own
CREATE POLICY "Users can insert own offers" ON offers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own offers" ON offers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own offers" ON offers FOR DELETE USING (auth.uid() = user_id);

-- Messages: users can only modify their own
CREATE POLICY "Users can insert own messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update own messages" ON messages FOR UPDATE USING (auth.uid() = sender_id);
CREATE POLICY "Users can delete own messages" ON messages FOR DELETE USING (auth.uid() = sender_id);
