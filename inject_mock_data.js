import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf8');
let supabaseUrl = '';
let supabaseKey = '';

envContent.split('\n').forEach(line => {
  if (line.startsWith('PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
  if (line.startsWith('PUBLIC_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
});

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase credentials not found in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inject() {
  console.log("Injecting mock party data...");
  const partyData = [
    { party_name: 'Nepali Congress (NC)', fptp_leading: 12, fptp_won: 45, pr_votes: 1250000, pr_percentage: 28.5 },
    { party_name: 'CPN (UML)', fptp_leading: 8, fptp_won: 40, pr_votes: 1100000, pr_percentage: 25.1 },
    { party_name: 'Rastriya Swatantra Party (RSP)', fptp_leading: 15, fptp_won: 10, pr_votes: 950000, pr_percentage: 21.6 },
    { party_name: 'CPN (Maoist Centre)', fptp_leading: 5, fptp_won: 12, pr_votes: 500000, pr_percentage: 11.4 },
    { party_name: 'Rastriya Prajatantra Party', fptp_leading: 2, fptp_won: 5, pr_votes: 300000, pr_percentage: 6.8 }
  ];

  for (const p of partyData) {
    const { error } = await supabase.from('party_summary').upsert({
      ...p,
      last_updated: new Date().toISOString()
    }, { onConflict: 'party_name', ignoreDuplicates: false });
    if (error) console.error("Error upserting party:", error);
  }

  console.log("Injecting mock candidate data...");
  const candidatesData = [
    { name: 'Gagan Kumar Thapa', party: 'Nepali Congress', district: 'Kathmandu', constituency: '4', total_votes_received: 25000, vote_percentage: 55.2, status: 'won' },
    { name: 'Rabi Lamichhane', party: 'Rastriya Swatantra Party', district: 'Chitwan', constituency: '2', total_votes_received: 35000, vote_percentage: 68.5, status: 'won' },
    { name: 'KP Sharma Oli', party: 'CPN (UML)', district: 'Jhapa', constituency: '5', total_votes_received: 28000, vote_percentage: 52.1, status: 'leading' },
    { name: 'Pushpa Kamal Dahal', party: 'CPN (Maoist Centre)', district: 'Gorkha', constituency: '2', total_votes_received: 15000, vote_percentage: 45.0, status: 'leading' },
    { name: 'Rajendra Lingden', party: 'Rastriya Prajatantra Party', district: 'Jhapa', constituency: '3', total_votes_received: 12000, vote_percentage: 25.5, status: 'counting' }
  ];

  // Update existing candidates by name 
  for (const c of candidatesData) {
    const { error } = await supabase.from('candidates').update({
        total_votes_received: c.total_votes_received,
        vote_percentage: c.vote_percentage,
        status: c.status,
        last_updated: new Date().toISOString()
    }).ilike('name', `%${c.name.split(' ')[0]}%`);
    if(error) console.error("Error updating candidate:", error);
  }

  console.log("Mock data injected. Refresh the page to see results!");
}

inject();
