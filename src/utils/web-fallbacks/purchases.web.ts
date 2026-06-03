export const Purchases = {
  configure: async () => {},
  getOfferings: async () => ({ current: null, all: {} }),
  purchasePackage: async () => ({}),
  restorePurchases: async () => ({ activeSubscriptions: [] }),
  getCustomerInfo: async () => ({ activeSubscriptions: [], entitlements: { active: {} } }),
};

export default Purchases;
