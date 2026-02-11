import { IS_EXPO_GO, expoGoWarning } from '@/lib/env';
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Platform } from 'react-native';
import { useAuth } from './AuthContext';

// types only (no static native linking)
import type {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';

type SubscriptionContextType = {
  isPro: boolean;
  isLoading: boolean;
  offerings: PurchasesOffering | null;
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
};

const SubscriptionContext = createContext<SubscriptionContextType>({
  isPro: false,
  isLoading: true,
  offerings: null,
  purchasePackage: async () => false,
  restorePurchases: async () => false,
});

export const useSubscription = () => useContext(SubscriptionContext);

// 🔐 API keys
const API_KEYS = {
  android: process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY!,
  ios: process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY!,
};

// 🔁 Safe dynamic import
const getPurchases = () => {
  if (IS_EXPO_GO) return null;
  try {
    return require('react-native-purchases').default;
  } catch (e) {
    console.error('Failed to load react-native-purchases', e);
    return null;
  }
};

export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);

  const listenerCleanup = useRef<(() => void) | null>(null);

  // ✅ Single source of truth for entitlement check
  const syncProStatus = (customerInfo?: CustomerInfo | null) => {
    const active =
      customerInfo?.entitlements?.active?.pro?.isActive === true;
    setIsPro(active);
  };

  const fetchCustomerInfo = async () => {
    const Purchases = getPurchases();
    if (!Purchases) return;

    try {
      const info = await Purchases.getCustomerInfo();
      syncProStatus(info);
    } catch (e) {
      console.error('Failed to fetch customer info', e);
    }
  };

  const fetchOfferings = async () => {
    const Purchases = getPurchases();
    if (!Purchases) return;

    try {
      const res = await Purchases.getOfferings();
      setOfferings(res.current ?? null);
    } catch (e) {
      console.error('Failed to fetch offerings', e);
    }
  };

  // 🚀 INIT
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      console.log('SubscriptionProvider initializing (IS_EXPO_GO:', IS_EXPO_GO, ')');
      if (IS_EXPO_GO) {
        expoGoWarning('RevenueCat Subscriptions');
        setIsLoading(false);
        return;
      }

      try {
        const Purchases = getPurchases();
        if (!Purchases) {
          setIsLoading(false);
          return;
        }

        const { LOG_LEVEL } = require('react-native-purchases');
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);

        // 🔑 Always configure anonymously
        await Purchases.configure({
          apiKey: Platform.OS === 'android' ? API_KEYS.android : API_KEYS.ios,
        });

        // 👤 Sync with Auth User (Defensive)
        try {
          if (user?.id) {
            const appUserID = await Purchases.getAppUserID();
            if (appUserID !== user.id) {
              await Purchases.logIn(user.id);
            }
          } else {
            const isAnonymous = await Purchases.isAnonymous();
            if (!isAnonymous) {
              await Purchases.logOut();
            }
          }
        } catch (authError) {
          console.error('RevenueCat user sync error', authError);
        }

        // 🔄 Sync state (Non-blocking)
        console.log('Fetching CustomerInfo and Offerings...');
        const syncTasks = [
          fetchCustomerInfo().catch(e => console.error('fetchCustomerInfo error', e)),
          fetchOfferings().catch(e => console.error('fetchOfferings error', e))
        ];

        // Wait for them, but don't let them hang the entire init if they take too long
        // (though we're just letting them run and moving to finally)
        await Promise.race([
          Promise.all(syncTasks),
          new Promise(res => setTimeout(res, 3000)) // 3s safety timeout
        ]);

        console.log('RevenueCat sync step completed');

        // 🔔 Listener (with cleanup)
        listenerCleanup.current?.();
        listenerCleanup.current = Purchases.addCustomerInfoUpdateListener(
          (info: CustomerInfo) => {
            if (!cancelled) syncProStatus(info);
          }
        );
      } catch (e) {
        console.error('RevenueCat init error', e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    init();

    return () => {
      cancelled = true;
      listenerCleanup.current?.();
      listenerCleanup.current = null;
    };
  }, [user?.id]);

  // 🛒 Purchase
  const purchasePackage = async (pkg: PurchasesPackage) => {
    if (IS_EXPO_GO) {
      expoGoWarning('Purchasing');
      return false;
    }

    const Purchases = getPurchases();
    if (!Purchases) return false;

    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      syncProStatus(customerInfo);
      return (
        customerInfo?.entitlements?.active?.pro?.isActive === true
      );
    } catch (e: any) {
      if (!e?.userCancelled) {
        console.error('Purchase error', e);
      }
      return false;
    }
  };

  // ♻ Restore
  const restorePurchases = async () => {
    if (IS_EXPO_GO) {
      expoGoWarning('Restoring Purchases');
      return false;
    }

    const Purchases = getPurchases();
    if (!Purchases) return false;

    try {
      const info = await Purchases.restorePurchases();
      syncProStatus(info);
      return (
        info?.entitlements?.active?.pro?.isActive === true
      );
    } catch (e) {
      console.error('Restore error', e);
      return false;
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        isPro,
        isLoading,
        offerings,
        purchasePackage,
        restorePurchases,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}
