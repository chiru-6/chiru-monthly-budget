import { getChatGPTUser, chatGPTSignInPath, chatGPTSignOutPath } from '../../chatgpt-auth';
export const dynamic='force-dynamic';
export async function GET(){const user=await getChatGPTUser();return Response.json({user:user?{id:user.userId,displayName:user.displayName,email:user.email}:null,signIn:chatGPTSignInPath('/budget.html'),signOut:chatGPTSignOutPath('/')},{headers:{'Cache-Control':'no-store, private','Vary':'Cookie'}})}
