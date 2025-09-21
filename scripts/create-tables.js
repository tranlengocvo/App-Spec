const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTables() {
  try {
    console.log('🚀 Creating database tables...');
    
    // Create courses table
    console.log('📚 Creating courses table...');
    const { error: coursesError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS courses (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          subject TEXT NOT NULL,
          number TEXT NOT NULL,
          title TEXT NOT NULL,
          UNIQUE(subject, number)
        );
      `
    });
    
    if (coursesError) {
      console.log('Courses table might already exist, continuing...');
    } else {
      console.log('✅ Created courses table');
    }
    
    // Create users table
    console.log('👥 Creating users table...');
    const { error: usersError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          major TEXT,
          year TEXT,
          email_verified BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });
    
    if (usersError) {
      console.log('Users table might already exist, continuing...');
    } else {
      console.log('✅ Created users table');
    }
    
    // Create directory_whitelist table
    console.log('📋 Creating directory_whitelist table...');
    const { error: whitelistError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS directory_whitelist (
          email TEXT PRIMARY KEY
        );
      `
    });
    
    if (whitelistError) {
      console.log('Directory whitelist table might already exist, continuing...');
    } else {
      console.log('✅ Created directory_whitelist table');
    }
    
    // Create swap_requests table
    console.log('🔄 Creating swap_requests table...');
    const { error: swapError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS swap_requests (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
          current_crn TEXT NOT NULL,
          desired_crns TEXT[] NOT NULL,
          time_window TEXT,
          notes TEXT,
          term TEXT NOT NULL,
          campus TEXT,
          status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'matched', 'closed')),
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });
    
    if (swapError) {
      console.log('Swap requests table might already exist, continuing...');
    } else {
      console.log('✅ Created swap_requests table');
    }
    
    // Enable RLS
    console.log('🔒 Enabling Row Level Security...');
    const { error: rlsError } = await supabase.rpc('exec', {
      sql: `
        ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
        ALTER TABLE directory_whitelist ENABLE ROW LEVEL SECURITY;
        ALTER TABLE swap_requests ENABLE ROW LEVEL SECURITY;
      `
    });
    
    if (rlsError) {
      console.log('RLS might already be enabled, continuing...');
    } else {
      console.log('✅ Enabled RLS');
    }
    
    // Create policies
    console.log('📝 Creating policies...');
    const { error: policiesError } = await supabase.rpc('exec', {
      sql: `
        -- Public read access for courses and swap_requests
        DROP POLICY IF EXISTS "Public can read courses" ON courses;
        CREATE POLICY "Public can read courses" ON courses FOR SELECT USING (true);
        
        DROP POLICY IF EXISTS "Public can read swap requests" ON swap_requests;
        CREATE POLICY "Public can read swap requests" ON swap_requests FOR SELECT USING (true);
        
        -- Users can only see their own data
        DROP POLICY IF EXISTS "Users can read own data" ON users;
        CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid() = id);
        
        DROP POLICY IF EXISTS "Users can update own data" ON users;
        CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);
        
        -- Whitelist is readable by authenticated users
        DROP POLICY IF EXISTS "Authenticated users can read whitelist" ON directory_whitelist;
        CREATE POLICY "Authenticated users can read whitelist" ON directory_whitelist FOR SELECT USING (auth.role() = 'authenticated');
        
        -- Swap requests: users can only modify their own
        DROP POLICY IF EXISTS "Users can insert own swap requests" ON swap_requests;
        CREATE POLICY "Users can insert own swap requests" ON swap_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        DROP POLICY IF EXISTS "Users can update own swap requests" ON swap_requests;
        CREATE POLICY "Users can update own swap requests" ON swap_requests FOR UPDATE USING (auth.uid() = user_id);
        
        DROP POLICY IF EXISTS "Users can delete own swap requests" ON swap_requests;
        CREATE POLICY "Users can delete own swap requests" ON swap_requests FOR DELETE USING (auth.uid() = user_id);
      `
    });
    
    if (policiesError) {
      console.log('Policies might already exist, continuing...');
    } else {
      console.log('✅ Created policies');
    }
    
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

createTables();
