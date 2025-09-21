const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
      console.log('Courses error:', coursesError);
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
      console.log('Users error:', usersError);
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
      console.log('Whitelist error:', whitelistError);
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
      console.log('Swap requests error:', swapError);
    } else {
      console.log('✅ Created swap_requests table');
    }
    
    console.log('🎉 Database setup completed!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

createTables();
