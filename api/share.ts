export const config = {
  runtime: 'edge',
};

const normalizeType = (value: string | null) => {
  if (!value) {
    return 'default';
  }
  return value;
};

const escapeHtml = (value: string) => {
  return value.replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return map[char] ?? char;
  });
};

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const userAgent = req.headers.get('user-agent') ?? '';
  const isBot = /bot|crawl|spider|slack|discord|twitter|facebook|whatsapp|telegram|wechat|preview/i.test(userAgent);
  const type = normalizeType(url.searchParams.get('type'));
  const amount = url.searchParams.get('amount');
  const origin = url.origin;
  const ogUrl = new URL('/api/og', origin);
  ogUrl.searchParams.set('type', type);
  if (amount) {
    ogUrl.searchParams.set('amount', amount);
  }

  const title = 'Horse 发生';
  const description = '抽红包马、合成至尊马，赢取大奖';
  const shareUrl = `${origin}/?type=${encodeURIComponent(type)}${amount ? `&amount=${encodeURIComponent(amount)}` : ''}`;

  const redirectMeta = isBot ? '' : `<meta http-equiv="refresh" content="3; url=${shareUrl}" />`;
  const redirectScript = isBot
    ? ''
    : `<script>
      setTimeout(function () {
        window.location.href = ${JSON.stringify(shareUrl)};
      }, 3000);
    </script>`;

  const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="${ogUrl.toString()}" />
    <meta property="og:url" content="${escapeHtml(url.toString())}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${ogUrl.toString()}" />
    ${redirectMeta}
    <style>
      :root { color-scheme: dark; }
      body {
        margin: 0;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: radial-gradient(circle at 20% 20%, #7a0a0a, #2a0a0a 55%, #140606 100%);
        font-family: Arial, sans-serif;
        color: #fff9f0;
      }
      .card {
        width: min(520px, 88vw);
        padding: 28px 24px;
        border-radius: 20px;
        background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
        border: 1px solid rgba(250,230,177,0.2);
        box-shadow: 0 20px 60px rgba(0,0,0,0.45);
        text-align: center;
      }
      .title {
        font-size: 22px;
        font-weight: 800;
        margin-bottom: 10px;
        letter-spacing: 0.02em;
      }
      .desc {
        font-size: 14px;
        color: rgba(255,249,240,0.7);
        margin-bottom: 18px;
      }
      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 12px 18px;
        border-radius: 12px;
        background: linear-gradient(135deg, #ff000e, #c4000b);
        color: #fff9f0;
        text-decoration: none;
        font-weight: 700;
        box-shadow: 0 8px 20px rgba(255,0,14,0.35);
      }
      .hint {
        margin-top: 12px;
        font-size: 12px;
        color: rgba(255,249,240,0.55);
      }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="title">即将打开页面</div>
      <div class="desc">3 秒后自动跳转，如未跳转请点击下方按钮</div>
      <a class="btn" href="${shareUrl}">立即打开</a>
      <div class="hint">${escapeHtml(shareUrl)}</div>
    </div>
    ${redirectScript}
  </body>
</html>`;

  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=0, must-revalidate',
    },
  });
}
