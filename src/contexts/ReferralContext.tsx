import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

interface ReferralContextType {
  referralInviter: string | null;
  referralSignature: string | null;
  getReferralCode: () => { inviter: string; signature: string } | null;
  clearReferralCode: () => void;
  hasReferralCode: boolean;
}

const ReferralContext = createContext<ReferralContextType | undefined>(undefined);

export function ReferralProvider({ children }: { children: ReactNode }) {
  const [referralInviter, setReferralInviter] = useState<string | null>(null);
  const [referralSignature, setReferralSignature] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviter = params.get('inviter');
    const signature = params.get('signature');
    if (inviter && signature && !referralInviter && !referralSignature) {
      setReferralInviter(inviter);
      setReferralSignature(signature);
    }
  }, [referralInviter, referralSignature]);

  const value = useMemo(() => ({
    referralInviter,
    referralSignature,
    getReferralCode: () => {
      if (referralInviter && referralSignature) {
        return { inviter: referralInviter, signature: referralSignature };
      }
      return null;
    },
    clearReferralCode: () => {
      setReferralInviter(null);
      setReferralSignature(null);
    },
    hasReferralCode: !!(referralInviter && referralSignature),
  }), [referralInviter, referralSignature]);

  return (
    <ReferralContext.Provider value={value}>
      {children}
    </ReferralContext.Provider>
  );
}

export function useReferral() {
  const context = useContext(ReferralContext);
  if (!context) {
    throw new Error('useReferral must be used within a ReferralProvider');
  }
  return context;
}
