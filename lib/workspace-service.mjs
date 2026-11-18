const allowedTypes=new Set(['expense','income','saving','giving','transfer']);
const text=(x,max=500)=>typeof x==='string'&&x.length<=max;
const amount=x=>Number.isSafeInteger(x)&&x>=0&&x<=1e14;
const record=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const month=x=>typeof x==='string'&&/^\d{4}-(0[1-9]|1[0-2])$/.test(x);
const date=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!isNaN(Date.parse(x))&&new Date(x).toISOString().slice(0,10)===x;
const safeKey=k=>!['__proto__','constructor','prototype'].includes(k);
const id=x=>typeof x==='string'&&/^[a-zA-Z0-9-]{1,100}$/.test(x);
export function validWorkspace(s){
 if(!record(s)||s.version!==1||typeof s.demo!=='boolean'||!['USD','INR','EUR','GBP','CAD','AUD','JPY'].includes(s.currency)||!amount(s.plannedIncome))return false;
 for(const k of ['transactions','goals','bills'])if(!Array.isArray(s[k])||s[k].length>20000||!s[k].every(x=>record(x)&&id(x.id))||new Set(s[k].map(x=>x.id)).size!==s[k].length)return false;
 if(!s.transactions.every(t=>text(t.description)&&text(t.account)&&text(t.category)&&safeKey(t.category)&&date(t.date)&&amount(t.amount)&&t.amount>0&&allowedTypes.has(t.type)&&(!t.goalId||id(t.goalId))))return false;
 if(!s.goals.every(g=>text(g.name,80)&&amount(g.target)&&g.target>0&&amount(g.saved)&&(!g.deadline||date(g.deadline))&&(!g.icon||text(g.icon,20))))return false;
 if(!s.bills.every(b=>text(b.name,80)&&text(b.category)&&amount(b.amount)&&b.amount>0&&Number.isInteger(b.day)&&b.day>=1&&b.day<=31&&Array.isArray(b.paid)&&b.paid.length<2400&&b.paid.every(month)&&(!b.links||(record(b.links)&&Object.entries(b.links).every(([m,v])=>month(m)&&id(v))))))return false;
 if(!record(s.budgets)||Object.keys(s.budgets).length>2400||!Object.entries(s.budgets).every(([m,p])=>month(m)&&record(p)&&Object.keys(p).length<200&&Object.entries(p).every(([k,n])=>text(k,100)&&safeKey(k)&&amount(n))))return false;
 return !s.incomePlans||(record(s.incomePlans)&&Object.keys(s.incomePlans).length<=2400&&Object.entries(s.incomePlans).every(([m,n])=>month(m)&&amount(n)));
}
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store, private','Vary':'Cookie','X-Content-Type-Options':'nosniff'}});
export async function handleWorkspace(request,db,user){
 if(!user?.userId)return json({error:'Sign in to access your workspace.'},401);
 if(!db)return json({error:'Account storage is temporarily unavailable.'},503);
 if(request.method==='GET'){
  const row=await db.prepare('SELECT data, revision, updated_at FROM workspaces WHERE user_id = ?').bind(user.userId).first();
  return json({state:row?JSON.parse(row.data):null,revision:row?.revision||0,updatedAt:row?.updated_at||null});
 }
 if(request.method!=='PUT')return json({error:'Method not allowed.'},405);
 if(request.headers.get('origin')!==new URL(request.url).origin||request.headers.get('x-chiru-request')!=='1')return json({error:'Request origin could not be verified.'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'JSON is required.'},415);
 if(Number(request.headers.get('content-length'))>5*1024*1024)return json({error:'Workspace exceeds the 5 MB limit.'},413);
 let payload;try{const raw=await request.text();if(new TextEncoder().encode(raw).length>5*1024*1024)return json({error:'Workspace exceeds the 5 MB limit.'},413);payload=JSON.parse(raw)}catch{return json({error:'Invalid JSON.'},400)}
 if(payload?.accountId!==user.userId)return json({error:'Your signed-in account changed. Export unsaved edits and sign in again.'},401);
 if(!record(payload)||!Number.isSafeInteger(payload.revision)||payload.revision<0||!validWorkspace(payload.state))return json({error:'Workspace data is invalid. Check transaction values, dates and row limits.'},400);
 const data=JSON.stringify(payload.state),now=new Date().toISOString();
 // Identity comes only from the hosting platform, never from the body or URL.
 const result=payload.revision===0
  ?await db.prepare('INSERT INTO workspaces (user_id, data, revision, updated_at) VALUES (?, ?, 1, ?) ON CONFLICT(user_id) DO NOTHING RETURNING revision').bind(user.userId,data,now).first()
  :await db.prepare('UPDATE workspaces SET data = ?, revision = revision + 1, updated_at = ? WHERE user_id = ? AND revision = ? RETURNING revision').bind(data,now,user.userId,payload.revision).first();
 if(!result)return json({error:'This workspace changed in another tab or device. Download your unsaved backup, then reload the latest version.'},409);
 return json({revision:result.revision,updatedAt:now});
}
