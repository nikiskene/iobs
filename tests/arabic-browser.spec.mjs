import {test,expect} from '@playwright/test';
const uid='00000000-0000-4000-8000-000000000001';
const chapter={id:uid,name:'Amsterdam',city:'Amsterdam',continent:'Europe',headline:'Hoi!',description:'',email:'amsterdam@iobs.cc',hero_image_url:'https://example.com/city.webp'};
async function mock(page,{admin=false,overrides=false}={}){
 const saved=[];
 if(admin)await page.addInitScript(uid=>localStorage.setItem('sb-bunfdlazirfheomhvjdz-auth-token',JSON.stringify({access_token:'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTQwMDAtODAwMC0wMDAwMDAwMDAwMDEifQ.fixture',refresh_token:'fixture',expires_at:Math.floor(Date.now()/1000)+3600,user:{id:uid,email:'fixture@example.com',aud:'authenticated',role:'authenticated'}})),uid);
 await page.route('**/*.supabase.co/**',async route=>{
  const request=route.request(),path=new URL(request.url()).pathname;let data=[];
  if(path.includes('/storage/'))return route.continue();
  if(path.endsWith('/profiles'))data={id:uid,full_name:'Admin fixture',is_active:true,role:'admin',is_team_member:true};
  if(path.endsWith('/chapters'))data=[chapter];
  if(path.endsWith('/award_site_content')){
   if(request.method()==='POST'){saved.push(request.postDataJSON());return route.fulfill({status:201,contentType:'application/json',body:'[]'});}
   if(overrides)data=[
    {content_key:'v3_hero',locale:'en',section:'homepage_v3',headline:'Beautiful Success',media_url:'https://example.com/current-image.webp',display_order:200,is_active:true},
    {content_key:'v3_hero__ar',locale:'ar',section:'homepage_v3',headline:'عنوان عربي محفوظ',media_url:null,display_order:200,is_active:true},
    {content_key:'text_fixture__ar',locale:'ar',section:'translations',label:'Amsterdam',body:'أمستردام المخصصة',display_order:1000,is_active:true},
   ];
  }
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
 });
 return saved;
}
for(const width of [320,390,768,1440])test(`Arabic homepage, RTL and language persistence at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});await mock(page);await page.goto('/?lang=ar');
 await expect(page.locator('html')).toHaveAttribute('dir','rtl');await expect(page.locator('h1')).toHaveText('النجاحالجميل');
 await expect(page.locator('.institute-header nav')).toContainText('الفروع');
 expect(await page.locator('.home-v3-portrait img').first().evaluate(e=>getComputedStyle(e).transform)).toBe('matrix(-1, 0, 0, 1, 0, 0)');
 await page.locator('.homepage-chapters').scrollIntoViewIfNeeded();await expect(page.locator('.homepage-chapter-copy')).toContainText('أمستردام');
 expect(await page.locator('.homepage-chapter-tile img').evaluate(e=>getComputedStyle(e).transform)).toBe('none');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.locator('.homepage-chapter-tile a').click();await expect(page.locator('h1')).toHaveText('الفروع');await expect(page.locator('.chapter-card-title')).toHaveText('أمستردام');
 await page.locator('.language-switcher').selectOption('en');await expect(page.locator('html')).toHaveAttribute('dir','ltr');await expect(page.locator('h1')).toHaveText('Chapters');await expect(page.locator('.chapter-card-title')).toHaveText('Amsterdam');
 await page.locator('.institute-logo').click();await expect(page.locator('h1')).toHaveText('BEAUTIFULSuccess');expect(await page.locator('.home-v3-portrait img').first().evaluate(e=>getComputedStyle(e).transform)).toBe('none');
});
test('Arabic override wins, exact source matching and English copy remains intact',async({page})=>{
 await mock(page,{overrides:true});await page.goto('/?lang=ar');await expect(page.locator('h1')).toHaveText('عنوانعربي محفوظ');await page.locator('.homepage-chapters').scrollIntoViewIfNeeded();await expect(page.locator('.homepage-chapter-copy')).toContainText('أمستردام المخصصة');
 await page.locator('.language-switcher').selectOption('en');await expect(page).toHaveURL(/lang=en/);await expect(page.locator('h1')).toHaveText('BEAUTIFULSuccess');await expect(page.locator('.homepage-chapter-copy')).toContainText('Amsterdam');await page.reload();await expect(page.locator('html')).toHaveAttribute('lang','en');
});
test('Both carousel images stay mirrored during Arabic crossfade',async({page})=>{
 await mock(page);await page.goto('/?lang=ar');await expect(page.locator('.home-v3-portrait img.leaving')).toBeAttached({timeout:15000});
 const transforms=await page.locator('.home-v3-portrait img').evaluateAll(images=>images.map(img=>getComputedStyle(img).transform));expect(transforms).toEqual(['matrix(-1, 0, 0, 1, 0, 0)','matrix(-1, 0, 0, 1, 0, 0)']);
});
test('Admin can save Arabic CMS translation with correct locale and preserved English source',async({page})=>{
 const saved=await mock(page,{admin:true});await page.setViewportSize({width:390,height:900});await page.goto('/admin/content/site-copy');
 await page.getByLabel('Content language',{exact:true}).selectOption('ar');await page.getByLabel('Search copy or translation').fill('Hoi!');
 await page.getByRole('button').filter({hasText:'Hoi!'}).click();await expect(page.getByLabel('English source (read only)')).toHaveValue('Hoi!');await expect(page.getByLabel('English source (read only)')).toHaveAttribute('readonly','');
 await page.getByLabel('Arabic translation',{exact:true}).fill('مرحباً بكم');await page.getByRole('button',{name:'Save translation',exact:true}).click();await expect.poll(()=>saved.length).toBe(1);expect(saved[0]).toMatchObject({locale:'ar',section:'translations',label:'Hoi!',body:'مرحباً بكم'});expect(saved[0].content_key).toMatch(/^text_.*__ar$/);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
