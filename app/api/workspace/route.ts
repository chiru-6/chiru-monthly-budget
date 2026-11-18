import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../../chatgpt-auth';
import { handleWorkspace } from '../../../lib/workspace-service.mjs';
export const dynamic='force-dynamic';
async function handle(request:Request){try{return await handleWorkspace(request,env.DB,await getChatGPTUser())}catch{return Response.json({error:'Account storage could not be reached. Your edits have not been confirmed saved.'},{status:503,headers:{'Cache-Control':'no-store'}})}}
export const GET=handle;
export const PUT=handle;
