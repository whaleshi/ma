const express = require('express');
const { createCanvas, loadImage, registerFont } = require('canvas');
const router = express.Router();

// 如果需要自定义字体
// registerFont('path/to/font.ttf', { family: 'CustomFont' });

router.get('/api/og', async (req, res) => {
  try {
    const type = req.query.type ?? 'default';
    const amount = req.query.amount;

    // 创建画布
    const width = 1200;
    const height = 630;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 背景渐变
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#cf1414');
    gradient.addColorStop(1, '#8a0000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 加载背景图片
    const bgImagePath = `../public/og/${getImageName(type)}`;
    try {
      const bgImage = await loadImage(bgImagePath);
      ctx.drawImage(bgImage, 0, 0, width, height);
    } catch (err) {
      console.error('Failed to load background image:', err);
    }

    // 如果有金额，显示金额
    if (amount) {
      ctx.fillStyle = '#FAE6B1';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(formatSmall(amount), width / 2, height - 100);
    }

    // 添加标题
    const title = getTitle(type);
    ctx.fillStyle = '#FAE6B1';
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(title, width / 2, 100);

    // 输出图片
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 缓存1天
    canvas.createPNGStream().pipe(res);

  } catch (error) {
    console.error('OG generation error:', error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
});

function getImageName(type) {
  const map = {
    career: 'shiye.png',
    love: 'aiqing.png',
    wealth: 'facai.png',
    luck: 'haoyun.png',
    red: 'hongbao.png',
    supreme: 'zhizun.png',
    default: 'home.png',
  };
  return map[type] ?? map.default;
}

function getTitle(type) {
  const map = {
    career: '事业马',
    love: '爱情马',
    wealth: '发财马',
    luck: '好运马',
    red: '红包马',
    supreme: '至尊马',
    default: 'Horse 发生',
  };
  return map[type] ?? map.default;
}

function formatSmall(value) {
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
}

module.exports = router;
