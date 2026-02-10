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
    <meta http-equiv="refresh" content="0; url=${shareUrl}" />
  </head>
  <body>
    <p>正在打开页面...</p>
    <a href="${shareUrl}">${escapeHtml(shareUrl)}</a>
  </body>
</html>`;

  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=0, must-revalidate',
    },
  });
}
