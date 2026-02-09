import React from 'react';

export function RulesSection() {
  const rules = [
    "付费抽卡 20% 注入红包奖池，70% 注入超级大奖，10% 注入财库用于回购平台币",
    "抽中红包马立即获得当前奖池 80%，剩余 20% 滚存到下一轮",
    "首个合成至尊马的用户获得 10% 超级大奖",
    "开奖后至尊马持有者按占比瓜分 70% 超级大奖，剩余 20% 滚存到下一期",
    "爱情马 + 事业马 + 好运马 + 发财马 各1张 → 合成至尊马",
    "新用户免费 4 次，继续抽卡 1 USDT/次",
    "邀请好友付费抽 1 次，你获得 1 次免费机会"
  ];

  return (
    <div className="mt-6 md:mb-6 bg-white/5 rounded-2xl p-8 shadow-2xl border border-white/10 relative overflow-hidden backdrop-blur-3xl">
       
       <h2 className="text-[#fff9f0] text-xl font-black text-center mb-8 tracking-wide drop-shadow-md">游戏规则</h2>

       <div className="space-y-5">
         {rules.map((rule, index) => (
           <div key={index} className="flex items-start gap-4 relative z-10 group">
             <div className="mt-2 min-w-[6px] h-[6px] rounded-full bg-[#FAE6B1] shadow-[0_0_8px_rgba(250,230,177,0.5)]" />
             <p className="text-[#fff9f0]/70 text-sm leading-relaxed font-medium group-hover:text-white transition-colors tracking-wide">
               {rule}
             </p>
           </div>
         ))}
       </div>
    </div>
  );
}
