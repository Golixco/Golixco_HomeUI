// Optional single paid provider check. Never run implicitly or force Gemini quota exhaustion.
import {createBackboard,backboardConfigured} from '../server/providers.ts';
try{process.loadEnvFile('.env.local');}catch{}
if(!process.argv.includes('--confirm')||!backboardConfigured()){
 console.error('Requires --confirm, a private Backboard key/model and storage approval. No request sent.');process.exit(1);
}
const deleted=[];
const fetcher=async(url,init)=>{
 const response=await fetch(url,init);
 if(init?.method==='DELETE'&&response.ok)deleted.push(String(url));
 return response;
};
try{
 let chars=0;
 for await(const chunk of createBackboard(fetcher)('What is Lolixco? Explain its public-beta limitations.',[],AbortSignal.timeout(30000)))chars+=chunk.length;
 if(!chars||!deleted.some(p=>p.includes('/threads/'))||!deleted.some(p=>p.includes('/assistants/')))throw new Error('Incomplete verification');
 for(const url of deleted){const r=await fetch(url,{headers:{'X-API-Key':process.env.BACKBOARD_API_KEY},signal:AbortSignal.timeout(5000)});if(r.status!==404)throw new Error('Deletion not independently confirmed');}
 console.log('One synthetic stream completed. Temporary thread and assistant return 404 after deletion. No content, IDs or credentials logged.');
}catch{console.error('Live verification incomplete. Check account usage and temporary-state cleanup privately. No provider error body logged.');process.exitCode=1;}
