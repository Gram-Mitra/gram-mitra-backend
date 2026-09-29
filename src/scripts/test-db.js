require('dotenv').config();
const { supabase, supabaseAdmin, TABLES } = require('../config/supabase');
const config = require('../config');

async function testSupabaseConnection() {
  console.log('\n=================================================');
  console.log('🔍 Testing Supabase Database Connection...');
  console.log('=================================================');
  console.log(`🌐 Supabase URL: ${config.supabase.url || '(not set)'}`);
  console.log(`🔑 Anon Key: ${config.supabase.anonKey ? 'Configured ✅' : 'Missing ❌'}`);
  console.log(`🛡️  Service Role Key: ${config.supabase.serviceRoleKey ? 'Configured ✅' : 'Missing (optional) ⚠️'}`);
  console.log('-------------------------------------------------');

  if (!supabase) {
    console.error('❌ Supabase client failed to initialize. Please check your .env file.');
    process.exit(1);
  }

  const clientToTest = supabaseAdmin || supabase;

  try {
    console.log('📡 Pinging Supabase project...');
    
    // Check tables status
    const tableKeys = Object.keys(TABLES);
    const results = {};
    let missingTables = [];

    for (const key of tableKeys) {
      const tableName = TABLES[key];
      const { data, error } = await clientToTest
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        if (error.code === '42P01') {
          results[tableName] = 'Missing (Not created in DB yet) ⚠️';
          missingTables.push(tableName);
        } else {
          results[tableName] = `Error: ${error.message} ❌`;
        }
      } else {
        results[tableName] = 'Ready & Connected ✅';
      }
    }

    console.log('\n📊 Table Status:');
    for (const [table, status] of Object.entries(results)) {
      console.log(`  - ${table.padEnd(20)}: ${status}`);
    }

    console.log('-------------------------------------------------');

    if (missingTables.length === 0) {
      console.log('🎉 SUCCESS: Backend is PERFECTLY linked to Supabase!');
      console.log('All 8 database tables are present and accessible.');
    } else if (missingTables.length === tableKeys.length) {
      console.log('✅ Connection to Supabase is SUCCESSFUL!');
      console.log('⚠️  However, the 8 tables are not yet created in your Supabase database.');
      console.log('👉 To create them:');
      console.log('   1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/idawmapnmtapmkxotzlw');
      console.log('   2. Go to the "SQL Editor" tab on the left');
      console.log('   3. Paste the contents of "src/db/schema.sql" and click "Run"');
    } else {
      console.log(`✅ Connected! Missing ${missingTables.length} tables: ${missingTables.join(', ')}`);
      console.log('👉 Run "src/db/schema.sql" in your Supabase SQL editor to create missing tables.');
    }

    console.log('=================================================\n');
  } catch (err) {
    console.error('❌ Connection Failed:', err.message);
  }
}

testSupabaseConnection();
