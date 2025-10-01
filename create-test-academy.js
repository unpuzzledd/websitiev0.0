// Script to create test academy "Vishal Chess Academy"
// Run this with: node create-test-academy.js

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestAcademy() {
  try {
    console.log('🏫 Creating test academy: Vishal Chess Academy');
    
    // Step 1: Check if user exists, create if not
    console.log('👤 Checking user: meetneerajv@gmail.com');
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'meetneerajv@gmail.com')
      .single();

    let userId;
    if (existingUser) {
      console.log('✅ User already exists:', existingUser.id);
      userId = existingUser.id;
    } else {
      console.log('❌ User not found. Please create the user first through the app signup process.');
      console.log('💡 You can sign up with meetneerajv@gmail.com and select "Academy Owner" role');
      return;
    }

    // Step 2: Create or get a location
    console.log('📍 Setting up location...');
    const { data: locations, error: locationError } = await supabase
      .from('locations')
      .select('*')
      .eq('name', 'Bangalore')
      .single();

    let locationId;
    if (locations) {
      console.log('✅ Location exists:', locations.id);
      locationId = locations.id;
    } else {
      console.log('🏗️ Creating new location: Bangalore');
      const { data: newLocation, error: createLocationError } = await supabase
        .from('locations')
        .insert({
          name: 'Bangalore',
          city: 'Bangalore',
          state: 'Karnataka',
          country: 'India'
        })
        .select()
        .single();

      if (createLocationError) {
        console.error('❌ Error creating location:', createLocationError);
        return;
      }
      locationId = newLocation.id;
      console.log('✅ Location created:', locationId);
    }

    // Step 3: Create the academy
    console.log('🏫 Creating academy: Vishal Chess Academy');
    const { data: academy, error: academyError } = await supabase
      .from('academies')
      .insert({
        name: 'Vishal Chess Academy',
        phone_number: '+91 9876543210',
        owner_id: userId,
        location_id: locationId,
        status: 'active' // Set as active for testing
      })
      .select(`
        *,
        location:locations(*),
        owner:users(*)
      `)
      .single();

    if (academyError) {
      console.error('❌ Error creating academy:', academyError);
      return;
    }
    console.log('✅ Academy created:', academy.id);

    // Step 4: Create or get Chess skill
    console.log('♟️ Setting up Chess skill...');
    const { data: chessSkill, error: skillError } = await supabase
      .from('skills')
      .select('*')
      .eq('name', 'Chess')
      .single();

    let skillId;
    if (chessSkill) {
      console.log('✅ Chess skill exists:', chessSkill.id);
      skillId = chessSkill.id;
    } else {
      console.log('🏗️ Creating Chess skill...');
      const { data: newSkill, error: createSkillError } = await supabase
        .from('skills')
        .insert({
          name: 'Chess',
          description: 'Chess strategy and tactics training'
        })
        .select()
        .single();

      if (createSkillError) {
        console.error('❌ Error creating skill:', createSkillError);
        return;
      }
      skillId = newSkill.id;
      console.log('✅ Chess skill created:', skillId);
    }

    // Step 5: Add Chess skill to academy
    console.log('🔗 Adding Chess skill to academy...');
    const { data: academySkill, error: academySkillError } = await supabase
      .from('academy_skills')
      .insert({
        academy_id: academy.id,
        skill_id: skillId,
        status: 'approved' // Set as approved for testing
      })
      .select(`
        *,
        skill:skills(*)
      `)
      .single();

    if (academySkillError) {
      console.error('❌ Error adding skill to academy:', academySkillError);
      return;
    }
    console.log('✅ Chess skill added to academy');

    // Step 6: Create a test batch
    console.log('📚 Creating test batch...');
    const { data: batch, error: batchError } = await supabase
      .from('batches')
      .insert({
        name: 'Beginner Chess Batch',
        academy_id: academy.id,
        skill_id: skillId,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
        max_students: 20,
        status: 'active'
      })
      .select()
      .single();

    if (batchError) {
      console.error('❌ Error creating batch:', batchError);
      return;
    }
    console.log('✅ Test batch created:', batch.id);

    console.log('\n🎉 Test academy setup complete!');
    console.log('📊 Academy Details:');
    console.log(`   Name: ${academy.name}`);
    console.log(`   ID: ${academy.id}`);
    console.log(`   Owner: ${academy.owner?.full_name || academy.owner?.email}`);
    console.log(`   Location: ${academy.location?.name}, ${academy.location?.city}`);
    console.log(`   Status: ${academy.status}`);
    console.log(`   Phone: ${academy.phone_number}`);
    console.log(`   Skill: Chess`);
    console.log(`   Batch: Beginner Chess Batch`);

    console.log('\n🔗 Next Steps:');
    console.log('1. Sign in with meetneerajv@gmail.com');
    console.log('2. Navigate to /academy to see the academy dashboard');
    console.log('3. Test the academy management features');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
createTestAcademy();
