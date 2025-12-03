import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Home, ScanLine, History, User as UserIcon, QrCode, Bell, 
  HelpCircle, Wallet, Send, ArrowUpRight, ArrowDownLeft, 
  Banknote, Smartphone, Zap, Search, ChevronRight, X, Delete, CheckCircle, ShieldCheck
} from 'lucide-react';

import { Header, Button, SecureBadge, NumberPadKey } from './components/Components';
import { resolvePayeeFromId, generateTransactionInsight } from './services/geminiService';
import { CURRENT_USER, QUICK_CONTACTS, RECENT_TRANSACTIONS } from './constants';
import { View, Payee, Transaction } from './types';

// --- Main App Component ---
export default function App() {
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [payee, setPayee] = useState<Payee | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>(RECENT_TRANSACTIONS);
  const [lastTx, setLastTx] = useState<Transaction | null>(null);

  // --- Handlers ---
  const handleScanSuccess = async (scannedData: string) => {
    // In a real app, we parse the UPI URI (upi://pay?pa=...)
    // Here we assume the scanned data acts as an ID
    const resolvedPayee = await resolvePayeeFromId(scannedData);
    setPayee(resolvedPayee);
    setAmount('');
    setCurrentView(View.PAYMENT);
  };

  const handlePaymentSuccess = (newTx: Transaction) => {
    setTransactions([newTx, ...transactions]);
    setLastTx(newTx);
    setCurrentView(View.SUCCESS);
  };

  // --- Router Switch ---
  const renderView = () => {
    switch (currentView) {
      case View.HOME:
        return <HomeScreen onViewChange={setCurrentView} onScan={() => setCurrentView(View.SCANNER)} />;
      case View.SCANNER:
        return <ScannerScreen onBack={() => setCurrentView(View.HOME)} onScanSuccess={handleScanSuccess} />;
      case View.PAYMENT:
        return payee ? (
          <PaymentScreen 
            payee={payee} 
            initialAmount={amount}
            onBack={() => setCurrentView(View.HOME)} 
            onSuccess={handlePaymentSuccess} 
          />
        ) : <div className="text-center p-10">Error: No Payee</div>;
      case View.SUCCESS:
        return lastTx ? (
          <SuccessScreen transaction={lastTx} onHome={() => setCurrentView(View.HOME)} />
        ) : null;
      case View.HISTORY:
        return <HistoryScreen transactions={transactions} onBack={() => setCurrentView(View.HOME)} />;
      case View.PROFILE:
        return <ProfileScreen onBack={() => setCurrentView(View.HOME)} />;
      default:
        return <HomeScreen onViewChange={setCurrentView} onScan={() => setCurrentView(View.SCANNER)} />;
    }
  };

  return (
    <div className="max-w-md mx-auto h-[100dvh] bg-gray-50 flex flex-col overflow-hidden relative shadow-2xl">
      <div className="flex-1 overflow-y-auto no-scrollbar relative">
        {renderView()}
      </div>
      
      {/* Bottom Navigation - Only show on main tabs */}
      {[View.HOME, View.HISTORY, View.PROFILE].includes(currentView) && (
        <div className="bg-white border-t border-gray-200 pb-safe sticky bottom-0 z-40">
          <div className="flex justify-around items-center h-16">
            <NavBtn icon={<Home size={24} />} label="Home" active={currentView === View.HOME} onClick={() => setCurrentView(View.HOME)} />
            <NavBtn icon={<ScanLine size={24} />} label="Scan" active={currentView === View.SCANNER} onClick={() => setCurrentView(View.SCANNER)} isFab />
            <NavBtn icon={<History size={24} />} label="History" active={currentView === View.HISTORY} onClick={() => setCurrentView(View.HISTORY)} />
            <NavBtn icon={<UserIcon size={24} />} label="Profile" active={currentView === View.PROFILE} onClick={() => setCurrentView(View.PROFILE)} />
          </div>
        </div>
      )}
    </div>
  );
}

const NavBtn = ({ icon, label, active, onClick, isFab }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 w-16 ${isFab ? '-mt-8' : ''}`}
  >
    {isFab ? (
      <div className="bg-[#5f259f] text-white p-4 rounded-full shadow-lg border-4 border-gray-50 transform hover:scale-105 transition-transform">
        {icon}
      </div>
    ) : (
      <div className={`transition-colors ${active ? 'text-[#5f259f]' : 'text-gray-400'}`}>
        {icon}
        <span className="text-[10px] font-medium block">{label}</span>
      </div>
    )}
  </button>
);

// --- Sub-Screens ---

const HomeScreen = ({ onViewChange, onScan }: { onViewChange: (v: View) => void, onScan: () => void }) => {
  return (
    <div className="bg-gray-50 min-h-full pb-20">
      {/* Header */}
      <div className="bg-[#5f259f] text-white rounded-b-3xl pb-8 px-4 pt-4 shadow-md">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3" onClick={() => onViewChange(View.PROFILE)}>
            <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-200">
              <img src={CURRENT_USER.avatarUrl} alt="User" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-xs opacity-80">Add Address</p>
              <p className="font-semibold text-sm flex items-center gap-1">
                Bangalore <ChevronRight size={14} />
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <QrCode size={24} className="opacity-90" />
            <Bell size={24} className="opacity-90" />
            <HelpCircle size={24} className="opacity-90" />
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex justify-between items-center border border-white/20">
          <div>
            <p className="text-xs text-blue-100">Wallet Balance</p>
            <p className="text-xl font-bold">₹ 4,250.00</p>
          </div>
          <button className="bg-white text-[#5f259f] px-4 py-2 rounded-full text-xs font-bold">
            Top Up
          </button>
        </div>
      </div>

      {/* Transfer Money Section */}
      <div className="px-4 -mt-6">
        <div className="bg-white rounded-xl shadow-sm p-4 grid grid-cols-4 gap-4">
          <ActionButton icon={<UserIcon />} label="To Contact" />
          <ActionButton icon={<Banknote />} label="To Bank" />
          <ActionButton icon={<ArrowUpRight />} label="To Self" />
          <ActionButton icon={<Wallet />} label="Check Balance" />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mt-6">
        <h3 className="font-bold text-gray-800 mb-4">Send Money To</h3>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {QUICK_CONTACTS.map((c, i) => (
            <div key={i} className="flex flex-col items-center min-w-[70px]">
              <div className="w-14 h-14 rounded-full overflow-hidden mb-2 border border-gray-100">
                <img src={c.img} alt={c.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-xs text-gray-600 font-medium">{c.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Banners */}
      <div className="px-4 mt-6">
        <div className="w-full h-32 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-between px-6 text-white shadow-lg relative overflow-hidden">
            <div className="z-10">
                <p className="font-bold text-lg">Refer & Earn ₹100</p>
                <p className="text-xs opacity-90">Invite your friends to PayPe</p>
            </div>
            <Zap size={64} className="text-white/20 absolute -right-4 -bottom-4 z-0 rotate-12" />
        </div>
      </div>
    </div>
  );
};

const ActionButton = ({ icon, label }: any) => (
  <div className="flex flex-col items-center gap-2">
    <div className="w-12 h-12 bg-[#5f259f] text-white rounded-xl flex items-center justify-center shadow-indigo-100 shadow-lg">
      {React.cloneElement(icon, { size: 20 })}
    </div>
    <span className="text-[10px] text-gray-600 font-medium text-center leading-tight">{label}</span>
  </div>
);

// --- Scanner Screen ---
const ScannerScreen = ({ onBack, onScanSuccess }: any) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanning, setScanning] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string>('');
  const [hasNativeSupport, setHasNativeSupport] = useState(false);

  useEffect(() => {
    // Check for native barcode support in the browser
    if ('BarcodeDetector' in window) {
      setHasNativeSupport(true);
    }

    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1080 },
            height: { ideal: 1920 }
          } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setError('');
      } catch (err) {
        console.error("Camera error", err);
        setScanning(false);
        setError('Camera access denied. Please allow permissions.');
      }
    };
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  // Native Scanning Loop
  useEffect(() => {
    if (!scanning || analyzing || !hasNativeSupport) return;

    const scanInterval = setInterval(async () => {
      if (videoRef.current && videoRef.current.readyState === 4) { // HAVE_ENOUGH_DATA
        try {
          // @ts-ignore
          const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
          // @ts-ignore
          const codes = await barcodeDetector.detect(videoRef.current);
          
          if (codes.length > 0) {
            const rawValue = codes[0].rawValue;
            if (rawValue) {
              setScanning(false);
              setAnalyzing(true);
              if (navigator.vibrate) navigator.vibrate(200);
              onScanSuccess(rawValue);
            }
          }
        } catch (e) {
          // Detection failed or not supported in this frame
        }
      }
    }, 300);

    return () => clearInterval(scanInterval);
  }, [scanning, analyzing, hasNativeSupport, onScanSuccess]);

  const simulateScan = async (type: 'merchant' | 'personal') => {
    setAnalyzing(true);
    // Simulate API delay for effect
    await new Promise(r => setTimeout(r, 1500));
    const mockId = type === 'merchant' ? 'star_bakery@okhdfc' : 'rahul.verma@okybl';
    onScanSuccess(mockId);
  };

  return (
    <div className="h-full bg-black relative flex flex-col">
      <div className="absolute top-4 left-4 z-20">
        <button onClick={onBack} className="bg-black/40 p-2 rounded-full text-white backdrop-blur-md">
          <X size={24} />
        </button>
      </div>
      
      <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-black">
        {scanning && !error ? (
           <video 
             ref={videoRef} 
             autoPlay 
             playsInline 
             muted 
             className="w-full h-full object-cover" 
           />
        ) : (
            <div className="text-white text-center p-6 flex flex-col items-center">
                <p className="mb-4">{error || "Camera initialization failed"}</p>
                <Button onClick={onBack} className="bg-white/20">Go Back</Button>
            </div>
        )}
        
        {/* Scan Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-72 h-72 border-2 border-white/50 rounded-2xl relative overflow-hidden">
                 {/* Scanning Animation */}
                {scanning && !analyzing && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-green-400 shadow-[0_0_20px_rgba(74,222,128,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
                )}

                {/* Corners */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#5f259f] rounded-tl-sm"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#5f259f] rounded-tr-sm"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#5f259f] rounded-bl-sm"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#5f259f] rounded-br-sm"></div>
                
                {analyzing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10">
                        <div className="text-white flex flex-col items-center animate-pulse">
                            <Search size={32} className="mb-2" />
                            <span className="text-sm font-bold">Verifying QR Code...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>

        <div className="absolute bottom-32 w-full text-center text-white/90 text-sm font-medium drop-shadow-md z-10">
             {hasNativeSupport ? "Point camera at any UPI QR Code" : "Native scanning unavailable in this browser"}
        </div>
      </div>

      {/* Demo Controls */}
      <div className="bg-white p-6 rounded-t-3xl absolute bottom-0 w-full z-20 pb-safe">
        <p className="text-center text-xs text-gray-500 mb-4 uppercase tracking-widest font-bold">
           {hasNativeSupport ? "Or try demo modes" : "Use simulation to proceed"}
        </p>
        <div className="flex gap-3">
            <Button fullWidth onClick={() => simulateScan('merchant')} disabled={analyzing} className="bg-blue-600 text-sm hover:bg-blue-700">
                Merchant QR
            </Button>
            <Button fullWidth onClick={() => simulateScan('personal')} disabled={analyzing} className="bg-green-600 text-sm hover:bg-green-700">
                Personal QR
            </Button>
        </div>
      </div>
      
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// --- Payment Screen ---
const PaymentScreen = ({ payee, onBack, onSuccess, initialAmount }: any) => {
  const [step, setStep] = useState<'amount' | 'pin'>('amount');
  const [amount, setAmount] = useState(initialAmount || '');
  const [pin, setPin] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleNumClick = (val: string) => {
    if (step === 'amount') {
      if (val === '.' && amount.includes('.')) return;
      if (amount.length > 6) return; // Limit
      setAmount(prev => prev + val);
    } else {
      if (pin.length < 4) setPin(prev => prev + val);
    }
  };

  const handleDelete = () => {
    if (step === 'amount') setAmount(prev => prev.slice(0, -1));
    else setPin(prev => prev.slice(0, -1));
  };

  const handlePay = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setStep('pin');
  };

  const handlePinSubmit = async () => {
      setProcessing(true);
      // Simulate network
      await new Promise(r => setTimeout(r, 2000));
      const newTx: Transaction = {
          id: 'tx' + Date.now(),
          amount: parseFloat(amount),
          payeeName: payee.name,
          payeeUpi: payee.upiId,
          date: new Date().toLocaleString(),
          status: 'SUCCESS',
          type: 'DEBIT'
      };
      setProcessing(false);
      onSuccess(newTx);
  };

  if (processing) {
      return (
          <div className="h-full flex flex-col items-center justify-center bg-[#5f259f] text-white">
              <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mb-6"></div>
              <h2 className="text-xl font-bold">Processing Payment</h2>
              <p className="opacity-80 mt-2">Connecting securely to {payee.bankName}...</p>
          </div>
      )
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <Header 
        title={step === 'amount' ? "Send Money" : "Enter UPI PIN"} 
        onBack={step === 'pin' ? () => setStep('amount') : onBack} 
        variant="primary" 
      />

      <div className="p-6 flex-1 flex flex-col items-center">
        {/* Payee Info */}
        <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-indigo-100 text-[#5f259f] flex items-center justify-center text-2xl font-bold mb-3 border-2 border-indigo-50">
                {payee.name[0]}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{payee.name}</h2>
            <p className="text-sm text-gray-500">{payee.upiId}</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                <span>Banking with {payee.bankName}</span>
                {payee.isVerified && <CheckCircle size={12} className="text-green-500" />}
            </div>
        </div>

        {/* Input Area */}
        <div className="flex-1 w-full flex flex-col items-center justify-center mb-4">
            {step === 'amount' ? (
                <div className="flex items-center justify-center text-5xl font-bold text-gray-800">
                    <span className="text-3xl mr-1">₹</span>
                    {amount || '0'}
                </div>
            ) : (
                <div className="flex gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`w-4 h-4 rounded-full border border-gray-400 ${pin.length >= i ? 'bg-black border-black' : ''}`} />
                    ))}
                </div>
            )}
            
            {step === 'amount' && (
                <div className="bg-purple-50 text-[#5f259f] px-3 py-1 rounded-full text-xs font-medium mt-4">
                    Add a message (Optional)
                </div>
            )}
        </div>

        {step === 'amount' ? (
             <Button fullWidth onClick={handlePay} disabled={!amount}>
                Proceed to Pay
            </Button>
        ) : (
            <div className="w-full text-center pb-4 text-xs text-gray-400 flex justify-center items-center gap-2">
                <SecureBadge /> UPI PIN is encrypted
            </div>
        )}
      </div>

      {/* Numpad */}
      <div className="bg-gray-50 pb-safe">
        <div className="grid grid-cols-3 gap-[1px] bg-gray-200">
            {['1','2','3','4','5','6','7','8','9','.', '0'].map(key => (
                 <div key={key} className="bg-white">
                    <NumberPadKey value={key} onClick={() => handleNumClick(key)} />
                 </div>
            ))}
            <div className="bg-white">
                <NumberPadKey value={<Delete />} onClick={handleDelete} />
            </div>
        </div>
        {step === 'pin' && (
            <button onClick={handlePinSubmit} className="w-full bg-[#5f259f] text-white py-4 font-bold text-lg active:bg-[#4b1d7f]">
                SUBMIT
            </button>
        )}
      </div>
    </div>
  );
};

// --- Success Screen ---
const SuccessScreen = ({ transaction, onHome }: any) => {
    return (
        <div className="h-full bg-green-600 text-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                 <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
                 <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
            </div>

            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl animate-bounce">
                <CheckCircle size={40} className="text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p className="opacity-90 text-sm mb-8">Transaction ID: {transaction.id}</p>
            
            <div className="text-5xl font-bold mb-4">₹ {transaction.amount}</div>
            
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 w-full max-w-sm border border-white/20">
                <div className="flex justify-between mb-4">
                    <span className="opacity-80">Paid to</span>
                    <span className="font-bold">{transaction.payeeName}</span>
                </div>
                <div className="flex justify-between mb-4">
                    <span className="opacity-80">UPI ID</span>
                    <span className="font-mono text-sm">{transaction.payeeUpi}</span>
                </div>
                <div className="flex justify-between">
                    <span className="opacity-80">Date</span>
                    <span>{transaction.date}</span>
                </div>
            </div>

            <button onClick={onHome} className="mt-12 bg-white text-green-700 px-8 py-3 rounded-full font-bold shadow-lg hover:bg-gray-100 transition-colors">
                Done
            </button>
        </div>
    )
}

// --- History Screen ---
const HistoryScreen = ({ transactions, onBack }: any) => {
    const [insight, setInsight] = useState<string>('');

    useEffect(() => {
        const fetchInsight = async () => {
            const summary = await generateTransactionInsight(transactions);
            setInsight(summary);
        }
        fetchInsight();
    }, [transactions]);

    return (
        <div className="bg-gray-50 min-h-full">
            <Header title="History" variant="secondary" />
            
            {/* AI Insight */}
            <div className="p-4">
                <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-4 rounded-xl border border-purple-200 mb-4 flex items-start gap-3">
                    <div className="bg-white p-2 rounded-full shadow-sm text-purple-600">
                        <Zap size={16} fill="currentColor" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-purple-900 mb-1">Spending Insight</h4>
                        <p className="text-xs text-purple-800 leading-relaxed">
                            {insight || "Analyzing your recent spends with AI..."}
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    {transactions.map((tx: Transaction) => (
                        <div key={tx.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                    {tx.type === 'CREDIT' ? <ArrowDownLeft size={20} className="text-green-600" /> : <ArrowUpRight size={20} className="text-gray-800" />}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">{tx.payeeName}</p>
                                    <p className="text-xs text-gray-500">{tx.date}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-bold ${tx.type === 'CREDIT' ? 'text-green-600' : 'text-gray-900'}`}>
                                    {tx.type === 'CREDIT' ? '+' : '-'} ₹{tx.amount}
                                </p>
                                <p className="text-[10px] text-gray-400">Debited from Bank</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Profile Screen ---
const ProfileScreen = ({ onBack }: any) => {
    return (
        <div className="bg-gray-50 min-h-full">
            <Header title="My Profile" variant="secondary" />
            
            <div className="p-4">
                <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4 mb-6">
                    <img src={CURRENT_USER.avatarUrl} className="w-16 h-16 rounded-full" />
                    <div>
                        <h2 className="text-lg font-bold">{CURRENT_USER.name}</h2>
                        <p className="text-gray-500 text-sm">{CURRENT_USER.mobile}</p>
                        <p className="text-[#5f259f] text-xs font-medium bg-purple-50 px-2 py-1 rounded mt-1 inline-block">
                            {CURRENT_USER.upiId}
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <QrCode className="text-gray-600" />
                            <span className="font-medium">My QR Code</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-400" />
                    </div>
                    <div className="p-6 flex justify-center bg-gray-50">
                        <img src={CURRENT_USER.qrCodeUrl} className="w-40 h-40" alt="QR" />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {[
                        { icon: <Banknote size={20} />, label: "Bank Accounts" },
                        { icon: <ShieldCheck size={20} />, label: "Privacy & Security" },
                        { icon: <HelpCircle size={20} />, label: "Help & Support" },
                    ].map((item, i) => (
                        <div key={i} className="p-4 border-b border-gray-100 last:border-0 flex justify-between items-center hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-center gap-3 text-gray-700">
                                {item.icon}
                                <span className="font-medium text-sm">{item.label}</span>
                            </div>
                            <ChevronRight size={16} className="text-gray-400" />
                        </div>
                    ))}
                </div>
                
                <div className="mt-8 flex justify-center">
                    <button className="text-red-500 font-medium text-sm">Log Out</button>
                </div>
            </div>
        </div>
    )
}