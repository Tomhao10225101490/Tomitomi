import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'tests/browser',workers:1,timeout:60000,use:{baseURL:'http://127.0.0.1:3000',headless:true,launchOptions:{executablePath:'/usr/bin/chromium',args:['--no-sandbox']}},reporter:[['list'],['html',{outputFolder:'playwright-report',open:'never'}]]});
