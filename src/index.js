import { Buffer } from 'node:buffer';
globalThis.Buffer = Buffer;
import puppeteer from "@cloudflare/puppeteer";

export default {
  async fetch(request, env) {
    try {
      const browser = await puppeteer.launch(env.MYBROWSER);
      const page = await browser.newPage();

      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      await page.goto("https://www2.bing.com/search?q=%E5%85%AD%E5%A7%8A%E5%A6%B9+site%3amovie.douban.com%2fsubject", {
        waitUntil: 'networkidle2', 
        timeout: 10000 
      });

      // 获取cookies
      const cookies = await page.cookies();
      
      await browser.close();
      
      // 返回cookies字符串
      const cookiesString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
      
      return new Response(cookiesString, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
      
    } catch (error) {
      return new Response(`Error: ${error.message}`, {
        status: 500,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
    }
  },
};