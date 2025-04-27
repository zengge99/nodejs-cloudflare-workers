import { Buffer } from 'node:buffer';
globalThis.Buffer = Buffer;
import puppeteer from "@cloudflare/puppeteer";

export default {
  async fetch(request, env) {
    try {
      const browser = await puppeteer.launch(env.MYBROWSER);
      const page = await browser.newPage();

      // 存储最终请求的所有信息
      let finalRequestInfo = {
        url: null,
        headers: {},
        cookies: []
      };

      // 启用请求拦截以获取实际请求头
      await page.setRequestInterception(true);

      // 监听所有请求
      page.on('request', interceptedRequest => {
        // 只处理目标请求
        if (interceptedRequest.url().includes('rdrig')) {
          finalRequestInfo.url = interceptedRequest.url();
          finalRequestInfo.headers = interceptedRequest.headers();
          
          // 继续请求
          interceptedRequest.continue();
        } else {
          interceptedRequest.continue();
        }
      });

      // 设置中文用户特征
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Referer': 'https://www.baidu.com/'
      });

      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await page.setViewport({ width: 1366, height: 768 });

      const initialUrl = "https://www2.bing.com/search?q=%E5%85%AD%E5%A7%8A%E5%A6%B9+site%3amovie.douban.com%2fsubject";
      await page.goto(initialUrl, {
        waitUntil: 'networkidle2',
        timeout: 15000
      });

      // 获取最终cookies
      finalRequestInfo.cookies = await page.cookies();
      await browser.close();

      // 如果没有捕获到目标请求（回退方案）
      if (!finalRequestInfo.url) {
        finalRequestInfo.url = initialUrl + "&fallback=1";
        finalRequestInfo.headers = {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept-Language': 'zh-CN,zh;q=0.9',
          ...finalRequestInfo.headers
        };
      }

      // 构建完整的curl命令
      const cookiesString = finalRequestInfo.cookies.map(c => `${c.name}=${c.value}`).join('; ');
      const allHeaders = {
        ...finalRequestInfo.headers,
        'Cookie': cookiesString,
        'X-Forwarded-For': '220.181.38.148' // 模拟中国IP
      };

      const headersString = Object.entries(allHeaders)
        .map(([key, value]) => `-H '${key}: ${value.replace(/'/g, "'\\''")}'`)
        .join(' ');

      const curlCommand = `curl -X GET '${finalRequestInfo.url}' ${headersString}`;

      // 返回完整的请求信息（包括curl命令和原始数据）
      const responseData = {
        curl_command: curlCommand,
        final_url: finalRequestInfo.url,
        headers: finalRequestInfo.headers,
        cookies: finalRequestInfo.cookies
      };

      return new Response(JSON.stringify(responseData, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });

    } catch (error) {
      return new Response(JSON.stringify({
        error: error.message,
        stack: error.stack
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  },
};