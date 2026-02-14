// 动态更新 OG 标签的工具函数
// 在 src/utils/og.ts 中创建

export function updateOGTags(type: string, amount?: string) {
  const cards: Record<string, { title: string; description: string; image: string }> = {
    career: {
      title: '事业马 - Horse 发生',
      description: '抽到事业马，事业运加持！',
      image: '/og/shiye.png',
    },
    love: {
      title: '爱情马 - Horse 发生',
      description: '抽到爱情马，桃花运爆棚！',
      image: '/og/aiqing.png',
    },
    wealth: {
      title: '发财马 - Horse 发生',
      description: '抽到发财马，财运滚滚来！',
      image: '/og/facai.png',
    },
    luck: {
      title: '好运马 - Horse 发生',
      description: '抽到好运马，好运连连！',
      image: '/og/haoyun.png',
    },
    red: {
      title: '红包马 - Horse 发生',
      description: amount ? `中奖 ${amount} BNB！` : '抽到红包马，赢取大奖！',
      image: '/og/hongbao.png',
    },
    supreme: {
      title: '至尊马 - Horse 发生',
      description: '抽到至尊马，超级大奖等你拿！',
      image: '/og/zhizun.png',
    },
    default: {
      title: 'Horse 发生 - 集马卡赢奖池',
      description: '抽红包马、合成至尊马，赢取超级大奖！',
      image: '/og/home.png',
    },
  };

  const card = cards[type] ?? cards.default;
  const baseUrl = 'https://goodhorse.fun';

  // 更新 title
  document.title = card.title;

  // 更新 meta 标签
  updateMetaTag('description', card.description);
  updateMetaTag('og:title', card.title, 'property');
  updateMetaTag('og:description', card.description, 'property');
  updateMetaTag('og:image', `${baseUrl}${card.image}`, 'property');
  updateMetaTag('twitter:title', card.title);
  updateMetaTag('twitter:description', card.description);
  updateMetaTag('twitter:image', `${baseUrl}${card.image}`);
}

function updateMetaTag(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let element = document.querySelector(`meta[${attr}="${name}"]`);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, name);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

// 使用示例：
// import { updateOGTags } from './utils/og';
//
// // 抽到红包马时
// updateOGTags('red', '0.001');
//
// // 抽到事业马时
// updateOGTags('career');
