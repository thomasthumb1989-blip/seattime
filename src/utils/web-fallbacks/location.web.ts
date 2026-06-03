export const getCurrentPositionAsync = async () => ({
  coords: { latitude: 0, longitude: 0, altitude: null, accuracy: null, heading: null, speed: null },
  timestamp: Date.now(),
});

export const requestForegroundPermissionsAsync = async () => ({ status: 'granted' as const });
export const requestBackgroundPermissionsAsync = async () => ({ status: 'granted' as const });

export const Accuracy = { Lowest: 1, Low: 2, Balanced: 3, High: 4, Highest: 5, BestForNavigation: 6 } as const;

export default { getCurrentPositionAsync, requestForegroundPermissionsAsync, requestBackgroundPermissionsAsync, Accuracy };
