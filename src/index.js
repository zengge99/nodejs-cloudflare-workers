import { Buffer } from 'node:buffer';
globalThis.Buffer = Buffer;
import puppeteer from "@cloudflare/puppeteer";

export default {
  async fetch(request, env) {
    try {
      const browser = await puppeteer.launch(env.MYBROWSER);
      const page = await browser.newPage();

      // 存储目标请求的完整信息
      let targetRequest = null;
      
      // 启用请求拦截以获取所有请求头
      await page.setRequestInterception(true);

      // 监听所有请求
      page.on('request', interceptedRequest => {
        const url = interceptedRequest.url();
        
        // 如果是搜索请求，保存完整请求对象
        if (url.includes('/')) {
          targetRequest = {
            request: interceptedRequest,
            url: url,
            headers: interceptedRequest.headers(),
            method: interceptedRequest.method()
          };
        }
        
        interceptedRequest.continue();
      });

      // 设置浏览器特征
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Accept-Encoding': 'identity' // 禁用压缩
      });
      
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await page.setViewport({ width: 1366, height: 768 });

      const initialUrl = "https://www2.bing.com/search?q=%E5%85%AD%E5%A7%8A%E5%A6%B9+site%3amovie.douban.com%2fsubject";
      await page.goto(initialUrl, {
        waitUntil: 'networkidle2',
        timeout: 20000 // 增加超时时间
      });

      // 获取cookies
      const cookies = await page.cookies();
      await browser.close();

      // 处理未捕获请求的情况
      if (!targetRequest) {
        targetRequest = {
          url: initialUrl,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Accept-Encoding': 'identity'
          },
          method: 'GET'
        };
      }

      // 构建curl命令
      const cookiesString = cookies.map(c => `${c.name}=${c.value}`).join('; ');
      const headers = {
        ...targetRequest.headers,
        'Cookie': cookiesString,
        'Accept-Encoding': 'identity' // 确保禁用压缩
      };

      // 生成格式化的curl命令
      const curlCommand = [
        `curl -X ${targetRequest.method} '${targetRequest.url}'`,
        ...Object.entries(headers)
          .filter(([k]) => k.toLowerCase() !== 'content-length') // 移除自动计算的Content-Length
          .map(([k, v]) => `-H '${k}: ${v.replace(/'/g, "'\\''")}'`)
      ].join(' \\\n    ');

      return new Response(curlCommand, {
        headers: { 'Content-Type': 'text/plain' }
      });

    } catch (error) {
      return new Response(`Error generating curl command: ${error.message}`, {
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  },
};