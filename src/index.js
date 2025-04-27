import { Buffer } from 'node:buffer';
globalThis.Buffer = Buffer;
import puppeteer from "@cloudflare/puppeteer";

export default {
  async fetch(request, env) {
    try {
      const browser = await puppeteer.launch(env.MYBROWSER);
      const page = await browser.newPage();

      // 启用客户端提示和完整头信息
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'userAgentData', {
          value: {
            brands: [
              { brand: 'Not.A/Brand', version: '99' },
              { brand: 'Google Chrome', version: '133' },
              { brand: 'Chromium', version: '133' }
            ],
            platform: 'Windows',
            platformVersion: '10.0.0',
            architecture: 'x86',
            bitness: '64',
            model: '',
            mobile: false
          },
          configurable: true
        });
      });

      let targetHeaders = {};
      let finalUrl = null;

      // 更精确的请求监听方式
      await page.setRequestInterception(true);
      page.on('request', req => {
        const url = req.url();
        if (url.includes('/search')) {
          finalUrl = url;
          targetHeaders = {
            ...req.headers(),
            // 手动添加可能缺失的安全头
            'sec-ch-ua': '"Not.A/Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': url.startsWith('https://www2.bing.com') ? 'same-origin' : 'cross-site'
          };
        }
        req.continue();
      });

      // 设置必要的浏览器参数
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36');
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Accept-Encoding': 'identity'
      });

      const initialUrl = "https://www2.bing.com/search?q=%E5%85%AD%E5%A7%8A%E5%A6%B9+site%3amovie.douban.com%2fsubject";
      await page.goto(initialUrl, {
        waitUntil: 'networkidle2',
        timeout: 20000
      });

      // 获取cookies
      const cookies = await page.cookies();
      await browser.close();

      // 构建curl命令
      const curlHeaders = [
        ...Object.entries(targetHeaders),
        ['Cookie', cookies.map(c => `${c.name}=${c.value}`).join('; ')]
      ];

      const curlCommand = [
        `curl -X GET '${finalUrl || initialUrl}'`,
        ...curlHeaders.map(([k, v]) => `-H '${k}: ${v.replace(/'/g, "'\\''")}'`)
      ].join(' \\\n    ');

      return new Response(curlCommand, {
        headers: { 'Content-Type': 'text/plain' }
      });

    } catch (error) {
      return new Response(`Error: ${error.message}`, { 
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  }
};