import { beforeEach, describe, expect, it } from 'vitest';
import { formatCaptainName, useWaiterStore } from '../../store/useWaiterStore';
import { useSharedBridge } from '../../store/useSharedBridge';
import { INITIAL_MENU_ITEMS } from '../../data/menuItems';

const waiter = () => useWaiterStore.getState();
const bridge = () => useSharedBridge.getState();
const table = (n: string) => bridge().tables.find((t) => t.number === n)!;
const [biryani, mutton] = INITIAL_MENU_ITEMS;

beforeEach(() => {
  bridge().resetToFreshDemoState();
  waiter().clearOrderCart();
  useWaiterStore.setState({
    currentScreen: 1,
    selectedTableNumber: 'A-02',
    activeCaptain: 'Captain Ramesh',
    activeAlertFilter: 'ALL',
    activeToast: null,
    soundAlertsEnabled: true,
    kitchenCallNotice: null,
  });
});

describe('formatCaptainName', () => {
  it.each([
    ['Ramesh', 'Captain Ramesh'],
    ['Captain Ramesh', 'Captain Ramesh'],
    ['captain: Suresh', 'Captain Suresh'],
    ['CAPTAIN - Vijay', 'Captain Vijay'],
    ['  Kiran  ', 'Captain Kiran'],
  ])('formats %j as %j', (raw, expected) => {
    expect(formatCaptainName(raw)).toBe(expected);
  });

  it.each([undefined, null, '', '   ', 'Captain', 'captain -'])(
    'falls back to "Captain" for %j',
    (raw) => {
      expect(formatCaptainName(raw as string | null | undefined)).toBe('Captain');
    }
  );
});

describe('order cart', () => {
  it('adds an item with the default option and computes the price', () => {
    waiter().addToOrderCart(biryani, undefined, 2);
    const [line] = waiter().orderCart;
    expect(line.selectedOption).toBe('Standard');
    expect(line.quantity).toBe(2);
    expect(line.totalPrice).toBe(biryani.price * 2);
  });

  it('merges the same item + option, keeps different options separate', () => {
    waiter().addToOrderCart(biryani, 'Medium');
    waiter().addToOrderCart(biryani, 'Medium');
    waiter().addToOrderCart(biryani, 'Spicy');
    expect(waiter().orderCart).toHaveLength(2);
    expect(waiter().orderCart[0].quantity).toBe(2);
  });

  it('changes quantity, rescales the price, and removes at zero', () => {
    waiter().addToOrderCart(mutton);
    const id = waiter().orderCart[0].cartItemId;
    waiter().updateOrderCartQty(id, 2);
    expect(waiter().orderCart[0].totalPrice).toBe(mutton.price * 3);
    waiter().updateOrderCartQty(id, -3);
    expect(waiter().orderCart).toHaveLength(0);
  });
});

describe('fireKOTToKitchen', () => {
  it('does nothing when the cart is empty', () => {
    const before = bridge().kdsTickets.length;
    waiter().fireKOTToKitchen();
    expect(bridge().kdsTickets).toHaveLength(before);
  });

  it('sends a ticket to the kitchen, seats a vacant table, clears the cart, opens table detail', () => {
    expect(table('A-02').status).toBe('VACANT');
    const before = bridge().kdsTickets.length;
    waiter().addToOrderCart(biryani, 'Standard', 2);

    waiter().fireKOTToKitchen();

    expect(bridge().kdsTickets).toHaveLength(before + 1);
    expect(bridge().kdsTickets.at(-1)!.tableNumber).toBe('A-02');
    expect(table('A-02').status).toBe('OCCUPIED');
    expect(waiter().orderCart).toEqual([]);
    expect(waiter().currentScreen).toBe(3);
  });
});

describe('navigation, alerts and notices', () => {
  it('remembers the previous screen when navigating', () => {
    waiter().navigateTo(4);
    waiter().navigateTo(7);
    expect(waiter().currentScreen).toBe(7);
    expect(waiter().previousScreen).toBe(4);
  });

  it('toggles sound alerts and sets the alert filter', () => {
    waiter().toggleSoundAlerts();
    expect(waiter().soundAlertsEnabled).toBe(false);
    waiter().toggleSoundAlerts();
    expect(waiter().soundAlertsEnabled).toBe(true);
    waiter().setActiveAlertFilter('KITCHEN');
    expect(waiter().activeAlertFilter).toBe('KITCHEN');
  });

  it('shows and dismisses a toast', () => {
    waiter().setActiveToast({
      id: 't1',
      source: 'KITCHEN',
      title: 'Order ready',
      detail: 'Table A-02',
      timestamp: '12:00 PM',
    });
    expect(waiter().activeToast?.title).toBe('Order ready');
    waiter().dismissToast();
    expect(waiter().activeToast).toBeNull();
  });

  it('dispatches and dismisses a kitchen hotline call', () => {
    waiter().callKitchenStation('Tandoor');
    expect(waiter().kitchenCallNotice).toContain('Tandoor');
    waiter().dismissKitchenCall();
    expect(waiter().kitchenCallNotice).toBeNull();
  });
});
