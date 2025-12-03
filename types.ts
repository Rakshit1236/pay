export enum View {
  HOME = 'HOME',
  SCANNER = 'SCANNER',
  PAYMENT = 'PAYMENT',
  HISTORY = 'HISTORY',
  PROFILE = 'PROFILE',
  SUCCESS = 'SUCCESS'
}

export interface User {
  id: string;
  name: string;
  mobile: string;
  upiId: string;
  avatarUrl: string;
  qrCodeUrl: string;
}

export interface Payee {
  name: string;
  upiId: string;
  bankName?: string;
  isVerified?: boolean;
  category?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  payeeName: string;
  payeeUpi: string;
  date: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  type: 'DEBIT' | 'CREDIT';
}

export interface PaymentContextState {
  amount: string;
  note: string;
  payee: Payee | null;
}
