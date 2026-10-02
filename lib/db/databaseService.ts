import { supabase, isSupabaseConfigured } from './supabaseClient';
import { SharedTable, SharedKDSTicket, SharedPing } from '../../store/useSharedBridge';
import { SettlementInvoiceRecord } from '../validation/billingValidator';

export class RestaurantDatabaseService {
  private static instance: RestaurantDatabaseService;

  private constructor() {}

  public static getInstance(): RestaurantDatabaseService {
    if (!RestaurantDatabaseService.instance) {
      RestaurantDatabaseService.instance = new RestaurantDatabaseService();
    }
    return RestaurantDatabaseService.instance;
  }

  /**
   * Persists a newly created KOT ticket to the database
   */
  public async persistKOTTicket(ticket: SharedKDSTicket): Promise<boolean> {
    if (!isSupabaseConfigured) {
      return true; // Graceful offline/local mode
    }

    try {
      const { error: ticketError } = await supabase.from('kot_tickets').insert({
        id: ticket.id,
        table_number: ticket.tableNumber,
        server_name: ticket.serverName,
        timestamp: ticket.timestamp,
        source: ticket.source || 'WAITER',
        status: ticket.status,
      });

      if (ticketError) {
        console.warn('DB KOT Ticket insert warning:', ticketError.message);
        return false;
      }

      if (ticket.items && ticket.items.length > 0) {
        const itemRows = ticket.items.map((it) => ({
          id: it.id,
          ticket_id: ticket.id,
          dish_name: it.name,
          quantity: it.quantity,
          stage: it.stage,
          prep_mode: it.prepMode || 'Standard',
          options: it.options || '',
          notes: it.notes || '',
        }));

        await supabase.from('kot_ticket_items').insert(itemRows);
      }

      return true;
    } catch (err) {
      console.warn('DB KOT Ticket save error:', err);
      return false;
    }
  }

  /**
   * Updates KDS item/ticket status in the database
   */
  public async updateKDSItemStage(itemId: string, stage: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    try {
      const { error } = await supabase
        .from('kot_ticket_items')
        .update({ stage })
        .eq('id', itemId);

      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Persists an official tax invoice upon settlement
   */
  public async persistInvoice(invoice: SettlementInvoiceRecord): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    try {
      const { error } = await supabase.from('tax_invoices').insert({
        id: invoice.invoiceNumber,
        invoice_number: invoice.invoiceNumber,
        table_number: invoice.tableNumber,
        server_name: invoice.serverName,
        food_subtotal: invoice.foodSubtotal,
        cgst: invoice.cgst,
        sgst: invoice.sgst,
        total_tax: invoice.totalTax,
        discount_amount: invoice.discountAmount,
        tip_amount: invoice.tipAmount,
        grand_total: invoice.grandTotal,
        payment_mode: invoice.paymentMode,
        settled_at: invoice.settledAt,
      });

      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Records or resolves customer service pings
   */
  public async recordServicePing(ping: SharedPing): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    try {
      const { error } = await supabase.from('customer_service_pings').insert({
        id: ping.id,
        table_number: ping.tableNumber,
        request_type: ping.type,
        custom_message: ping.message || null,
        timestamp: ping.timestamp,
        status: ping.status,
      });

      return !error;
    } catch {
      return false;
    }
  }

  public async resolveServicePing(pingId: string, resolvedBy: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    try {
      const { error } = await supabase
        .from('customer_service_pings')
        .update({
          status: 'RESOLVED',
          resolved_by: resolvedBy,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', pingId);

      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Updates 86 inventory stockout controls
   */
  public async setInventory86(dishId: string, is86: boolean, prepDelayMinutes: number): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    try {
      const { error } = await supabase.from('inventory_86_controls').upsert({
        dish_id: dishId,
        is_86: is86,
        prep_delay_minutes: prepDelayMinutes,
        updated_at: new Date().toISOString(),
      });

      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Updates the live physical table in Supabase 'tables' table
   */
  public async updateTableState(
    tableNumber: string,
    status: string,
    currentBill: number,
    guestCount?: number
  ): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    try {
      const updatePayload: Record<string, unknown> = {
        status,
        current_bill: currentBill,
        updated_at: new Date().toISOString(),
      };
      if (typeof guestCount === 'number') {
        updatePayload.guest_count = guestCount;
      }

      const { error } = await supabase
        .from('tables')
        .update(updatePayload)
        .eq('number', tableNumber);

      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Persists an individual seat order to Supabase 'orders' and 'kds_tickets'
   */
  public async persistSeatOrder(params: {
    tableNumber: string;
    seatNumber: number;
    items: Array<{ id: string; name: string; quantity: number; price: number }>;
    total: number;
    orderId?: string;
  }): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    try {
      const orderId = params.orderId || `ORD-${params.tableNumber}-S${params.seatNumber}-${Date.now()}`;
      
      // 1. Record in orders table
      await supabase.from('orders').insert({
        id: orderId,
        table_number: params.tableNumber,
        seat_number: params.seatNumber,
        items: params.items,
        total_amount: params.total,
        status: 'UNPAID',
        created_at: new Date().toISOString(),
      });

      // 2. Dispatch to kds_tickets with clear seat tag
      await supabase.from('kds_tickets').insert({
        id: `KDS-${Date.now()}`,
        table_number: params.tableNumber,
        seat_number: params.seatNumber,
        badge: `Table ${params.tableNumber} [Seat ${params.seatNumber}]`,
        items: params.items,
        status: 'NEW',
        created_at: new Date().toISOString(),
      });

      return true;
    } catch {
      return false;
    }
  }
}

export const dbService = RestaurantDatabaseService.getInstance();
