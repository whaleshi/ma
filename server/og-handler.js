const express = require('express');
const path = require('path');

const router = express.Router();

const safeText = (value, fallback) => {
  if (!value) {
    return fallback;
  }
  return value.slice(0, 40);
};

const formatSmall = (value) => {
  if (!value.startsWith('0.')) {
    return value;
  }
  const decimals = value.slice(2);
  if (!decimals || /^0+$/.test(decimals)) {
    return '0';
  }
  const match = decimals.match(/^(0+)([1-9].*)$/);
  if (!match) {
    return value;
  }
  const zeroCount = match[1].length;
  const rest = match[2].slice(0, 3);
  if (zeroCount <= 1) {
    return value;
  }
  const map = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
  const subscript = String(zeroCount)
    .split('')
    .map((digit) => map[Number(digit)] ?? digit)
    .join('');
  return `0.0${subscript}${rest}`;
};

// OG 图片处理路由
router.get('/api/og', async (req, res) => {
  try {
    // 获取查询参数
    const type = req.query.type ?? 'default';
    const amount = req.query.amount;
    const origin = req.protocol + '://' + req.get('host');

    const cards = {
      career: {
        title: '事业马',
        subtitle: 'Horse 发生 · 好运加持',
        image: `${origin}/og/shiye.png`,
        accent: '#ff9a9e',
      },
      love: {
        title: '爱情马',
        subtitle: 'Horse 发生 · 好运加持',
        image: `${origin}/og/aiqing.png`,
        accent: '#ffd1dc',
      },
      wealth: {
        title: '发财马',
        subtitle: 'Horse 发生 · 好运加持',
        image: `${origin}/og/facai.png`,
        accent: '#ffd89b',
      },
      luck: {
        title: '好运马',
        subtitle: 'Horse 发生 · 好运加持',
        image: `${origin}/og/haoyun.png`,
        accent: '#ffe9a3',
      },
      red: {
        title: '红包马',
        subtitle: 'Horse 发生 · 好运加持',
        image: `${origin}/og/hongbao.png`,
        accent: '#ffb3b3',
      },
      supreme: {
        title: '至尊马',
        subtitle: 'Horse 发生 · 好运加持',
        image: `${origin}/og/zhizun.png`,
        accent: '#ffd700',
      },
      red_win: {
        title: '红包中奖',
        subtitle: 'Horse 发生 · 好运加持',
        image: `${origin}/og/home.png`,
        accent: '#ff6b6b',
      },
      supreme_win: {
        title: '至尊开奖',
        subtitle: 'Horse 发生 · 好运加持',
        image: `${origin}/og/home.png`,
        accent: '#f7d27c',
      },
      default: {
        title: 'Horse 发生',
        subtitle: '抽红包马、合成至尊马',
        image: `${origin}/og/home.png`,
        accent: '#ff9a9e',
      },
    };

    const meta = cards[type] ?? cards.default;
    const title = safeText(meta.title, '集马卡赢奖池');
    const subtitle = safeText(meta.subtitle, '抽红包马、合成至尊马');
    const amountText = amount ? formatSmall(amount) : null;

    // 方案1：直接重定向到静态图片（最简单）
    const imagePath = meta.image.replace(origin, '');
    res.redirect(imagePath);

    // 方案2：返回 HTML meta 标签（用于 SSR）
    // res.json({
    //   title,
    //   subtitle,
    //   image: meta.image,
    //   accent: meta.accent,
    //   amount: amountText,
    // });

  } catch (error) {
    console.error('OG handler error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
