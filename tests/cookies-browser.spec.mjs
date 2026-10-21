import {test,expect} from '@playwright/test';
const key='iobs-cookie-consent';
const google=/googletagmanager\.com|google-analytics\.com|analytics\.google\.com|doubleclick\.net|googleadservices\.com/;
async function observe(page,{fakeGtm=true}={}) {
 const requests=[];page.on('request',request=>{if(google.test(request.url()))requests.push(request.url());});
 if(fakeGtm)await page.route('https://www.googletagmanager.com/gtm.js?id=GTM-5X5RWQH4',async route=>route.fulfill({contentType:'application/javascript',body:`window.__gtmLoads=(window.__gtmLoads||0)+1;`}));
 return requests;
}
const pageViews=page=>page.evaluate(()=>window.dataLayer.filter(entry=>entry.event==='iobs_page_view'));
const consent=page=>page.evaluate(()=>window.dataLayer.filter(entry=>entry[0]==='consent').map(entry=>[entry[1],entry[2]]));
test('Fresh and rejected visitors send no Google requests, navigation and reload preserve rejection',async({page})=>{
 const requests=await observe(page);await page.goto('/?lang=en');await expect(page.getByRole('button',{name:'Accept all',exact:true})).toBeVisible();await page.waitForTimeout(1000);expect(requests).toEqual([]);expect(await consent(page)).toEqual([['default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'}]]);
 await page.getByRole('button',{name:'Reject optional cookies',exact:true}).click();await page.locator('.homepage-chapters').scrollIntoViewIfNeeded();await page.locator('.homepage-chapters-heading a').click();await expect(page).toHaveURL(/chapters/);await page.reload();await expect(page.locator('.iobs-cookie-banner')).toHaveCount(0);expect(requests).toEqual([]);expect(await pageViews(page)).toEqual([]);
});
test('Customize starts unchecked, cancellation does not grant consent',async({page})=>{
 const requests=await observe(page);await page.goto('/?lang=en');await page.getByRole('button',{name:'Customize',exact:true}).click();await expect(page.getByRole('checkbox',{name:'Analytics',exact:true})).not.toBeChecked();await expect(page.getByRole('checkbox',{name:/Necessary/})).toBeDisabled();await page.keyboard.press('Escape');await expect(page.locator('.iobs-cookie-banner')).toBeVisible();expect(requests).toEqual([]);
});
test('Accept queues one initial page view after default and update; routes deduplicate; reload remembers consent',async({page})=>{
 const requests=await observe(page);await page.goto('/?lang=en&email=private%40example.com');await page.getByRole('button',{name:'Accept all',exact:true}).click();await expect.poll(()=>requests.length).toBe(1);await expect.poll(async()=>(await pageViews(page)).length).toBe(1);
 expect((await pageViews(page))[0]).toMatchObject({page_location:'http://127.0.0.1:4181/',page_referrer:'',page_title:'Institute of Beautiful Success'});
 const states=await consent(page);expect(states[0][0]).toBe('default');expect(states[1]).toEqual(['update',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'}]);
 const order=await page.evaluate(()=>window.dataLayer.map(entry=>entry[0]==='consent'?entry[1]:entry.event).filter(Boolean));expect(order.slice(0,4)).toEqual(['default','update','gtm.js','iobs_page_view']);
 await page.locator('.homepage-chapters-heading a').click();await expect.poll(async()=>(await pageViews(page)).length).toBe(2);expect(requests).toHaveLength(1);
 await page.evaluate(()=>history.replaceState(history.state,'',location.pathname+'?email=private#same-page'));expect(await pageViews(page)).toHaveLength(2);
 await page.reload();await expect(page.locator('.iobs-cookie-banner')).toHaveCount(0);await expect.poll(()=>requests.length).toBe(2);await expect.poll(async()=>(await pageViews(page)).length).toBe(1);expect(JSON.stringify(await pageViews(page))).not.toContain('private');
});
test('Withdrawal deletes analytics cookies, preserves necessary storage, reloads and blocks Google',async({page,context})=>{
 const requests=await observe(page);await page.goto('/?lang=en');await page.getByRole('button',{name:'Accept all',exact:true}).click();await expect.poll(()=>requests.length).toBe(1);
 await context.addCookies([{name:'_ga',value:'test',url:'http://127.0.0.1:4181'},{name:'_ga_LWGDH16NGH',value:'test',url:'http://127.0.0.1:4181'},{name:'necessary_fixture',value:'keep',url:'http://127.0.0.1:4181'}]);
 await page.getByRole('button',{name:'Cookie settings',exact:true}).click();await expect(page.getByRole('checkbox',{name:'Analytics',exact:true})).toBeChecked();await page.getByRole('checkbox',{name:'Analytics',exact:true}).uncheck();await page.getByRole('button',{name:'Save preferences',exact:true}).click();await page.waitForLoadState('load');await expect.poll(async()=>page.evaluate(()=>window['ga-disable-G-LWGDH16NGH'])).toBe(true);await page.waitForTimeout(500);
 expect(requests).toHaveLength(1);expect(await pageViews(page)).toHaveLength(0);const cookies=await context.cookies();expect(cookies.some(c=>c.name.startsWith('_ga'))).toBe(false);expect(cookies.some(c=>c.name==='necessary_fixture')).toBe(true);
 await page.goto('/chapters');expect(requests).toHaveLength(1);expect(await page.locator('.iobs-cookie-banner').count()).toBe(0);
});
for(const width of [320,390,1440])test(`Arabic consent and settings fit ${width}px`,async({page})=>{
 const requests=await observe(page);await page.setViewportSize({width,height:900});await page.goto('/?lang=ar');await expect(page.locator('html')).toHaveAttribute('dir','rtl');await expect(page.getByRole('button',{name:'قبول الكل',exact:true})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.getByRole('button',{name:'تخصيص',exact:true}).click();await expect(page.getByRole('checkbox',{name:'التحليلات',exact:true})).not.toBeChecked();await expect(page.locator('dialog')).toBeVisible();expect(await page.locator('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);await page.screenshot({path:`/tmp/iobs-cookie-ar-${width}.png`});await page.getByRole('button',{name:'رفض ملفات الارتباط الاختيارية',exact:true}).click();expect(requests).toEqual([]);
});
test('Expired or corrupt consent does not load GTM',async({page})=>{
 await page.addInitScript(key=>localStorage.setItem(key,JSON.stringify({version:1,analytics:true,savedAt:1})),key);const requests=await observe(page);await page.goto('/');await expect(page.locator('.iobs-cookie-banner')).toBeVisible();expect(requests).toEqual([]);
});
test('Withdrawal in another tab stops an already consenting page',async({page,context})=>{
 const requests=await observe(page);await page.goto('/?lang=en');await page.getByRole('button',{name:'Accept all',exact:true}).click();await expect.poll(()=>requests.length).toBe(1);const second=await context.newPage();await observe(second);await second.goto('/?lang=en');await second.getByRole('button',{name:'Cookie settings',exact:true}).click();await second.getByRole('button',{name:'Reject optional cookies',exact:true}).click();await expect.poll(async()=>page.evaluate(()=>window['ga-disable-G-LWGDH16NGH'])).toBe(true);await page.waitForTimeout(400);expect(await pageViews(page)).toHaveLength(0);expect(requests).toHaveLength(1);
});
test('Delayed consent captures the current page only, back navigation adds one view',async({page})=>{
 const requests=await observe(page);await page.goto('/?lang=en');await page.locator('.institute-header nav a[href="/chapters"]').click();await expect(page).toHaveURL(/chapters/);expect(requests).toEqual([]);await page.getByRole('button',{name:'Accept all',exact:true}).click();await expect.poll(async()=>(await pageViews(page)).length).toBe(1);expect((await pageViews(page))[0].page_location).toBe('http://127.0.0.1:4181/chapters');
 await page.locator('.institute-logo').click();await expect.poll(async()=>(await pageViews(page)).length).toBe(2);await page.goBack();await expect.poll(async()=>(await pageViews(page)).length).toBe(3);expect(requests).toHaveLength(1);
});
test('The legal page supplements existing CMS text and reopens cookie settings',async({page})=>{
 await observe(page);await page.goto('/legal?lang=en');await page.getByRole('button',{name:'Reject optional cookies',exact:true}).click();await expect(page.locator('#cookies')).toContainText('Google Analytics 4');await expect(page.locator('#cookies')).toContainText('180 days');await expect(page.locator('main')).not.toContainText('Additional analytics or tracking technologies may be introduced in the future');await page.locator('#cookies').getByRole('button',{name:'Cookie settings',exact:true}).click();await expect(page.locator('dialog')).toBeVisible();
});
