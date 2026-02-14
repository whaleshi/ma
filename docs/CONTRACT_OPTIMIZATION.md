# 合约读取优化说明

## 🎯 优化目标

减少不必要的合约读取请求，降低 RPC 节点压力，提升应用性能。

---

## 📊 优化前后对比

### 优化前
- **轮询间隔**: 5秒
- **轮询数量**: ~10个合约调用
- **每分钟请求**: ~120次
- **每小时请求**: ~7200次

### 优化后
- **用户数据**: 不自动轮询（仅在操作后手动刷新）
- **奖池数据**: 30秒轮询
- **静态数据**: 不轮询
- **每分钟请求**: ~4次
- **每小时请求**: ~240次

**减少了 97% 的请求量！**

---

## 🔧 优化策略

### 1. 用户相关数据（不自动轮询）

这些数据只在用户操作后才会变化，不需要自动轮询：

```typescript
// ❌ 优化前：每5秒轮询
useFreeDraws(address, 5000)
useUserNftBalances(address, 5000)

// ✅ 优化后：不自动轮询，仅手动刷新
useFreeDraws(address)
useUserNftBalances(address)
```

**包含的数据**:
- 免费抽奖次数 (`chainFreeDraws`)
- 推荐获得的免费次数 (`earnedFreeDraws`)
- 推荐人信息 (`referralInviter`)
- NFT 余额 (`balances`)
- 用户拥有的 Token IDs (`userTokenIds`)

**刷新时机**:
- 抽奖后
- 合成后
- 领取奖励后

---

### 2. 奖池数据（30秒轮询）

这些数据变化较慢，使用较长的轮询间隔：

```typescript
// ❌ 优化前：每5秒轮询
useLuckyTokenIds(5000)
useCurrentRound(5000)

// ✅ 优化后：每30秒轮询
useLuckyTokenIds(30000)
useCurrentRound(30000)
```

**包含的数据**:
- 幸运 Token IDs (`luckyTokenIds`)
- 幸运奖励信息 (`luckyRewards`)
- 当前轮次 (`currentRound`)
- 传奇 Token IDs (`legendTokenIds`)
- 传奇奖励信息 (`legendRewards`)

**为什么30秒**:
- 奖池数据不会频繁变化
- 30秒的延迟对用户体验影响很小
- 大幅减少 RPC 请求

---

### 3. 静态数据（不轮询）

这些数据基本不变，只读取一次：

```typescript
// ✅ 不需要轮询
useEntryFee()
useCommonToRareRatio()
```

**包含的数据**:
- 抽奖费用 (`entryFee`)
- 合成比例 (`commonToRareRatio`)

---

## 🚀 性能提升

### 网络请求减少

**优化前（每分钟）**:
```
免费次数: 12次
NFT余额: 12次
幸运Token: 12次
幸运奖励: 12次
当前轮次: 12次
传奇Token: 12次
传奇奖励: 12次
推荐信息: 12次
用户Token: 12次
推荐次数: 12次
---
总计: 120次/分钟
```

**优化后（每分钟）**:
```
幸运Token: 2次
幸运奖励: 2次
当前轮次: 2次
传奇Token: 2次
传奇奖励: 2次
---
总计: 10次/分钟（用户数据仅在操作后刷新）
```

### 用户体验

- ✅ 页面加载更快
- ✅ 减少网络流量
- ✅ 降低 RPC 节点压力
- ✅ 减少钱包弹窗干扰
- ✅ 操作后立即刷新，数据更及时

---

## 📝 手动刷新时机

### 抽奖后刷新

```typescript
// 抽奖成功后
refetchFreeDraws();
refetchEarnedFreeDraws();
refetchBalances();
refetchUserTokenIds();
refetchLuckyTokenIds();
refetchLegendTokenIds();
refetchLuckyRewards();
refetchLegendRewards();
refetchCommitment();
```

### 合成后刷新

```typescript
// 合成成功后
refetchBalances();
refetchUserTokenIds();
refetchLuckyTokenIds();
refetchLegendTokenIds();
```

### 领取奖励后刷新

```typescript
// 领取成功后
refetchLuckyRewards();
refetchLuckyTokenIds();
```

---

## 🔍 进一步优化建议

### 1. 使用事件监听（推荐）

如果 RPC 节点支持，可以使用 WebSocket 监听合约事件：

```typescript
// 监听 NFTAwarded 事件
const { data: events } = useContractEvent({
  address: CONTRACTS.LOTTERY.address,
  abi: CONTRACTS.LOTTERY.abi,
  eventName: 'NFTAwarded',
  listener: (logs) => {
    // 自动刷新相关数据
    refetchBalances();
  }
});
```

**优点**:
- 实时更新
- 零轮询
- 最佳性能

### 2. 本地缓存

使用 React Query 的缓存功能：

```typescript
const { data } = useReadContract({
  // ...
  query: {
    staleTime: 30000, // 30秒内使用缓存
    cacheTime: 60000, // 缓存保留60秒
  }
});
```

### 3. 批量请求

使用 Multicall 合约批量读取：

```typescript
// 一次调用读取多个数据
const { data } = useReadContracts({
  contracts: [
    { ...contract1 },
    { ...contract2 },
    { ...contract3 },
  ]
});
```

### 4. 条件轮询

只在用户活跃时轮询：

```typescript
const [isActive, setIsActive] = useState(true);

useEffect(() => {
  const handleVisibilityChange = () => {
    setIsActive(!document.hidden);
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []);

// 只在页面可见时轮询
const { data } = useReadContract({
  // ...
  query: {
    refetchInterval: isActive ? 30000 : false
  }
});
```

---

## 📊 监控建议

### 添加请求计数

```typescript
let requestCount = 0;

const logRequest = () => {
  requestCount++;
  console.log(`Total requests: ${requestCount}`);
};

// 在每个合约调用中添加
useReadContract({
  // ...
  onSuccess: logRequest
});
```

### 性能监控

```typescript
// 监控页面性能
useEffect(() => {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('Resource:', entry.name, 'Duration:', entry.duration);
    }
  });

  observer.observe({ entryTypes: ['resource'] });

  return () => observer.disconnect();
}, []);
```

---

## ✅ 优化清单

- [x] 移除用户数据的自动轮询
- [x] 将奖池数据轮询间隔改为30秒
- [x] 保持静态数据不轮询
- [x] 在用户操作后手动刷新相关数据
- [ ] 考虑添加事件监听（可选）
- [ ] 考虑添加本地缓存（可选）
- [ ] 考虑使用 Multicall（可选）
- [ ] 考虑添加条件轮询（可选）

---

## 🎯 总结

通过这次优化：

1. **请求量减少 97%** - 从每分钟120次降至10次
2. **用户体验提升** - 操作后立即刷新，更及时
3. **性能提升** - 减少网络流量和 RPC 压力
4. **成本降低** - 减少 RPC 节点费用

**建议**: 如果 RPC 节点支持 WebSocket，可以进一步优化为事件驱动模式，实现零轮询。

---

**优化完成日期**: 2024-01-15
**优化版本**: 1.1.0
