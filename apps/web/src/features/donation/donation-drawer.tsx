'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  Target,
  Calendar,
  HandCoins,
  CreditCard,
  Smartphone,
  QrCode,
  Upload,
  ArrowLeft,
  CheckCircle,
  Copy,
  Info,
  Building2,
} from 'lucide-react';

interface Program {
  id: string;
  title: string;
  description: string;
  target: number;
  collected: number;
  progress: number;
  period: string;
  category: string;
}

interface DonationDrawerProps {
  program: Program | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (programId: string, amount: string) => void;
}

type WizardStep = 'amount' | 'payment' | 'upload' | 'success';

export function DonationDrawer({
  program,
  isOpen,
  onClose,
  onSubmit,
}: DonationDrawerProps) {
  const [donationAmount, setDonationAmount] = useState('');
  const [currentStep, setCurrentStep] = useState<WizardStep>('amount');
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>('');
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [selectedDigitalWallet, setSelectedDigitalWallet] =
    useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleAmountSelect = (amount: number) => {
    setDonationAmount(amount.toString());
  };

  const handleAmountSubmit = () => {
    if (!donationAmount || !program) return;
    setCurrentStep('payment');
  };

  const handlePaymentSubmit = () => {
    if (!selectedPaymentMethod) return;

    // Validate specific payment method selections
    if (selectedPaymentMethod === 'bank_transfer' && !selectedBank) return;
    if (selectedPaymentMethod === 'digital_wallet' && !selectedDigitalWallet)
      return;

    setCurrentStep('upload');
  };

  const handleUploadSubmit = () => {
    if (!program) return;

    // TODO: Implement actual donation submission with payment method and files
    onSubmit(program.id, donationAmount);
    setCurrentStep('success');
  };

  const handleClose = () => {
    // Reset all state
    setDonationAmount('');
    setCurrentStep('amount');
    setSelectedPaymentMethod('');
    setUploadedFiles([]);
    onClose();
  };

  const handleBack = () => {
    if (currentStep === 'payment') {
      setCurrentStep('amount');
    } else if (currentStep === 'upload') {
      setCurrentStep('payment');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // TODO: Add toast notification
  };

  const getSelectedPaymentMethod = () => {
    return paymentMethods.find(method => method.id === selectedPaymentMethod);
  };

  const paymentMethods = [
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      description: 'Transfer ke rekening bank',
      icon: CreditCard,
      banks: [
        { name: 'BCA', account: '1234567890', holder: 'Yayasan Berjamaah' },
        { name: 'Mandiri', account: '0987654321', holder: 'Yayasan Berjamaah' },
        { name: 'BNI', account: '1122334455', holder: 'Yayasan Berjamaah' },
        { name: 'BRI', account: '5544332211', holder: 'Yayasan Berjamaah' },
      ],
    },
    {
      id: 'digital_wallet',
      name: 'Dompet Digital',
      description: 'GoPay, OVO, DANA, LinkAja',
      icon: Smartphone,
      wallets: [
        { name: 'GoPay', number: '081234567890' },
        { name: 'OVO', number: '081234567890' },
        { name: 'DANA', number: '081234567890' },
        { name: 'LinkAja', number: '081234567890' },
      ],
    },
    {
      id: 'qris',
      name: 'QRIS',
      description: 'Scan QR Code untuk pembayaran',
      icon: QrCode,
      qrCode:
        'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=berjamaah-donation-qr',
    },
  ];

  if (!program) return null;

  const enableBackButton = ['amount', 'success'].includes(currentStep);
  return (
    <Drawer open={isOpen} onOpenChange={handleClose}>
      <DrawerContent>
        <DrawerHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!enableBackButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  className="h-8 w-8"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div>
                <DrawerTitle className="text-lg font-semibold">
                  {currentStep === 'amount' && program.title}
                  {currentStep === 'payment' && 'Pilih Metode Pembayaran'}
                  {currentStep === 'upload' && 'Upload Bukti Transaksi'}
                  {currentStep === 'success' && 'Donasi Berhasil!'}
                </DrawerTitle>
                {currentStep === 'amount' && (
                  <DrawerDescription className="mt-1">
                    {program.description}
                  </DrawerDescription>
                )}
              </div>
            </div>
          </div>
        </DrawerHeader>

        <div className="px-4 pb-4 space-y-6 overflow-auto">
          {/* Step 1: Amount Selection */}
          {currentStep === 'amount' && (
            <>
              {/* Program Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Target className="w-4 h-4" />
                  <span>
                    Target Rp {program.target.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{program.period}</span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <Progress value={program.progress} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Terkumpul Rp {program.collected.toLocaleString('id-ID')}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {program.progress}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Donation Amount */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount" className="text-base font-medium">
                    Jumlah Donasi (Ribu Rupiah)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Masukkan jumlah donasi"
                    value={donationAmount}
                    onChange={e => setDonationAmount(e.target.value)}
                    className="mt-2"
                  />
                </div>

                {/* Quick Amount Buttons */}
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Pilih Jumlah Cepat
                  </Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {[25, 50, 75, 100, 125, 150, 175, 200].map(amount => (
                      <Button
                        key={amount}
                        variant={
                          donationAmount === amount.toString()
                            ? 'default'
                            : 'outline'
                        }
                        size="sm"
                        onClick={() => handleAmountSelect(amount)}
                        className="text-xs"
                      >
                        {amount}K
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Donation Summary */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Total Donasi:
                    </span>
                    <span className="font-semibold text-lg">
                      {!donationAmount && '~'}
                      {donationAmount && (
                        <>
                          Rp{' '}
                          {(parseInt(donationAmount) * 1000).toLocaleString(
                            'id-ID'
                          )}
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 2: Payment Method Selection */}
          {currentStep === 'payment' && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Pilih metode pembayaran yang Anda inginkan
              </div>

              <div className="grid grid-cols-3 gap-3">
                {paymentMethods.map(method => (
                  <Card
                    key={method.id}
                    className={`cursor-pointer transition-colors ${
                      selectedPaymentMethod === method.id
                        ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <method.icon className="w-8 h-8 text-blue-600" />
                        <div className="space-y-1">
                          <h3 className="font-medium text-sm">{method.name}</h3>
                        </div>
                        {selectedPaymentMethod === method.id && (
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Bank Transfer Details */}
              {selectedPaymentMethod === 'bank_transfer' && (
                <div className="space-y-3">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Pilih bank tujuan untuk melihat informasi rekening
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Pilih Bank:</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {getSelectedPaymentMethod()?.banks?.map((bank, index) => (
                        <Button
                          key={index}
                          variant={
                            selectedBank === bank.name ? 'default' : 'outline'
                          }
                          size="sm"
                          onClick={() => setSelectedBank(bank.name)}
                          className="justify-start"
                        >
                          <Building2 className="w-4 h-4 mr-2" />
                          {bank.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {selectedBank && (
                    <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3">
                          Informasi Rekening
                        </h4>
                        {getSelectedPaymentMethod()
                          ?.banks?.filter(bank => bank.name === selectedBank)
                          .map((bank, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  Bank:
                                </span>
                                <span className="font-medium">{bank.name}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  No. Rekening:
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-medium">
                                    {bank.account}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      copyToClipboard(bank.account)
                                    }
                                    className="h-6 w-6 p-0"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  Atas Nama:
                                </span>
                                <span className="font-medium">
                                  {bank.holder}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  Jumlah:
                                </span>
                                <span className="font-semibold text-green-600">
                                  Rp{' '}
                                  {(
                                    parseInt(donationAmount) * 1000
                                  ).toLocaleString('id-ID')}
                                </span>
                              </div>
                            </div>
                          ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Digital Wallet Details */}
              {selectedPaymentMethod === 'digital_wallet' && (
                <div className="space-y-3">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Pilih dompet digital yang akan digunakan
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Pilih Dompet Digital:
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {getSelectedPaymentMethod()?.wallets?.map(
                        (wallet, index) => (
                          <Button
                            key={index}
                            variant={
                              selectedDigitalWallet === wallet.name
                                ? 'default'
                                : 'outline'
                            }
                            size="sm"
                            onClick={() =>
                              setSelectedDigitalWallet(wallet.name)
                            }
                            className="justify-start"
                          >
                            <Smartphone className="w-4 h-4 mr-2" />
                            {wallet.name}
                          </Button>
                        )
                      )}
                    </div>
                  </div>

                  {selectedDigitalWallet && (
                    <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
                          Informasi Dompet Digital
                        </h4>
                        {getSelectedPaymentMethod()
                          ?.wallets?.filter(
                            wallet => wallet.name === selectedDigitalWallet
                          )
                          .map((wallet, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  Dompet:
                                </span>
                                <span className="font-medium">
                                  {wallet.name}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  Nomor:
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-medium">
                                    {wallet.number}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      copyToClipboard(wallet.number)
                                    }
                                    className="h-6 w-6 p-0"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  Jumlah:
                                </span>
                                <span className="font-semibold text-blue-600">
                                  Rp{' '}
                                  {(
                                    parseInt(donationAmount) * 1000
                                  ).toLocaleString('id-ID')}
                                </span>
                              </div>
                            </div>
                          ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* QRIS Details */}
              {selectedPaymentMethod === 'qris' && (
                <div className="space-y-3">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Scan QR Code dengan aplikasi dompet digital Anda
                    </AlertDescription>
                  </Alert>

                  <Card className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
                    <CardContent className="p-4 text-center">
                      <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-3">
                        QR Code Pembayaran
                      </h4>
                      <div className="flex justify-center mb-3">
                        <img
                          src={getSelectedPaymentMethod()?.qrCode}
                          alt="QR Code Pembayaran"
                          className="w-48 h-48 border rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Jumlah:
                          </span>
                          <span className="font-semibold text-purple-600">
                            Rp{' '}
                            {(parseInt(donationAmount) * 1000).toLocaleString(
                              'id-ID'
                            )}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Scan QR Code dengan aplikasi dompet digital untuk
                          melakukan pembayaran
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Upload Transaction Proof */}
          {currentStep === 'upload' && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Upload bukti transaksi pembayaran Anda
              </div>

              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <Label
                  htmlFor="file-upload"
                  className="cursor-pointer justify-center"
                >
                  <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    Klik untuk upload gambar
                  </span>
                  <Input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </Label>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, JPEG (max 5MB per file)
                </p>
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">File Terupload:</Label>
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{file.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Hapus
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Success */}
          {currentStep === 'success' && (
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-green-600">
                  Donasi Berhasil!
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Terima kasih atas donasi Anda sebesar{' '}
                  <span className="font-semibold">
                    Rp{' '}
                    {(parseInt(donationAmount) * 1000).toLocaleString('id-ID')}
                  </span>
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Bukti donasi akan diverifikasi dalam 1-2 hari kerja
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            {currentStep === 'amount' && (
              <>
                <Button
                  onClick={handleAmountSubmit}
                  disabled={!donationAmount}
                  className="w-full"
                >
                  <HandCoins className="w-4 h-4 mr-2" />
                  Lanjutkan Donasi
                </Button>
                <DrawerClose asChild>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleClose}
                  >
                    Batal
                  </Button>
                </DrawerClose>
              </>
            )}

            {currentStep === 'payment' && (
              <>
                <Button
                  onClick={handlePaymentSubmit}
                  disabled={
                    !selectedPaymentMethod ||
                    (selectedPaymentMethod === 'bank_transfer' &&
                      !selectedBank) ||
                    (selectedPaymentMethod === 'digital_wallet' &&
                      !selectedDigitalWallet)
                  }
                  className="w-full"
                >
                  Lanjutkan
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleBack}
                >
                  Kembali
                </Button>
              </>
            )}

            {currentStep === 'upload' && (
              <>
                <Button onClick={handleUploadSubmit} className="w-full">
                  Kirim Donasi
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleBack}
                >
                  Kembali
                </Button>
              </>
            )}

            {currentStep === 'success' && (
              <Button onClick={handleClose} className="w-full">
                Tutup
              </Button>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
