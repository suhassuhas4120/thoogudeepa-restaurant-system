import { useQuery } from '@tanstack/react-query';
import { MenuItem } from '../types/customer';
import { INITIAL_MENU_ITEMS } from '../data/menuItems';

// Fetch menu catalog from data source
async function fetchMenuCatalog(): Promise<MenuItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 80));
  return INITIAL_MENU_ITEMS;
}

export function useMenuQuery() {
  return useQuery<MenuItem[]>({
    queryKey: ['menuCatalog'],
    queryFn: fetchMenuCatalog,
    initialData: INITIAL_MENU_ITEMS,
    staleTime: 1000 * 60 * 5, // 5 mins cache
  });
}
