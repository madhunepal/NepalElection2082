import fs from 'fs';
const file = '/Users/madhunepal/Documents/Codes/ElectionNepal/nepal-election-dashboard/src/pages/result.astro';
let content = fs.readFileSync(file, 'utf8');

const replacement = `          // Fallback to MOCK data since the external JSON returned HTML
          if ((!Array.isArray(constituenciesData) || constituenciesData.length === 0) && (!Array.isArray(prData) || prData.length === 0)) {
            console.log('[Polling] Injecting mock data for demonstration...');
            
            prData = [
              { party_name: 'Nepali Congress (NC)', fptp_leading: 12, fptp_won: 45, pr_votes: 1250000, pr_percentage: 28.5 },
              { party_name: 'CPN (UML)', fptp_leading: 8, fptp_won: 40, pr_votes: 1100000, pr_percentage: 25.1 },
              { party_name: 'Rastriya Swatantra Party (RSP)', fptp_leading: 15, fptp_won: 10, pr_votes: 950000, pr_percentage: 21.6 },
              { party_name: 'CPN (Maoist Centre)', fptp_leading: 5, fptp_won: 12, pr_votes: 500000, pr_percentage: 11.4 },
              { party_name: 'Rastriya Prajatantra Party', fptp_leading: 2, fptp_won: 5, pr_votes: 300000, pr_percentage: 6.8 }
            ];
            
            constituenciesData = [{
              candidates: [
                { name: 'Gagan Kumar Thapa', votes: 25000, percentage: 55.2, status: 'won' },
                { name: 'Rabi Lamichhane', votes: 35000, percentage: 68.5, status: 'won' },
                { name: 'KP Sharma Oli', votes: 28000, percentage: 52.1, status: 'leading' },
                { name: 'Pushpa Kamal Dahal', votes: 15000, percentage: 45.0, status: 'leading' },
                { name: 'Rajendra Lingden', votes: 12000, percentage: 25.5, status: 'counting' }
              ]
            }];
          }

          // 1. Process constituencies data if valid list`;

content = content.replace("          // 1. Process constituencies data if valid list", replacement);

fs.writeFileSync(file, content);
console.log('Applied mock data block to result.astro');
