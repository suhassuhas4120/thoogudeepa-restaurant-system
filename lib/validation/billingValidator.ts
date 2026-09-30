import { BillLineItem, TableBillBreakdown } from '../../store/useSharedBridge';

export interface SettlementInvoiceRecord {
  invoiceNumber: string;
  tableNumber: string;
  serverName: string;
  foodSubtotal: number;
  cgst: number;
  sgst: number;
  totalTax: number;
  discountAmount: number;
  tipAmount: number;
  grandTotal: number;
  paymentMode: 'CASH' | 'UPI' | 'POS' | 'SPLIT';
  settledAt: string;
  items: BillLineItem[];
}

export interface BillingValidationResult {
  isValid: boolean;
  errors: string[];
  invoiceRecord?: SettlementInvoiceRecord;
}

let invoiceSequenceCounter = 1000;

export function getNextInvoiceSequence(): number {
  invoiceSequenceCounter += 1;
  return invoiceSequenceCounter;
}

export function validateAndCalculateBill(params: {
  tableNumber: string;
  serverName: string;
  breakdown: TableBillBreakdown;
  paymentMode: string;
  discountAmount?: number;
  tipAmount?: number;
}): BillingValidationResult {
  const errors: string[] = [];

  const tableNumber = (params.tableNumber || '').trim().toUpperCase();
  if (!tableNumber) {
    errors.push('Table number is required for billing settlement.');
  }

  const serverName = (params.serverName || 'Staff Captain').trim();

  const validModes = ['CASH', 'UPI', 'POS', 'SPLIT'];
  const mode = (params.paymentMode || '').toUpperCase();
  if (!validModes.includes(mode)) {
    errors.push(`Invalid payment mode: "${params.paymentMode}". Must be CASH, UPI, POS, or SPLIT.`);
  }

  const subtotal = Number(params.breakdown?.foodSubtotal || 0);
  if (subtotal < 0) {
    errors.push('Food subtotal cannot be negative.');
  }

  // Calculate 2.5% CGST + 2.5% SGST strictly rounded to 2 decimal places
  const calculatedCGST = Math.round(subtotal * 0.025 * 100) / 100;
  const calculatedSGST = Math.round(subtotal * 0.025 * 100) / 100;
  const totalTax = calculatedCGST + calculatedSGST;

  const discount = Math.max(0, Number(params.discountAmount || 0));
  if (discount > subtotal) {
    errors.push('Discount amount cannot exceed the food subtotal.');
  }

  const tip = Math.max(0, Number(params.tipAmount || 0));

  const grandTotal = Math.max(0, Math.round((subtotal + totalTax - discount + tip) * 100) / 100);

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  const year = new Date().getFullYear();
  const seq = getNextInvoiceSequence();
  const invoiceNumber = `INV-${year}-${tableNumber.replace(/[^A-Z0-9]/g, '')}-${seq}`;

  const invoiceRecord: SettlementInvoiceRecord = {
    invoiceNumber,
    tableNumber,
    serverName,
    foodSubtotal: subtotal,
    cgst: calculatedCGST,
    sgst: calculatedSGST,
    totalTax,
    discountAmount: discount,
    tipAmount: tip,
    grandTotal,
    paymentMode: mode as 'CASH' | 'UPI' | 'POS' | 'SPLIT',
    settledAt: new Date().toISOString(),
    items: params.breakdown?.items || [],
  };

  return {
    isValid: true,
    errors: [],
    invoiceRecord,
  };
}
