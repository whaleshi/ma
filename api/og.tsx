import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

const ogSize = {
  width: 1200,
  height: 630,
};

const safeText = (value: string | null, fallback: string) => {
  if (!value) {
    return fallback;
  }
  return value.slice(0, 40);
};

const formatSmall = (value: string) => {
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

const getOrigin = (req: Request) => {
  return req.headers.get('x-forwarded-host')
    ? `${req.headers.get('x-forwarded-proto') ?? 'https'}://${req.headers.get('x-forwarded-host')}`
    : new URL(req.url).origin;
};

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') ?? 'default';
  const amount = searchParams.get('amount');
  const origin = getOrigin(req);

  const cards: Record<string, { title: string; subtitle: string; image: string; accent: string }> = {
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
  try {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={meta.image} width="1200" height="630" />
        </div>
      ),
      ogSize
    );
  } catch {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#2a0a0a',
            color: '#fff9f0',
            fontFamily: 'Arial, sans-serif',
            fontSize: 36,
            fontWeight: 700,
          }}
        >
          OG render error
        </div>
      ),
      ogSize
    );
  }
}
