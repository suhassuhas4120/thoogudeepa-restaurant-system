import { useQuery } from '@tanstack/react-query';
import { IndividualItemTracking, OrderStage } from '../types/customer';
import { useCustomerStore } from '../store/useCustomerStore';

// Kitchen order tracking query handler
async function fetchServerTrackingStatus(
  currentStage: OrderStage
): Promise<{ serverTimestamp: number; stage: OrderStage }> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return {
    serverTimestamp: Date.now(),
    stage: currentStage,
  };
}

export function useOrderTrackingQuery() {
  const orderStage = useCustomerStore((state) => state.orderStage);
  const itemTracking = useCustomerStore((state) => state.itemTracking);

  const query = useQuery({
    queryKey: ['orderTracking', orderStage],
    queryFn: () => fetchServerTrackingStatus(orderStage),
    refetchInterval: 12000, // Poll server every 12 seconds for kitchen updates
    staleTime: 6000,
  });

  return {
    ...query,
    orderStage,
    itemTracking,
  };
}
