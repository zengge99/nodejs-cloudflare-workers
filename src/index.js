import { Buffer } from 'node:buffer';
globalThis.Buffer = Buffer;
import puppeteer from "@cloudflare/puppeteer";

export default {
  async fetch(request, env) {
    try {
      const browser = await puppeteer.launch(env.MYBROWSER);
      const page = await browser.newPage();

      // 中文用户常用的请求头
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36',
        'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'max-age=0',
        'Upgrade-Insecure-Requests': '1',
        'Referer': 'https://www.baidu.com/'
      };

      await page.setRequestInterception(true);
      let finalUrl = null;
      let requestHeaders = {};

      page.on('request', request => {
        requestHeaders = request.headers();
        request.continue();
      });

      page.on('response', response => {
        if (response.url().includes('bing.com/search')) {
          finalUrl = response.url();
        }
      });

      // 设置中文时区和语言
      await page.setExtraHTTPHeaders(headers);
      await page.setJavaScriptEnabled(true);
      await page.setViewport({ width: 1366, height: 768 });

      // 模拟中国IP的地理位置（注意：这不会实际改变IP，只是设置头信息）
      await page.setGeolocation({
        latitude: 39.9042,  // 北京纬度
        longitude: 116.4074, // 北京经度
        accuracy: 90
      });

      const initialUrl = "https://www.bing.com/search?q=%E5%85%AD%E5%A7%8A%E5%A6%B9+site%3amovie.douban.com%2fsubject";
      await page.goto(initialUrl, {
        waitUntil: 'networkidle2',
        timeout: 15000
      });

      // 获取最终URL和cookies
      finalUrl = finalUrl || await page.url();
      const cookies = await page.cookies();
      await browser.close();

      // 构建curl命令
      const cookiesString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
      const headersString = Object.entries({
        ...headers,
        ...requestHeaders,
        'Cookie': cookiesString,
        'X-Forwarded-For': '220.181.38.148', // 模拟中国IP
        'Client-IP': '220.181.38.148'        // 百度蜘蛛常用IP
      }).map(([key, value]) => `-H '${key}: ${value}'`).join(' ');

      const curlCommand = `curl -X GET '${finalUrl}' ${headersString}`;

      return new Response(curlCommand, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain'
        }
      });

    } catch (error) {
      return new Response(`Error generating curl command: ${error.message}`, {
        status: 500,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
    }
  },
};