import { test, expect } from '@playwright/test';
const uid = '00000000-0000-4000-8000-000000000001';
const item = { id: uid, title: 'An item to remove', owner_user_id: uid, status: 'pushing', priority: 'normal', requires_document: false, created_at: '2026-10-21', updated_at: '2026-10-21' };
const document = { id: uid, momentum_item_id: uid, title: 'Keep this file', file_name: 'fixture.pdf', storage_path: `${uid}/fixture.pdf`, category: 'operations', created_at: '2026-10-21' };
async function mock(page, { canDelete = true, role = 'admin', failure = false } = {}) {
  let items = [item]; const calls = [];
  await page.addInitScript(({uid}) => localStorage.setItem('sb-bunfdlazirfheomhvjdz-auth-token', JSON.stringify({access_token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTQwMDAtODAwMC0wMDAwMDAwMDAwMDEifQ.fixture', refresh_token:'fixture', expires_at:Math.floor(Date.now()/1000)+3600, user:{id:uid,email:'fixture@example.com',aud:'authenticated',role:'authenticated'}})),{uid});
  await page.route('**/*.supabase.co/**', async route => {
    const req = route.request(); const path = new URL(req.url()).pathname;
    calls.push({path,method:req.method(),body:req.postData()});
    let data = [], status = 200;
    if (path.includes('/auth/v1/user')) data = {id:uid,email:'fixture@example.com'};
    else if (path.includes('/profiles')) {
      const p = { id:uid, member_id:uid, full_name:'Fixture Admin', profile_name:'fixtureadmin',role,is_team_member:true,is_active:true };
      data = new URL(req.url()).searchParams.has('id') ? p : [p];
    } else if (path.includes('/rpc/my_managed_chapters')) data = [{id:uid,name:'Fixture Chapter',city:'Vienna',continent:'Europe',status:'active',email:'',headline:'',description:'',hero_image_url:'',latitude:48,longitude:16}];
    else if (path.includes('/rpc/admin_list_members')) data = [];
    else if (path.includes('/rpc/can_delete_work_items')) data = canDelete;
    else if (path.includes('/rpc/delete_work_item')) {
      if(failure){status=403;data={code:'42501',message:'Access revoked'};}
      else {items=[];data=null;}
    } else if (path.includes('/momentum_items')) data = items;
    else if (path.includes('/momentum_documents')) data = [document];
    else if (path.includes('/site_settings')) data = {logo_url:null};
    else if (path.includes('/nomination_settings')) data = {id:true,mode:'acknowledgement'};
    await route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
  });
  return calls;
}
async function openItem(page) {
  await page.goto('/work');
  if (page.viewportSize().width < 640) await page.getByRole('button',{name:'Facts Engine',exact:true}).click();
  await page.getByRole('button').filter({has:page.getByRole('heading',{name:item.title,exact:true})}).first().click();
}
for (const width of [320,390,1440]) {
  test(`granted admin cancels then deletes item on ${width}px`,async({page})=>{
    await page.setViewportSize({width,height:900});
    const calls=await mock(page);
    await openItem(page);
    await page.getByRole('button',{name:'Delete item',exact:true}).click();
    const dialog=page.getByRole('dialog',{name:'Delete Work item?',exact:true});
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button',{name:'Keep item',exact:true}).click();
    expect(calls.filter(c=>c.path.includes('/rpc/delete_work_item'))).toHaveLength(0);
    await page.getByRole('button',{name:'Delete item',exact:true}).click();
    await dialog.getByRole('button',{name:'Delete item',exact:true}).click();
    await expect(page.getByRole('heading',{name:item.title,exact:true})).toHaveCount(0);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(calls.filter(c=>c.path.includes('/rpc/delete_work_item'))).toHaveLength(1);
    expect(calls.filter(c=>c.method==='DELETE')).toHaveLength(0);
    if (width < 640) await page.getByRole('button',{name:'Overview',exact:true}).click();
    await expect(page.getByRole('button').filter({hasText:document.title})).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  });
}
for(const role of ['admin','explorer']) {
  test(`${role} without capability cannot delete`,async({page})=>{
    await mock(page,{role,canDelete:false});
    await openItem(page);
    await expect(page.getByRole('button',{name:'Delete item',exact:true})).toHaveCount(0);
    await expect(page.getByRole('button',{name:'Save changes',exact:true})).toBeVisible();
  });
}
test('revoked access keeps item and shows delete error',async({page})=>{
  await mock(page,{failure:true});
  await openItem(page);
  await page.getByRole('button',{name:'Delete item',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:'Delete Work item?',exact:true});
  await dialog.getByRole('button',{name:'Delete item',exact:true}).click();
  await expect(dialog.getByRole('alert')).toBeVisible();
  await dialog.getByRole('button',{name:'Keep item',exact:true}).click();
  await page.getByRole('button',{name:'Close',exact:true}).click();
  await expect(page.getByRole('heading',{name:item.title,exact:true}).first()).toBeVisible();
});

for (const width of [320, 1440]) {
  test(`all subsections use IOBS header on ${width}px`, async ({ page }) => {
    await page.setViewportSize({width,height:900});
    await mock(page);
    for (const path of ["/", "/chapters", "/members", "/work", "/dashboard/profile", "/dashboard/settings/email", "/admin/members/team", "/admin/members/chapters", "/chapter-office"]) {
      await page.goto(path);
      const header = page.locator('header.institute-header');
      await expect(header).toHaveCount(1);
      await expect(header.getByRole('link',{name:'Institute of Beautiful Success',exact:true})).toBeVisible();
      await expect(header.getByRole('link',{name:'Institute of Beautiful Success',exact:true}).locator('img')).toHaveAttribute('src',/IOBS%20Award%20circle%20neg/);
      await expect(page.getByRole('img',{name:'WorldOS',exact:true})).toHaveCount(0);
      if(width===320) {
        await header.getByRole('button',{name:'Toggle menu',exact:true}).click();
        await expect(page.locator('.institute-mobile-nav').getByRole('link',{name:'Work',exact:true})).toBeVisible();
        expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      }
    }
    await page.screenshot({path:`/tmp/iobs-work-shared-header-${width}.png`});
  });
}
