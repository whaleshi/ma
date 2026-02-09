import React, { useEffect, useState } from 'react';
import { Copy, Share2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useAccount, useWalletClient } from 'wagmi';
import { useEarnedFreeDrawsFromReferral, useInviterDrawStats } from '../hooks/useLotteryContract';
import { CONTRACTS } from '../constant/contracts';
import { copyToClipboard } from '../utils/clipboard';

export function InviteSection() {
  const [inviteLink, setInviteLink] = useState('');
  const [isSigningInvite, setIsSigningInvite] = useState(false);
  const { address, chain } = useAccount();
  const { data: walletClient } = useWalletClient();
  const chainId = chain?.id ?? 97;
  const { data: inviterStats } = useInviterDrawStats(address, 5000);
  const directCountDisplay = inviterStats ? Number(inviterStats[0]) : 0;
  const { data: earnedFreeDraws } = useEarnedFreeDrawsFromReferral(address, 5000);
  const earnedFreeDrawsDisplay = earnedFreeDraws ? Number(earnedFreeDraws) : 0;

  useEffect(() => {
    if (!address) {
      setInviteLink('');
    }
  }, [address]);

  const generateInviteLink = async () => {
    if (!address || !walletClient) {
      toast.error('请先连接钱包');
      return;
    }

    setIsSigningInvite(true);
    try {
      const domain = {
        name: 'InviteSystem',
        version: '1',
        chainId,
        verifyingContract: CONTRACTS.REFERRAL.address as `0x${string}`,
      };

      const types = {
        Invite: [{ name: 'inviter', type: 'address' }],
      };

      const signature = await walletClient.signTypedData({
        domain,
        types,
        primaryType: 'Invite',
        message: { inviter: address },
      });

      const link = `${window.location.origin}?inviter=${address}&signature=${signature}`;
      setInviteLink(link);
      toast.success('邀请链接生成成功');
    } catch {
      toast.error('生成邀请链接失败');
    } finally {
      setIsSigningInvite(false);
    }
  };

  const handleCopy = async () => {
    if (!inviteLink) {
      toast.error('请先生成邀请链接');
      return;
    }
    const success = await copyToClipboard(inviteLink);
    if (success) {
      toast.success('复制成功');
    } else {
      toast.error('复制失败，请手动复制');
    }
  };

  const handleShare = async () => {
    if (!inviteLink) {
      await generateInviteLink();
    }
    const text = encodeURIComponent(`一起抽马卡，参与大奖！${inviteLink}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  return (
    <div className="mt-6 bg-gradient-to-br from-[#5c0000]/30 to-[#3a0000]/30 backdrop-blur-3xl rounded-2xl p-8 shadow-2xl border border-white/5 relative overflow-hidden group">
      {/* Decorative background */}
      <div className="absolute top-[-20%] right-[-20%] w-40 h-40 bg-[#FAE6B1] rounded-full mix-blend-overlay filter blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity" />

      <h2 className="text-[#fff9f0] text-xl font-black text-center mb-6 tracking-wide drop-shadow-md">邀请好友</h2>
      
      <div className="flex justify-between items-center text-[#fff9f0]/60 text-xs font-bold mb-3 tracking-wide">
        <span>你的邀请链接</span>
        <span className="bg-[#FAE6B1]/10 px-3 py-1 rounded-full text-[#FAE6B1] border border-[#FAE6B1]/10">
          已邀请 {directCountDisplay} 位
        </span>
      </div>

      <div className="flex gap-3 mb-5">
        <div
          className="flex-1 bg-black/20 border border-white/5 rounded-2xl h-14 flex items-center px-5 overflow-hidden cursor-pointer hover:bg-black/30 transition-colors"
          onClick={inviteLink ? handleCopy : generateInviteLink}
        >
           <span className="text-[#fff9f0] text-sm truncate w-full opacity-80 tracking-tight">
             {inviteLink || (isSigningInvite ? '签名中...' : '点击生成邀请链接')}
           </span>
           <Copy size={18} className="ml-3 text-white/30" />
        </div>
        <button 
          onClick={handleShare}
          className="group relative bg-[#FAE6B1] hover:bg-[#fdf1cd] text-[#5c0000] rounded-2xl px-6 h-14 flex items-center justify-center gap-2 text-sm font-black shadow-[0_8px_20px_rgba(198,166,109,0.2)] active:scale-95 transition-all whitespace-nowrap overflow-hidden"
        >
          <Share2 size={18} className="relative z-10" />
          <span className="relative z-10">分享</span>
        </button>
      </div>

      <p className="text-[#fff9f0]/50 text-xs text-center font-medium leading-relaxed">
        每邀请 1 位好友付费抽卡，你获得 <span className="text-[#FAE6B1] font-bold">1 次免费机会</span>（已获得 {earnedFreeDrawsDisplay} 次）
      </p>
    </div>
  );
}
