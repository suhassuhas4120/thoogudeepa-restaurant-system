'use client';

import { useEffect, useRef } from 'react';
import { useSharedBridge } from '../store/useSharedBridge';
import { useWaiterStore, WaiterToastNotification } from '../store/useWaiterStore';
import {
  playAlertChime,
  triggerHapticVibrate,
  sendBrowserNotification,
} from '../lib/soundEffects';

/**
 * Global Real-Time Alert Monitor for Floor Waiters.
 * Continuously listens to Kitchen KDS tickets, Customer Pings, and Manager 86 notices.
 * Triggers distinct synthesized chimes, mobile haptic vibration, browser notifications,
 * and displays the Heads-Up Floating Toast Banner with 1-click actions and auto-navigation.
 */
export const useWaiterAlertMonitor = () => {
  const { kdsTickets, pings, inventory86 } = useSharedBridge();
  const { soundAlertsEnabled, setActiveToast, setActiveAlertFilter } = useWaiterStore();

  const isInitializedRef = useRef(false);
  const seenReadyTicketIdsRef = useRef<Set<string>>(new Set());
  const seenPendingPingIdsRef = useRef<Set<string>>(new Set());
  const seen86ItemIdsRef = useRef<Set<string>>(new Set());
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);

  const dispatchNotification = (toast: WaiterToastNotification) => {
    // 1. Play audio chime if enabled
    if (soundAlertsEnabled) {
      playAlertChime(toast.source);
      triggerHapticVibrate([180, 80, 180]);
    }

    // 2. Native browser push notification
    sendBrowserNotification(toast.title, { body: toast.detail });

    // 3. Automatically switch the alert filter so when the waiter is on/navigates to Screen 2,
    // the respective alert category is immediately selected!
    if (toast.source === 'KITCHEN') {
      setActiveAlertFilter('KITCHEN');
    } else if (toast.source === 'CUSTOMER') {
      setActiveAlertFilter('CUSTOMER');
    } else if (toast.source === 'MANAGER') {
      setActiveAlertFilter('MANAGER');
    }

    // 4. Set active toast with 8s auto-dismiss
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
    }
    setActiveToast(toast);

    dismissTimerRef.current = setTimeout(() => {
      setActiveToast(null);
      dismissTimerRef.current = null;
    }, 8000);
  };

  useEffect(() => {
    // 1. Initial mount: Seed existing items so we don't trigger notification spam on first load
    if (!isInitializedRef.current) {
      kdsTickets.forEach((tk) => {
        if (tk.status === 'READY') seenReadyTicketIdsRef.current.add(tk.id);
      });
      pings.forEach((p) => {
        if (p.status === 'PENDING') seenPendingPingIdsRef.current.add(p.id);
      });
      (inventory86 || []).forEach((it) => {
        if (it.is86) seen86ItemIdsRef.current.add(it.id);
      });
      isInitializedRef.current = true;
      return;
    }

    // 2. Kitchen ready tickets newly transitioning to READY
    const newReady = kdsTickets.filter(
      (tk) => tk.status === 'READY' && !seenReadyTicketIdsRef.current.has(tk.id)
    );
    if (newReady.length > 0) {
      newReady.forEach((tk) => {
        seenReadyTicketIdsRef.current.add(tk.id);
        dispatchNotification({
          id: `toast-k-${tk.id}`,
          source: 'KITCHEN',
          title: `TABLE ${tk.tableNumber} • FOOD READY`,
          detail: tk.items.map((i) => `${i.name} (${i.quantity})`).join(', ') + ' ready to serve!',
          timestamp: tk.timestamp || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          tableNumber: tk.tableNumber,
          ticketId: tk.id,
        });
      });
    }

    // 3. Customer pings arriving as PENDING
    const newPings = pings.filter(
      (p) => p.status === 'PENDING' && !seenPendingPingIdsRef.current.has(p.id)
    );
    if (newPings.length > 0) {
      newPings.forEach((p) => {
        seenPendingPingIdsRef.current.add(p.id);
        dispatchNotification({
          id: `toast-c-${p.id}`,
          source: 'CUSTOMER',
          title: `TABLE ${p.tableNumber} • GUEST CALL`,
          detail: p.message ? `"${p.message}"` : `${p.guestName || 'Guest'} requested ${p.type}`,
          timestamp: p.timestamp || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          tableNumber: p.tableNumber,
          pingId: p.id,
        });
      });
    }

    // 4. Manager 86 notices
    const new86 = (inventory86 || []).filter(
      (it) => it.is86 && !seen86ItemIdsRef.current.has(it.id)
    );
    if (new86.length > 0) {
      new86.forEach((it) => {
        seen86ItemIdsRef.current.add(it.id);
        dispatchNotification({
          id: `toast-m-${it.id}`,
          source: 'MANAGER',
          title: 'MANAGER NOTICE • STOCK SOLD OUT',
          detail: `${it.name} is Sold Out in Kitchen. Do not take new orders.`,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          noticeId: `mgr-86-${it.id}`,
        });
      });
    }
  }, [kdsTickets, pings, inventory86]);

  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, []);
};
