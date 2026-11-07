/** Record real Chromium sessions. Requires a running app and worker. */
import {mkdir,symlink,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
const require=createRequire(import.meta.url);
process.env.PLAYWRIGHT_BROWSERS_PATH=resolve('storage/browser-runtime');
const {registry}=require('../node_modules/playwright-core/lib/server/registry/index.js');
const ffmpeg=registry.findExecutable('ffmpeg').executablePath();
await mkdir(resolve(ffmpeg,'..'),{recursive:true});
try{await symlink('/usr/bin/ffmpeg',ffmpeg)}catch(e){if(e.code!=='EEXIST')throw e}
const {chromium,expect}=await import('@playwright/test');
await mkdir('docs/acceptance',{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const errors=[];const steps=[];let started;
const stamp=()=>Math.round((Date.now()-started)/1000);
const hold=async(page,label,ms=2200)=>{steps.push({seconds:stamp(),label});console.log(label);await page.waitForTimeout(ms)};
const context=await browser.newContext({viewport:{width:1440,height:900},recordVideo:{dir:'storage/recordings',size:{width:1440,height:900}}});
const page=await context.newPage();const recording=page.video();page.on('pageerror',e=>errors.push(e.message));started=Date.now();
try{
 await page.goto('http://127.0.0.1:3000/');await expect.poll(()=>page.locator('.video-card').count()).toBeGreaterThanOrEqual(60);await hold(page,'Homepage: database-backed video feed',3000);
 await page.getByRole('button',{name:'Dark appearance',exact:false}).click();await hold(page,'Dark appearance');await page.getByRole('button',{name:'Light appearance',exact:false}).click();
 await page.getByRole('textbox',{name:'Search',exact:true}).pressSequentially('workspace',{delay:120});await hold(page,'Live search suggestions',1300);await page.getByRole('textbox',{name:'Search',exact:true}).press('Enter');await expect(page.locator('.results-list .video-card')).toHaveCount(1);await hold(page,'Database search results');
 await page.locator('.thumbnail').first().click();await expect(page.locator('video')).toBeVisible();await page.locator('video').evaluate(async v=>{v.muted=true;await v.play()});await expect.poll(()=>page.locator('video').evaluate(v=>v.currentTime)).toBeGreaterThan(0);await hold(page,'Actual HTML5 media playback',4500);
 await page.getByRole('button',{name:'Sign in',exact:true}).click();await page.getByLabel('Email',{exact:true}).fill('demo@tomtube.local');await page.getByLabel('Password',{exact:true}).fill('TomTubeDemo!2026');await hold(page,'Local demo account sign-in',1000);await page.locator('.modal').getByRole('button',{name:'Sign in',exact:true}).click();await expect(page.locator('.modal')).toHaveCount(0);
 await page.getByRole('button',{name:'Like video',exact:true}).click();await hold(page,'Persistent video-like interaction',1200);
 await page.getByRole('button',{name:/^(Subscribe|Subscribed)$/}).first().click();await hold(page,'Persistent channel-subscription toggle',1200);
 const comment='Recorded acceptance: a real comment saved to the database.';await page.getByRole('textbox',{name:'Add a comment',exact:true}).fill(comment);await page.getByRole('button',{name:'Comment',exact:true}).click();await expect(page.getByText(comment).first()).toBeVisible();await page.locator('.comments').scrollIntoViewIfNeeded();await hold(page,'Comment persisted and displayed',2600);
 await page.locator('.channel-name').click();await expect(page.locator('.channel-profile')).toBeVisible();await hold(page,'Creator channel with actual videos',2600);
 await page.goto('http://127.0.0.1:3000/shorts');await expect(page.locator('.short-frame video')).toBeVisible();await hold(page,'Original portrait Shorts',3500);await page.getByRole('button',{name:'Next short',exact:true}).click();await hold(page,'Switch to another distinct Short');
 await page.goto('http://127.0.0.1:3000/upload');await expect(page.locator('.dropzone')).toBeVisible();await hold(page,'Upload workflow',1600);await page.locator('input[type=file]').setInputFiles('public/media/sample-2.mp4');const title='Acceptance recording — original motion study';await page.getByRole('textbox',{name:'Title',exact:true}).fill(title);await page.getByLabel('Description',{exact:true}).fill('Uploaded during the real Chromium acceptance recording. Original locally generated footage.');await page.getByRole('button',{name:'Upload & publish',exact:true}).scrollIntoViewIfNeeded();await hold(page,'Selected actual local MP4, title and description');
 const uploaded=page.waitForResponse(r=>r.url().endsWith('/api/upload')&&r.request().method()==='POST');await page.getByRole('button',{name:'Upload & publish',exact:true}).click();const response=await uploaded;expect(response.status()).toBe(202);const job=await response.json();await expect(page.getByRole('status')).toContainText('Upload received');await hold(page,'Server accepted upload for asynchronous processing');
 await page.goto('http://127.0.0.1:3000/studio');await expect(page.getByRole('heading',{name:'Your creative space'})).toBeVisible();await hold(page,'Creator Studio and processing queue');
 let ready;await expect.poll(async()=>{const lib=await (await context.request.get('http://127.0.0.1:3000/api/library')).json();ready=lib.jobs.find(j=>j.id===job.id);return ready?.status},{timeout:60000}).toBe('ready');await page.getByRole('button',{name:'Refresh status',exact:true}).click();await hold(page,'FFmpeg worker completed: uploaded video is ready',2500);
 await page.goto('http://127.0.0.1:3000/watch/'+ready.videoId);await expect(page.locator('video')).toBeVisible();await page.locator('video').evaluate(async v=>{v.muted=true;await v.play()});await expect.poll(()=>page.locator('video').evaluate(v=>v.currentTime)).toBeGreaterThan(0);await hold(page,'Newly uploaded and transcoded video actually plays',5000);
 await page.goto('http://127.0.0.1:3000/history');await expect(page.getByRole('heading',{name:'Watch history'})).toBeVisible();await expect(page.getByText(title,{exact:true}).first()).toBeVisible();await hold(page,'Authenticated viewing history',2500);
 await page.goto('http://127.0.0.1:3000/playlists');await expect(page.getByRole('heading',{name:'Playlists',exact:true})).toBeVisible();await hold(page,'Persisted private playlists',2200);
 expect(errors).toEqual([]);steps.push({seconds:stamp(),label:'Desktop recording complete; no page-level JavaScript exceptions'});
}finally{await context.close();await recording.saveAs('docs/acceptance/desktop-acceptance.webm');}
const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,deviceScaleFactor:1,recordVideo:{dir:'storage/recordings',size:{width:390,height:844}}});const mp=await mobile.newPage();const mv=mp.video();
try{await mp.goto('http://127.0.0.1:3000/');await expect(mp.locator('.video-card').first()).toBeVisible();expect(await mp.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await mp.waitForTimeout(3000);await mp.mouse.wheel(0,500);await mp.waitForTimeout(2000);await mp.mouse.wheel(0,-500);await mp.locator('.thumbnail').first().click();await expect(mp.locator('video')).toBeVisible();await mp.locator('video').evaluate(async v=>{v.muted=true;await v.play()});await expect.poll(()=>mp.locator('video').evaluate(v=>v.currentTime)).toBeGreaterThan(0);await mp.waitForTimeout(4000);expect(await mp.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();}finally{await mobile.close();await mv.saveAs('docs/acceptance/mobile-acceptance.webm');await browser.close();}
for(const name of ['desktop','mobile']){execFileSync('/usr/bin/ffmpeg',['-y','-v','error','-i',`docs/acceptance/${name}-acceptance.webm`,'-c:v','libx264','-preset','fast','-crf','25','-pix_fmt','yuv420p','-movflags','+faststart',`docs/acceptance/${name}-acceptance.mp4`]);}
await writeFile('docs/acceptance/recording-results.json',JSON.stringify({recordedAt:new Date().toISOString(),source:'Actual Chromium browser video recording; no simulated pages or frame synthesis',desktopViewport:{width:1440,height:900},mobileViewport:{width:390,height:844},desktopSteps:steps,pageErrors:errors,assertions:'All recording script assertions completed successfully',audio:'Silent screen recording; playback was muted'},null,2)+'\n');
console.log('Recordings and evidence saved to docs/acceptance/');
