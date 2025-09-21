const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️  Missing Supabase service role key. Seed script will run in read-only mode.');
  console.log('To enable seeding, set SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Load seed data
const courses = JSON.parse(fs.readFileSync('./seed/purdue-courses.json', 'utf8'));
const sections = JSON.parse(fs.readFileSync('./seed/purdue-sections.json', 'utf8'));

// Sample users for demo
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
  },
  {
    email: 'sarah.wilson@purdue.edu',
    name: 'Sarah Wilson',
    major: 'Computer Science',
    year: 'Freshman',
    email_verified: true
  },
  {
    email: 'alex.brown@purdue.edu',
    name: 'Alex Brown',
    major: 'Mathematics',
    year: 'Junior',
    email_verified: true
  }
];

// Sample swap requests
const swapRequests = [
  {
    current_crn: '12345',
    desired_crns: ['12346', '12347'],
    time_window: 'Morning classes preferred',
    notes: 'Looking to switch to a different time slot',
    term: 'Fall 2024',
    campus: 'West Lafayette',
    status: 'open'
  },
  {
    current_crn: '12348',
    desired_crns: ['12349'],
    time_window: 'Afternoon classes only',
    notes: 'Need to accommodate work schedule',
    term: 'Fall 2024',
    campus: 'West Lafayette',
    status: 'open'
  },
  {
    current_crn: '12350',
    desired_crns: ['12351', '12352'],
    time_window: 'Any time',
    notes: 'Flexible with timing',
    term: 'Fall 2024',
    campus: 'West Lafayette',
    status: 'open'
  },
  {
    current_crn: '12353',
    desired_crns: ['12354'],
    time_window: 'Late afternoon',
    notes: 'Prefer later classes',
    term: 'Fall 2024',
    campus: 'West Lafayette',
    status: 'open'
  },
  {
    current_crn: '12355',
    desired_crns: ['12356'],
    time_window: 'Early morning',
    notes: 'Need early morning section',
    term: 'Fall 2024',
    campus: 'West Lafayette',
    status: 'open'
  },
  {
    current_crn: '12345',
    desired_crns: ['12346'],
    time_window: 'Mid-morning',
    notes: 'Looking for better instructor',
    term: 'Fall 2024',
    campus: 'West Lafayette',
    status: 'open'
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await supabase.from('messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('offers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('swap_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('sections').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('courses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('directory_whitelist').delete().neq('email', '');
    await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Insert courses
    console.log('📚 Inserting courses...');
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .insert(courses)
      .select();
    
    if (courseError) throw courseError;
    console.log(`✅ Inserted ${courseData.length} courses`);
    
    // Insert sections
    console.log('📖 Inserting sections...');
    const sectionsWithCourseIds = sections.map((section, index) => ({
      ...section,
      course_id: courseData[index % courseData.length].id
    }));
    
    const { data: sectionData, error: sectionError } = await supabase
      .from('sections')
      .insert(sectionsWithCourseIds)
      .select();
    
    if (sectionError) throw sectionError;
    console.log(`✅ Inserted ${sectionData.length} sections`);
    
    // Insert users
    console.log('👥 Inserting users...');
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
    
    // Insert swap requests
    console.log('🔄 Inserting swap requests...');
    const swapRequestsWithUserIds = swapRequests.map((swap, index) => ({
      ...swap,
      user_id: userData[index % userData.length].id,
      course_id: courseData[index % courseData.length].id
    }));
    
    const { data: swapData, error: swapError } = await supabase
      .from('swap_requests')
      .insert(swapRequestsWithUserIds)
      .select();
    
    if (swapError) throw swapError;
    console.log(`✅ Inserted ${swapData.length} swap requests`);
    
    // Insert offers
    console.log('💼 Inserting offers...');
    const offers = [];
    for (let i = 0; i < swapData.length; i++) {
      const swap = swapData[i];
      const numOffers = Math.floor(Math.random() * 3) + 1; // 1-3 offers per swap
      
      for (let j = 0; j < numOffers; j++) {
        const offererIndex = (i + j + 1) % userData.length;
        offers.push({
          swap_id: swap.id,
          user_id: userData[offererIndex].id,
          offered_crn: sections[Math.floor(Math.random() * sections.length)].crn,
          note: `I have this section available. Let me know if you're interested!`,
          status: 'active',
          agree_state: 'NONE'
        });
      }
    }
    
    const { data: offerData, error: offerError } = await supabase
      .from('offers')
      .insert(offers)
      .select();
    
    if (offerError) throw offerError;
    console.log(`✅ Inserted ${offerData.length} offers`);
    
    // Insert messages
    console.log('💬 Inserting messages...');
    const messages = [];
    for (const offer of offerData.slice(0, 10)) { // Only add messages to first 10 offers
      const numMessages = Math.floor(Math.random() * 3) + 1; // 1-3 messages per offer
      
      for (let i = 0; i < numMessages; i++) {
        const senderId = i % 2 === 0 ? offer.user_id : swapData.find(s => s.id === offer.swap_id)?.user_id;
        if (senderId) {
          messages.push({
            offer_id: offer.id,
            sender_id: senderId,
            body: i === 0 ? 'Hi! I saw your swap request and I have a section that might work for you.' : 
                  i === 1 ? 'That sounds great! When would be a good time to discuss this?' :
                  'Perfect, let me know if you need any more details.'
          });
        }
      }
    }
    
    if (messages.length > 0) {
      const { error: messageError } = await supabase
        .from('messages')
        .insert(messages);
      
      if (messageError) throw messageError;
      console.log(`✅ Inserted ${messages.length} messages`);
    }
    
    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - ${courseData.length} courses`);
    console.log(`   - ${sectionData.length} sections`);
    console.log(`   - ${userData.length} users`);
    console.log(`   - ${swapData.length} swap requests`);
    console.log(`   - ${offerData.length} offers`);
    console.log(`   - ${messages.length} messages`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
