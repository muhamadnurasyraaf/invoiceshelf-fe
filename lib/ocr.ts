import { api } from "./api";

export interface ExtractedInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ExtractedInvoiceData {
  invoiceNumber?: string;
  vendorName?: string;
  vendorEmail?: string;
  vendorPhone?: string;
  vendorAddress?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  invoiceDate?: string;
  dueDate?: string;
  items: ExtractedInvoiceItem[];
  subtotal?: number;
  taxRate?: number;
  taxAmount?: number;
  total?: number;
  notes?: string;
  currency?: string;
}

export interface ProcessedCustomer {
  id: string;
  companyName: string;
  email: string;
  phone: string;
  isNew: boolean;
}

export interface ProcessedItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  isNew: boolean;
}

export interface ProcessedInvoiceData extends ExtractedInvoiceData {
  customer?: ProcessedCustomer;
  processedItems: ProcessedItem[];
}

export interface OcrInvoiceInput {
  image: string; // Base64 encoded image (without data URL prefix)
  mimeType: string;
}

export const ocrService = {
  async extractInvoice(data: OcrInvoiceInput): Promise<ExtractedInvoiceData> {
    const response = await api.post<ExtractedInvoiceData>("/ocr/invoice", data);
    return response.data;
  },

  async extractAndProcessInvoice(
    data: OcrInvoiceInput,
  ): Promise<ProcessedInvoiceData> {
    const response = await api.post<ProcessedInvoiceData>(
      "/ocr/invoice/process",
      data,
    );
    return response.data;
  },
};
