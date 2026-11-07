import sharp from 'sharp';
import {NextRequest,NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {account,score,progress} from '@/lib/rules';
import {hash,compare} from 'bcryptjs';
import {randomBytes} from 'crypto';
import {writeFile,mkdir,unlink} from 'fs/promises';
export const runtime='nodejs';
const attempts=new Map<string,{count:number,until:number}>();
async function handle(req:NextRequest){
 const p=req.nextUrl.pathname.slice(5).split('/'); const method=req.method;
 const session=req.cookies.get('tomtube_session')?.value;
 const s=session?await db.session.findUnique({where:{id:session}}):null;
 const user=s&&s.expires>new Date()?await db.user.findUnique({where:{id:s.userId}}):null;
 const safe=(u:any)=>u?{id:u.id,name:u.name,username:u.username,bio:u.bio,avatar:u.avatar,banner:u.banner}:null;
 const json=(v:any,status=200)=>NextResponse.json(v,{status});
 if(method!=='GET'){
  const origin=req.headers.get('origin'); if(!origin||origin!==req.nextUrl.origin&&origin!==`http://${req.headers.get('host')}`)return json({error:'Invalid request origin'},403);
 }
 try{
 if(p[0]==='me')return json(safe(user));
 if(p[0]==='auth'){
 if(method!=='POST')return json({error:'Method not allowed'},405);
  const key=req.headers.get('x-forwarded-for')||'local'; const now=Date.now();const a=attempts.get(key);if(a&&a.until>now&&a.count>=30)return json({error:'Too many attempts. Try again in 15 minutes.'},429);if(!a||a.until<now)attempts.set(key,{count:1,until:now+900000});else a.count++;if(attempts.size>10000)for(const [k,v] of attempts)if(v.until<now)attempts.delete(k);
  if(p[1]==='logout'){if(s)await db.session.delete({where:{id:s.id}});const r=json({ok:true});r.cookies.delete('tomtube_session');return r;}
  const b=await req.json();let u;
  if(p[1]==='register'){const a=account.parse(b);u=await db.user.create({data:{...a,password:await hash(a.password,12)}});await db.playlist.create({data:{userId:u.id,name:'Watch Later'}});}
  else {if(typeof b.email!=='string'||typeof b.password!=='string')throw Error('Email and password required');u=await db.user.findUnique({where:{email:b.email}});if(!u||!await compare(b.password,u.password))return json({error:'Invalid email or password'},401);}
  const token=randomBytes(32).toString('hex');await db.session.create({data:{id:token,userId:u.id,expires:new Date(Date.now()+7*86400000)}});const r=json(safe(u));r.cookies.set('tomtube_session',token,{httpOnly:true,sameSite:'lax',secure:req.nextUrl.protocol==='https:',path:'/',maxAge:604800});return r;
 }
 if(p[0]==='videos'&&method==='GET'){
 const q=req.nextUrl.searchParams.get('q')||'';const category=req.nextUrl.searchParams.get('category');const sort=req.nextUrl.searchParams.get('sort');
 const channels=await db.user.findMany({where:{name:{contains:q}}});
 const videos=await db.video.findMany({where:{visibility:'public',status:'ready',...(category&&category!=='All'?{category}:{}),...(q?{OR:[{title:{contains:q}},{description:{contains:q}},{tags:{contains:q}},{userId:{in:channels.map(c=>c.id)}}]}:{})},orderBy:sort==='views'?{views:'desc'}:sort==='duration'?{duration:'desc'}:{createdAt:'desc'}});
 const history=user?await db.watchHistory.findMany({where:{userId:user.id}}):[]; const watched=await db.video.findMany({where:{id:{in:history.map(h=>h.videoId)}}});const subs=user?await db.subscription.findMany({where:{userId:user.id}}):[];
 if(!sort)videos.sort((a,b)=>score(b,watched.map(v=>v.category),subs.some(s=>s.channelId===b.userId))-score(a,watched.map(v=>v.category),subs.some(s=>s.channelId===a.userId)));
 const ordered:typeof videos=[];const pool=[...videos];while(pool.length){let index=!sort&&!q?pool.findIndex(v=>!ordered.slice(-2).some(o=>o.userId===v.userId)):0;if(index<0)index=0;ordered.push(pool.splice(index,1)[0]);}return json(await Promise.all(ordered.map(async v=>({...v,channel:safe(await db.user.findUnique({where:{id:v.userId}}))}))));
 }
 if(p[0]==='watch'&&method==='GET'){
 const v=await db.video.findUnique({where:{id:p[1]}});if(!v||v.visibility==='private'&&user?.id!==v.userId||v.status!=='ready')return json({error:'Video not found'},404);
 await db.video.update({where:{id:v.id},data:{views:{increment:1}}});
 const comments=await db.comment.findMany({where:{videoId:v.id},orderBy:{createdAt:'desc'}});
 return json({...v,channel:safe(await db.user.findUnique({where:{id:v.userId}})),subscribers:await db.subscription.count({where:{channelId:v.userId}}),subscribed:!!(user&&await db.subscription.findUnique({where:{userId_channelId:{userId:user.id,channelId:v.userId}}})),likes:await db.like.count({where:{targetId:v.id,kind:'video',value:1}}),liked:user?await db.like.findUnique({where:{userId_targetId_kind:{userId:user.id,targetId:v.id,kind:'video'}}}):null,comments:await Promise.all(comments.map(async c=>({...c,user:safe(await db.user.findUnique({where:{id:c.userId}})),likes:await db.like.count({where:{targetId:c.id,kind:'comment'}})})))});
 }
 if(p[0]==='channel'&&method==='GET'){const u=await db.user.findUnique({where:{username:p[1]}});if(!u)return json({error:'Channel not found'},404);return json({...safe(u),subscribers:await db.subscription.count({where:{channelId:u.id}}),videos:await db.video.findMany({where:{userId:u.id,...(user?.id===u.id?{}:{visibility:'public',status:'ready'})}})});}
 if(!user)return json({error:'Please sign in to continue'},401);
 if(method==='GET'&&p[0]!=='library')return json({error:'Method not allowed'},405);
 if(Number(req.headers.get('content-length')||0)>101*1024*1024)return json({error:'Request too large'},413);
 if(p[0]==='library'&&method==='GET'){return json({playlists:await db.playlist.findMany({where:{userId:user.id}}),items:await db.playlistItem.findMany({where:{playlistId:{in:(await db.playlist.findMany({where:{userId:user.id}})).map(p=>p.id)}}}),history:await db.watchHistory.findMany({where:{userId:user.id},orderBy:{updatedAt:'desc'}}),likes:await db.like.findMany({where:{userId:user.id,kind:'video',value:1}}),subscriptions:await db.subscription.findMany({where:{userId:user.id}}),notifications:await db.notification.findMany({where:{userId:user.id}}),jobs:await db.videoProcessingJob.findMany({where:{userId:user.id},orderBy:{createdAt:'desc'}})});}
 if(p[0]==='image'){const form=await req.formData();const file=form.get('file') as File;if(!file||file.size>5*1024*1024)throw Error('Image must be under 5 MB');const name=randomBytes(16).toString('hex')+'.webp';await mkdir('public/media',{recursive:true});const image=await sharp(Buffer.from(await file.arrayBuffer()),{limitInputPixels:20000000}).rotate().resize({width:1600,height:600,fit:'inside',withoutEnlargement:true}).webp().toBuffer();await writeFile('public/media/'+name,image);return json({url:'/media/'+name});}
 if(p[0]==='upload'){
 if(await db.videoProcessingJob.count({where:{userId:user.id,createdAt:{gt:new Date(Date.now()-3600000)}}})>=10)return json({error:'Upload limit reached: 10 per hour'},429);
 const form=await req.formData();const f=form.get('file') as File;if(!f||f.size>100*1024*1024||f.size<16)throw Error('Choose a video up to 100 MB');
 const title=String(form.get('title')||f.name).slice(0,150);await mkdir('storage/incoming',{recursive:true});const file=`storage/incoming/${randomBytes(16).toString('hex')}`;await writeFile(file,Buffer.from(await f.arrayBuffer()));
 let job;try{job=await db.videoProcessingJob.create({data:{userId:user.id,title,description:String(form.get('description')||'').slice(0,5000),category:String(form.get('category')||'Technology'),visibility:['public','unlisted','private'].includes(String(form.get('visibility')))?String(form.get('visibility')):'public',file}});}catch(e){await unlink(file).catch(()=>{});throw e}return json(job,202);
 }
 const b=method==='GET'?{}:await req.json();
 if(p[0]==='profile'){const data:any={};for(const key of ['name','bio','avatar','banner'])if(typeof b[key]==='string'){if((key==='avatar'||key==='banner')&&b[key]&&!/^\/media\/[a-z0-9-]+\.(webp|jpg|png)$/.test(b[key]))throw Error('Upload a local image first');data[key]=b[key].slice(0,key==='bio'?2000:200);}if(b.newPassword){if(!await compare(b.password,user.password)||b.newPassword.length<10)throw Error('Current password incorrect or new password too short');data.password=await hash(b.newPassword,12);}return json(safe(await db.user.update({where:{id:user.id},data})));}
 if(p[0]==='like'){const kind=b.kind==='comment'?'comment':'video';if(kind==='video'){const v=await db.video.findUnique({where:{id:b.id}});if(!v||v.visibility==='private'&&v.userId!==user.id)throw Error('Video unavailable');}else if(!await db.comment.findUnique({where:{id:b.id}}))throw Error('Comment unavailable');const where={userId_targetId_kind:{userId:user.id,targetId:b.id,kind}};const old=await db.like.findUnique({where});if(old&&old.value===(b.value||1))await db.like.delete({where});else await db.like.upsert({where,create:{userId:user.id,targetId:b.id,kind,value:b.value===-1?-1:1},update:{value:b.value===-1?-1:1}});return json({ok:true});}
 if(p[0]==='subscribe'){if(b.id===user.id||!await db.user.findUnique({where:{id:b.id}}))throw Error('Invalid channel');const where={userId_channelId:{userId:user.id,channelId:b.id}};if(await db.subscription.findUnique({where}))await db.subscription.delete({where});else await db.subscription.create({data:{userId:user.id,channelId:b.id}});return json({ok:true});}
 if(p[0]==='comment'){
 if(p[1]){const c=await db.comment.findUnique({where:{id:p[1]}});if(c?.userId!==user.id)return json({error:'Forbidden'},403);if(method==='DELETE'){await db.comment.deleteMany({where:{parentId:c.id}});await db.like.deleteMany({where:{targetId:c.id,kind:'comment'}});await db.comment.delete({where:{id:c.id}});}else {if(!b.body?.trim()||b.body.length>2000)throw Error('Comment must be 1–2000 characters');await db.comment.update({where:{id:c.id},data:{body:b.body}});}return json({ok:true});}
 const v=await db.video.findUnique({where:{id:b.videoId}});if(!v||v.visibility==='private'&&v.userId!==user.id)throw Error('Video unavailable');if(!b.body?.trim()||b.body.length>2000)throw Error('Comment must be 1–2000 characters');if(b.parentId){const parent=await db.comment.findUnique({where:{id:b.parentId}});if(parent?.videoId!==v.id)throw Error('Invalid reply');}return json(await db.comment.create({data:{userId:user.id,videoId:v.id,body:b.body,parentId:b.parentId||null}}));
 }
 if(p[0]==='history'){if(method==='DELETE'){await db.watchHistory.deleteMany({where:{userId:user.id,...(b.id?{videoId:b.id}:{})}});}else {const v=await db.video.findUnique({where:{id:b.id}});if(!v)throw Error('Video missing');await db.watchHistory.upsert({where:{userId_videoId:{userId:user.id,videoId:b.id}},create:{userId:user.id,videoId:b.id,progress:progress(Number(b.progress),v.duration)},update:{progress:progress(Number(b.progress),v.duration)}});}return json({ok:true});}
 if(p[0]==='playlist'){if(!b.id){if(!b.name?.trim()||b.name.length>100)throw Error('Name must be 1–100 characters');return json(await db.playlist.create({data:{userId:user.id,name:b.name}}));}const list=await db.playlist.findUnique({where:{id:b.id}});if(list?.userId!==user.id)return json({error:'Forbidden'},403);if(method==='DELETE'){await db.playlistItem.deleteMany({where:{playlistId:list.id}});await db.playlist.delete({where:{id:list.id}});}else if(b.videoId){if(b.remove)await db.playlistItem.deleteMany({where:{playlistId:list.id,videoId:b.videoId}});else {if(!await db.video.findUnique({where:{id:b.videoId}}))throw Error('Video missing');await db.playlistItem.upsert({where:{playlistId_videoId:{playlistId:list.id,videoId:b.videoId}},create:{playlistId:list.id,videoId:b.videoId,position:await db.playlistItem.count({where:{playlistId:list.id}})},update:{...(typeof b.position==='number'?{position:b.position}:{})}});}}else if(b.name?.trim())await db.playlist.update({where:{id:list.id},data:{name:b.name.slice(0,100)}});return json({ok:true});}
 if(p[0]==='video'){const v=await db.video.findUnique({where:{id:p[1]}});if(v?.userId!==user.id)return json({error:'Forbidden'},403);if(method==='DELETE'){await db.$transaction([db.comment.deleteMany({where:{videoId:v.id}}),db.like.deleteMany({where:{targetId:v.id}}),db.watchHistory.deleteMany({where:{videoId:v.id}}),db.playlistItem.deleteMany({where:{videoId:v.id}}),db.videoAsset.deleteMany({where:{videoId:v.id}}),db.video.delete({where:{id:v.id}})]);if(!v.demo)for(const path of [v.source,v.thumbnail])if(path.startsWith('/api/media/'))await unlink(`storage/media/${path.split('/').pop()}`).catch(()=>{});}else {if(!b.title?.trim())throw Error('Title required');await db.video.update({where:{id:v.id},data:{title:b.title.slice(0,150),description:String(b.description||'').slice(0,5000),visibility:['public','private','unlisted'].includes(b.visibility)?b.visibility:v.visibility}});}return json({ok:true});}
 return json({error:'Not found'},404);
 }catch(e:any){console.error('API error',e.message);return json({error:e.code==='P2002'?'This account already exists':e.message?.slice(0,250)||'Request failed'},400);}
}
export const GET=handle;export const POST=handle;export const PATCH=handle;export const DELETE=handle;
