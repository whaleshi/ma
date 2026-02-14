# Horse 发生 - API 文档

## 📡 API 端点

### 基础信息

- **Base URL**: `https://goodhorse.fun`
- **协议**: HTTPS
- **格式**: JSON
- **编码**: UTF-8

---

## 端点列表

### 1. 健康检查

检查服务器是否正常运行。

**端点**: `GET /health`

**请求示例**:
```bash
curl https://goodhorse.fun/health
```

**响应示例**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**状态码**:
- `200`: 服务器正常
- `500`: 服务器错误

---

### 2. OG 图片生成

生成 Open Graph 图片用于社交媒体分享。

**端点**: `GET /api/og`

**查询参数**:

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| type | string | 否 | 卡片类型 | `career`, `love`, `wealth`, `luck`, `red`, `supreme`, `red_win`, `supreme_win`, `default` |
| amount | string | 否 | 金额显示 | `0.001` |

**请求示例**:
```bash
# 默认图片
curl https://goodhorse.fun/api/og

# 事业马
curl https://goodhorse.fun/api/og?type=career

# 红包马（带金额）
curl https://goodhorse.fun/api/og?type=red&amount=0.001
```

**响应**:
- 重定向到对应的图片文件
- 图片尺寸: 1200x630 (标准 OG 尺寸)
- 格式: PNG

**状态码**:
- `200`: 成功
- `302`: 重定向到图片
- `404`: 图片不存在
- `500`: 服务器错误

**卡片类型说明**:

| 类型 | 说明 | 图片路径 |
|------|------|----------|
| `career` | 事业马 | `/og/shiye.png` |
| `love` | 爱情马 | `/og/aiqing.png` |
| `wealth` | 发财马 | `/og/facai.png` |
| `luck` | 好运马 | `/og/haoyun.png` |
| `red` | 红包马 | `/og/hongbao.png` |
| `supreme` | 至尊马 | `/og/zhizun.png` |
| `red_win` | 红包中奖 | `/og/home.png` |
| `supreme_win` | 至尊开奖 | `/og/home.png` |
| `default` | 默认 | `/og/home.png` |

---

### 3. 分享链接

生成分享链接和 OG 图片 URL。

**端点**: `GET /api/share`

**查询参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 否 | 卡片类型 |
| amount | string | 否 | 金额 |

**请求示例**:
```bash
curl https://goodhorse.fun/api/share?type=red&amount=0.001
```

**响应示例**:
```json
{
  "url": "https://goodhorse.fun?type=red&amount=0.001",
  "ogImage": "https://goodhorse.fun/api/og?type=red&amount=0.001"
}
```

**状态码**:
- `200`: 成功
- `500`: 服务器错误

---

## 错误处理

### 错误响应格式

```json
{
  "error": "错误类型",
  "message": "错误详细信息"
}
```

### 常见错误码

| 状态码 | 说明 | 解决方案 |
|--------|------|----------|
| 400 | 请求参数错误 | 检查请求参数格式 |
| 404 | 资源不存在 | 检查 URL 路径 |
| 429 | 请求过于频繁 | 降低请求频率 |
| 500 | 服务器内部错误 | 联系技术支持 |
| 503 | 服务不可用 | 稍后重试 |

---

## 速率限制

为了保护服务器，API 实施了速率限制：

- **限制**: 每 15 分钟 100 次请求
- **响应头**:
  - `X-RateLimit-Limit`: 限制总数
  - `X-RateLimit-Remaining`: 剩余次数
  - `X-RateLimit-Reset`: 重置时间

**超出限制响应**:
```json
{
  "error": "Too Many Requests",
  "message": "请求过于频繁，请稍后再试"
}
```

---

## 使用示例

### JavaScript (Fetch)

```javascript
// 获取 OG 图片
async function getOGImage(type, amount) {
  const params = new URLSearchParams({ type });
  if (amount) params.append('amount', amount);

  const response = await fetch(`https://goodhorse.fun/api/og?${params}`);
  return response.url; // 重定向后的图片 URL
}

// 使用
const imageUrl = await getOGImage('red', '0.001');
console.log(imageUrl);
```

### JavaScript (Axios)

```javascript
const axios = require('axios');

// 获取分享链接
async function getShareLink(type, amount) {
  const response = await axios.get('https://goodhorse.fun/api/share', {
    params: { type, amount }
  });
  return response.data;
}

// 使用
const shareData = await getShareLink('red', '0.001');
console.log(shareData.url);
console.log(shareData.ogImage);
```

### Python

```python
import requests

# 获取 OG 图片
def get_og_image(card_type, amount=None):
    params = {'type': card_type}
    if amount:
        params['amount'] = amount

    response = requests.get(
        'https://goodhorse.fun/api/og',
        params=params,
        allow_redirects=True
    )
    return response.url

# 使用
image_url = get_og_image('red', '0.001')
print(image_url)
```

### cURL

```bash
# 基础请求
curl -X GET "https://goodhorse.fun/api/og?type=red&amount=0.001"

# 查看响应头
curl -I "https://goodhorse.fun/api/og?type=red"

# 下载图片
curl -L "https://goodhorse.fun/api/og?type=red" -o image.png

# 测试健康检查
curl "https://goodhorse.fun/health"
```

---

## HTML Meta 标签

在 HTML 中使用 OG 图片：

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Horse 发生</title>

  <!-- Open Graph -->
  <meta property="og:title" content="Horse 发生 - 集马卡赢奖池">
  <meta property="og:description" content="抽红包马、合成至尊马">
  <meta property="og:image" content="https://goodhorse.fun/api/og?type=default">
  <meta property="og:url" content="https://goodhorse.fun">
  <meta property="og:type" content="website">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Horse 发生">
  <meta name="twitter:description" content="抽红包马、合成至尊马">
  <meta name="twitter:image" content="https://goodhorse.fun/api/og?type=default">
</head>
<body>
  <!-- 内容 -->
</body>
</html>
```

---

## 性能优化

### 缓存

OG 图片会被缓存：

- **浏览器缓存**: 1 天
- **CDN 缓存**: 1 天
- **Cache-Control**: `public, max-age=86400`

### 压缩

所有响应都启用了 Gzip 压缩，可减少 70% 的传输大小。

---

## 版本历史

### v1.0.0 (2024-01-15)
- 初始版本
- 支持 OG 图片生成
- 支持分享链接生成
- 健康检查端点

---

## 技术支持

- **文档**: https://github.com/yourusername/horse-app
- **问题反馈**: https://github.com/yourusername/horse-app/issues
- **邮箱**: support@goodhorse.fun

---

## 许可证

API 使用需遵守服务条款。
