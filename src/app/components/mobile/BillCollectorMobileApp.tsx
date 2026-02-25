import { useState } from 'react';
import BillCollectorLogin from './BillCollectorLogin';
import BillCollectorHome from './BillCollectorHome';
import BillCollectorAppDetail from './BillCollectorAppDetail';
import BillCollectorDCBForm from './BillCollectorDCBForm';
import BillCollectorBillGeneration from './BillCollectorBillGeneration';
import BillCollectorBillReceipt from './BillCollectorBillReceipt';
import BillCollectorPaymentMethods from './BillCollectorPaymentMethods';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface BCCollectorData {
  id: string;
  billCollectorId: string;
  name: string;
  phone: string;
  designation: string;
  district: string;
  ulb: string;
  ulbType: string;
}

export interface BCApplication {
  id: string;
  applicationNo: string;
  rrNumber: string;
  applicantName: string;
  connectionType: string; // Usage category: Domestic, Non-Domestic, Commercial, Industrial
  meteringType: string; // 'Metered' or 'Non-Metered'
  district: string;
  ulb: string;
  ulbType: string;
  meterCategory: string;
  meterStatus: string;
  meterInstalledDate: string;
  meterNumber: string;
  lastMeterReading: number;
  ward: string;
  status: string;
  dcbEntry: any;
}

type Screen = 'login' | 'home' | 'detail' | 'dcb' | 'billgen' | 'receipt' | 'payment';

// ─── Component ──────────────────────────────────────────────────────────────

export default function BillCollectorMobileApp() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [collectorData, setCollectorData] = useState<BCCollectorData | null>(null);
  const [wards, setWards] = useState<string[]>([]);
  const [selectedApp, setSelectedApp] = useState<BCApplication | null>(null);
  const [selectedWard, setSelectedWard] = useState('');
  const [dcbFormData, setDcbFormData] = useState<any>(null);
  const [billReceiptData, setBillReceiptData] = useState<any>(null);

  const handleLoginSuccess = (data: { collector: BCCollectorData; wards: string[] }) => {
    setCollectorData(data.collector);
    setWards(data.wards);
    setCurrentScreen('home');
  };

  const handleViewApp = (app: BCApplication) => {
    setSelectedApp(app);
    setCurrentScreen('detail');
  };

  const handleOpenDCB = (app: BCApplication) => {
    setSelectedApp(app);
    setCurrentScreen('dcb');
  };

  const handleBackToHome = () => {
    setCurrentScreen('home');
    setSelectedApp(null);
  };

  const handleBackToDetail = () => {
    setCurrentScreen('detail');
  };

  const handleDCBSaved = () => {
    setCurrentScreen('home');
    setSelectedApp(null);
  };

  const handleProceedToBillGen = (dcbData: any) => {
    setDcbFormData(dcbData);
    setCurrentScreen('billgen');
  };

  const handleBackToDCB = () => {
    setCurrentScreen('dcb');
  };

  const handleBillGenerated = () => {
    setDcbFormData(null);
    setCurrentScreen('home');
    setSelectedApp(null);
  };

  const handleViewReceipt = (billData: any) => {
    setBillReceiptData(billData);
    setCurrentScreen('receipt');
  };

  const handleReceiptDone = () => {
    setBillReceiptData(null);
    setDcbFormData(null);
    setCurrentScreen('home');
    setSelectedApp(null);
  };

  const handlePayFromReceipt = () => {
    setCurrentScreen('payment');
  };

  const handleBackToReceipt = () => {
    setCurrentScreen('receipt');
  };

  const handlePaymentComplete = () => {
    setBillReceiptData(null);
    setDcbFormData(null);
    setCurrentScreen('home');
    setSelectedApp(null);
  };

  const handleLogout = () => {
    setCollectorData(null);
    setWards([]);
    setSelectedApp(null);
    setSelectedWard('');
    setCurrentScreen('login');
  };

  switch (currentScreen) {
    case 'login':
      return <BillCollectorLogin onLoginSuccess={handleLoginSuccess} />;
    case 'home':
      return (
        <BillCollectorHome
          collector={collectorData!}
          wards={wards}
          selectedWard={selectedWard}
          onSelectWard={setSelectedWard}
          onViewApp={handleViewApp}
          onLogout={handleLogout}
        />
      );
    case 'detail':
      return (
        <BillCollectorAppDetail
          collector={collectorData!}
          application={selectedApp!}
          onBack={handleBackToHome}
          onOpenDCB={handleOpenDCB}
        />
      );
    case 'dcb':
      return (
        <BillCollectorDCBForm
          collector={collectorData!}
          application={selectedApp!}
          ward={selectedWard}
          onBack={handleBackToDetail}
          onSaved={handleDCBSaved}
          onProceedToBillGen={handleProceedToBillGen}
        />
      );
    case 'billgen':
      return (
        <BillCollectorBillGeneration
          collector={collectorData!}
          application={selectedApp!}
          dcbData={dcbFormData}
          ward={selectedWard}
          onBack={handleBackToDCB}
          onBillGenerated={handleBillGenerated}
          onViewReceipt={handleViewReceipt}
        />
      );
    case 'receipt':
      return (
        <BillCollectorBillReceipt
          collector={collectorData!}
          application={selectedApp!}
          dcbData={dcbFormData}
          billData={billReceiptData}
          ward={selectedWard}
          onDone={handleReceiptDone}
          onPay={handlePayFromReceipt}
        />
      );
    case 'payment':
      return (
        <BillCollectorPaymentMethods
          collector={collectorData!}
          application={selectedApp!}
          totalAmount={billReceiptData && billReceiptData.totalBillAmount ? billReceiptData.totalBillAmount : '0'}
          billId={billReceiptData && billReceiptData.billId ? billReceiptData.billId : 'N/A'}
          billData={billReceiptData}
          dcbData={dcbFormData}
          ward={selectedWard}
          onBack={handleBackToReceipt}
          onPaymentComplete={handlePaymentComplete}
        />
      );
    default:
      return <BillCollectorLogin onLoginSuccess={handleLoginSuccess} />;
  }
}