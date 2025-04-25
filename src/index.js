import { Buffer } from 'node:buffer';
globalThis.Buffer = Buffer
import puppeteer from "@cloudflare/puppeteer";

export default {
  async fetch(request, env) {
    try {
      const browser = await puppeteer.launch(env.MYBROWSER);
      const page = await browser.newPage();
      
      // 设置User-Agent模拟浏览器
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // 导航到目标页面
      await page.goto("https://www.bing.com/search?q=%E5%85%AD%E5%A7%8A%E5%A6%B9+site%3amovie.douban.com%2fsubject", {
        waitUntil: 'networkidle2', // 等待页面完全加载
        timeout: 3000 // 3秒超时
      });

      // 获取完整HTML内容
      const htmlContent = await page.content();
      
      // 关闭浏览器
      await browser.close();
      
      // 返回HTML内容
      return new Response(htmlContent, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8'
        }
      });
      
    } catch (error) {
      // 错误处理
      return new Response(`Error: ${error.message}`, {
        status: 500,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
    }
  },
};