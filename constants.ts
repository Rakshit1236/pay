import { Transaction, User } from "./types";

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Arjun Kumar',
  mobile: '+91 98765 43210',
  upiId: 'arjun.k@ybl',
  avatarUrl: 'https://picsum.photos/id/64/200/200',
  qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=arjun.k@ybl&pn=Arjun%20Kumar'
};

export const RECENT_TRANSACTIONS: Transaction[] = [
  { id: 't1', amount: 450, payeeName: 'Fresh Mart', payeeUpi: 'freshmart@oksbi', date: 'Today, 10:30 AM', status: 'SUCCESS', type: 'DEBIT' },
  { id: 't2', amount: 1200, payeeName: 'Rohan Das', payeeUpi: 'rohan.d@ybl', date: 'Yesterday', status: 'SUCCESS', type: 'DEBIT' },
  { id: 't3', amount: 5000, payeeName: 'Salary', payeeUpi: 'techsol@hdfc', date: '25 Oct', status: 'SUCCESS', type: 'CREDIT' },
  { id: 't4', amount: 80, payeeName: 'Chai Point', payeeUpi: 'chaipoint@icici', date: '24 Oct', status: 'SUCCESS', type: 'DEBIT' },
];

export const QUICK_CONTACTS = [
  { name: 'Rahul', img: 'https://picsum.photos/id/1005/100/100' },
  { name: 'Priya', img: 'https://picsum.photos/id/1011/100/100' },
  { name: 'Mom', img: 'https://picsum.photos/id/1027/100/100' },
  { name: 'Landlord', img: 'https://picsum.photos/id/1012/100/100' },
];
