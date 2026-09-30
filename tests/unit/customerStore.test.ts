import { beforeEach, describe, expect, it } from 'vitest';
import { useCustomerStore } from '../../store/useCustomerStore';
import { useSharedBridge } from '../../store/useSharedBridge';
import { INITIAL_MENU_ITEMS } from '../../data/menuItems';

const cust = () => useCustomerStore.getState();
const biryani = INITIAL_MENU_ITEMS[0]; // 260, add-ons: egg +20, kushka +90
const mutton = INITIAL_MENU_ITEMS[1]; // 340

beforeEach(() => {
  cust().resetSession();
  cust().setTableNumber('A-02');
  useSharedBridge.getState().resetToFreshDemoState();
});

describe('addToCart', () => {
  it('adds an item and computes subtotal, 5% tax and total', () => {
    cust().addToCart(biryani);
    const { cart, payment } = cust();
    expect(cart).toHaveLength(1);
    expect(cart[0].totalPrice).toBe(260);
    expect(payment.subtotal).toBe(260);
    expect(payment.tax).toBe(13);
    expect(payment.totalAmount).toBe(273);
  });

  it('includes add-on prices in the unit price', () => {
    cust().addToCart(biryani, undefined, ['Extra Boiled Egg (1 Pc)', 'Kushka Rice Portion'], 2);
    expect(cust().cart[0].totalPrice).toBe((260 + 20 + 90) * 2);
  });

  it('merges identical item + option + add-ons into one line', () => {
    cust().addToCart(biryani, undefined, ['Extra Boiled Egg (1 Pc)']);
    cust().addToCart(biryani, undefined, ['Extra Boiled Egg (1 Pc)']);
    expect(cust().cart).toHaveLength(1);
    expect(cust().cart[0].quantity).toBe(2);
  });

  it('treats add-on order as irrelevant when merging', () => {
    cust().addToCart(biryani, undefined, ['Extra Boiled Egg (1 Pc)', 'Kushka Rice Portion']);
    cust().addToCart(biryani, undefined, ['Kushka Rice Portion', 'Extra Boiled Egg (1 Pc)']);
    expect(cust().cart).toHaveLength(1);
  });

  it('keeps different spice options as separate lines', () => {
    cust().addToCart(biryani, biryani.optionsGroup1.choices[0]);
    cust().addToCart(biryani, biryani.optionsGroup1.choices[1]);
    expect(cust().cart).toHaveLength(2);
  });
});

describe('cart quantity and removal', () => {
  it('increments and decrements, keeping totals in sync', () => {
    cust().addToCart(biryani);
    const id = cust().cart[0].cartItemId;
    cust().updateCartQuantity(id, 2);
    expect(cust().cart[0].quantity).toBe(3);
    expect(cust().payment.subtotal).toBe(780);
    cust().updateCartQuantity(id, -1);
    expect(cust().payment.subtotal).toBe(520);
  });

  it('removes the line when quantity reaches zero', () => {
    cust().addToCart(biryani);
    cust().updateCartQuantity(cust().cart[0].cartItemId, -1);
    expect(cust().cart).toHaveLength(0);
    expect(cust().payment.totalAmount).toBe(0);
  });

  it('removeCartItem drops only that line', () => {
    cust().addToCart(biryani);
    cust().addToCart(mutton);
    cust().removeCartItem(cust().cart[0].cartItemId);
    expect(cust().cart.map((c) => c.menuItem.id)).toEqual([mutton.id]);
    expect(cust().payment.subtotal).toBe(340);
  });
});

describe('tip and loyalty points', () => {
  it('adds the tip to the total', () => {
    cust().addToCart(biryani);
    cust().updateTip(30);
    expect(cust().payment.totalAmount).toBe(260 + 13 + 30);
  });

  it('drops the tip when the cart is emptied', () => {
    cust().addToCart(biryani);
    cust().updateTip(30);
    cust().removeCartItem(cust().cart[0].cartItemId);
    expect(cust().payment.tipAmount).toBe(0);
    expect(cust().payment.totalAmount).toBe(0);
  });

  it('redeeming points gives a Rs.50 discount and toggling again removes it', () => {
    cust().addToCart(biryani);
    cust().toggleRedeemPoints();
    expect(cust().payment.discount).toBe(50);
    expect(cust().payment.totalAmount).toBe(260 + 13 - 50);
    cust().toggleRedeemPoints();
    expect(cust().payment.discount).toBe(0);
    expect(cust().payment.totalAmount).toBe(273);
  });
});

describe('placeAllOrders (duplicate-order prevention)', () => {
  it('sends the cart to the kitchen once and marks lines as ordered', () => {
    cust().addToCart(biryani);
    const before = useSharedBridge.getState().kdsTickets.length;

    cust().placeAllOrders();

    expect(useSharedBridge.getState().kdsTickets).toHaveLength(before + 1);
    expect(cust().cart.every((c) => c.isOrdered)).toBe(true);
    expect(cust().currentScreen).toBe(5);
  });

  it('does not create a second ticket if nothing new was added', () => {
    cust().addToCart(biryani);
    cust().placeAllOrders();
    const after = useSharedBridge.getState().kdsTickets.length;

    cust().placeAllOrders();

    expect(useSharedBridge.getState().kdsTickets).toHaveLength(after);
  });

  it('only sends newly added items on a repeat order', () => {
    cust().addToCart(biryani);
    cust().placeAllOrders();
    cust().addToCart(mutton);
    cust().placeAllOrders();

    const tickets = useSharedBridge.getState().kdsTickets;
    const last = tickets.at(-1)!;
    expect(last.items).toHaveLength(1);
    expect(last.items[0].name).toBe(mutton.name);
  });
});

describe('waiter pings', () => {
  it('creates a ping in the shared bridge and a notification for the guest', () => {
    const before = useSharedBridge.getState().pings.length;
    cust().pingWaiter('WATER' as never, 'Need water');
    expect(useSharedBridge.getState().pings).toHaveLength(before + 1);
    expect(cust().waiterNotification?.active).toBe(true);
    cust().dismissWaiterNotification();
    expect(cust().waiterNotification).toBeNull();
  });
});

describe('resetSession', () => {
  it('clears the cart, payment and tracking but keeps the table', () => {
    cust().addToCart(biryani);
    cust().placeAllOrders();
    cust().resetSession();
    expect(cust().cart).toEqual([]);
    expect(cust().itemTracking).toEqual([]);
    expect(cust().payment.totalAmount).toBe(0);
    expect(cust().currentScreen).toBe(1);
    expect(cust().tableNumber).toBe('A-02');
  });
});
