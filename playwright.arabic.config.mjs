import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'tests',testMatch:'arabic-browser.spec.mjs',use:{baseURL:process.env.IOBS_TEST_URL||'http://127.0.0.1:4179',headless:true,launchOptions:{channel:'chrome'}},reporter:'list',timeout:30000});
