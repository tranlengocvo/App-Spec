const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
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

async function runMigrations() {
  try {
    console.log('🚀 Starting database migrations...');
    
    const migrationFiles = fs.readdirSync('./migrations')
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    for (const file of migrationFiles) {
      console.log(`📄 Running migration: ${file}`);
      const migrationSQL = fs.readFileSync(path.join('./migrations', file), 'utf8');
      
      const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
      
      if (error) {
        // If exec_sql doesn't exist, try direct query
        const { error: directError } = await supabase.from('_migrations').select('*');
        
        if (directError && directError.code === 'PGRST116') {
          // Table doesn't exist, run the migration directly
          const statements = migrationSQL.split(';').filter(stmt => stmt.trim());
          
          for (const statement of statements) {
            if (statement.trim()) {
              const { error: stmtError } = await supabase.rpc('exec', { sql: statement.trim() });
              if (stmtError) {
                console.error(`❌ Error running statement: ${statement.trim()}`);
                console.error(stmtError);
                throw stmtError;
              }
            }
          }
        } else {
          throw error;
        }
      }
      
      console.log(`✅ Migration ${file} completed`);
    }
    
    console.log('🎉 All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
