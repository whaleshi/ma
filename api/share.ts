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

  const title = '集马卡赢奖池';
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
  </head>
  <body>
    <p>即将打开页面...</p>
    <p><a href="${shareUrl}">点击立即打开</a></p>
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
