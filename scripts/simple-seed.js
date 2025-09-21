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

async function seedDatabase() {
  try {
    console.log('🌱 Starting simple database seeding...');
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await supabase.from('swap_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('courses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('directory_whitelist').delete().neq('email', '');
    
    // Insert demo courses
    console.log('📚 Inserting courses...');
    const courses = [
      { subject: 'CS', number: '18000', title: 'Problem Solving and Object-Oriented Programming' },
      { subject: 'CS', number: '24000', title: 'Programming in C' },
      { subject: 'CS', number: '25000', title: 'Computer Architecture' },
      { subject: 'MATH', number: '26100', title: 'Multivariate Calculus' },
      { subject: 'MATH', number: '35100', title: 'Elementary Linear Algebra' }
    ];
    
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .insert(courses)
      .select();
    
    if (courseError) throw courseError;
    console.log(`✅ Inserted ${courseData.length} courses`);
    
    // Insert demo users
    console.log('👥 Inserting users...');
    const users = [
      {
        email: 'john.doe@purdue.edu',
        name: 'John Doe',
        major: 'Computer Science',
        year: 'Junior',
        email_verified: true
      },
      {
        email: 'jane.smith@purdue.edu',
        name: 'Jane Smith',
        major: 'Computer Science',
        year: 'Senior',
        email_verified: true
      },
      {
        email: 'mike.johnson@purdue.edu',
        name: 'Mike Johnson',
        major: 'Mathematics',
        year: 'Sophomore',
        email_verified: true
      }
    ];
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert(users)
      .select();
    
    if (userError) throw userError;
    console.log(`✅ Inserted ${userData.length} users`);
    
    // Insert whitelist
    console.log('📋 Inserting whitelist...');
    const whitelist = users.map(user => ({ email: user.email }));
    const { error: whitelistError } = await supabase
      .from('directory_whitelist')
      .insert(whitelist);
    
    if (whitelistError) throw whitelistError;
    console.log(`✅ Inserted ${whitelist.length} whitelist entries`);
    
    // Insert demo swap requests
    console.log('🔄 Inserting swap requests...');
    const swapRequests = [
      {
        user_id: userData[0].id,
        course_id: courseData[0].id,
        current_crn: '12345',
        desired_crns: ['12346', '12347'],
        time_window: 'Morning classes preferred',
        notes: 'Looking to switch to a different time slot',
        term: 'Fall 2024',
        campus: 'West Lafayette',
        status: 'open'
      },
      {
        user_id: userData[1].id,
        course_id: courseData[1].id,
        current_crn: '12348',
        desired_crns: ['12349'],
        time_window: 'Afternoon classes only',
        notes: 'Need to accommodate work schedule',
        term: 'Fall 2024',
        campus: 'West Lafayette',
        status: 'open'
      },
      {
        user_id: userData[2].id,
        course_id: courseData[2].id,
        current_crn: '12350',
        desired_crns: ['12351', '12352'],
        time_window: 'Any time',
        notes: 'Flexible with timing',
        term: 'Fall 2024',
        campus: 'West Lafayette',
        status: 'open'
      }
    ];
    
    const { data: swapData, error: swapError } = await supabase
      .from('swap_requests')
      .insert(swapRequests)
      .select();
    
    if (swapError) throw swapError;
    console.log(`✅ Inserted ${swapData.length} swap requests`);
    
    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - ${courseData.length} courses`);
    console.log(`   - ${userData.length} users`);
    console.log(`   - ${swapData.length} swap requests`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
