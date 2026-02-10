
  # Crypto Game UI Design

  This is a code bundle for Crypto Game UI Design. The original project is available at https://www.figma.com/design/3YCxwvurhQcloBIEXEMLus/Crypto-Game-UI-Design.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  
# 分享链接（OG 图）

Vercel 部署后可用以下分享链接生成不同的 OG 图（适合微信/推特等平台预览）。

基础形式：

```
https://<your-domain>/api/share?type=<type>[&amount=<amount>]
```

参数说明：
- `type`：分享类型
  - 卡片：`career` / `love` / `wealth` / `luck` / `red` / `supreme`
  - 红包中奖：`red_win`
  - 至尊开奖：`supreme_win`
- `amount`：金额（仅 `red_win`、`supreme_win` 生效）

示例：

```
# 事业马分享
https://your-domain.vercel.app/api/share?type=career

# 红包中奖分享（带金额）
https://your-domain.vercel.app/api/share?type=red_win&amount=0.0123

# 至尊开奖分享（带金额）
https://your-domain.vercel.app/api/share?type=supreme_win&amount=1.234
```

如需在页面中展示，根据 URL 参数也可以复用同样的 `type` 和 `amount`。
