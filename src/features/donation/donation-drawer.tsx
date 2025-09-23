'use client';

import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
  X,
} from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import { trpc } from '@/utils/trpc';
import { formatPeriodText } from '@/lib/period-utils';

interface Program {
  id: string;
  title: string;
  description: string;
  target: number;
  collected: number;
  progress: number;
  period: string;
  category: string;
  startDate?: string | null;
  endDate?: string | null;
  totalRaisedAmount?: number;
  progressPercentage?: number;
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
  // Single preview mode; no list of files
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [proofUrl, setProofUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const utils = trpc.useContext();
  const createDonation = trpc.donation.createDonation.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
    },
  });
  const { data: session } = useSession();

  const donationSchema = useMemo(
    () =>
      z
        .object({
          amount: z
            .string()
            .min(1, { message: 'Jumlah donasi wajib diisi' })
            .refine(v => !isNaN(Number(v)) && Number(v) > 0, {
              message: 'Jumlah tidak valid',
            }),
          donorName: z.string().min(1, { message: 'Nama wajib diisi' }),
          donorEmail: z.string().email({ message: 'Email tidak valid' }),
          donorPhone: z.string().optional(),
          paymentMethod: z.enum(['bank_transfer', 'digital_wallet', 'qris']),
          bankAccountSender: z.string().optional(),
          bankAccountReceiver: z.string().optional(),
          transferDate: z.string().optional(),
          donationProofImage: z.string().url('URL bukti tidak valid'),
        })
        .superRefine((data, ctx) => {
          if (data.paymentMethod === 'bank_transfer') {
            if (!selectedBank) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Pilih bank tujuan',
                path: ['paymentMethod'],
              });
            }
            if (
              !data.bankAccountSender ||
              data.bankAccountSender.trim() === ''
            ) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Rekening pengirim wajib diisi',
                path: ['bankAccountSender'],
              });
            }
          }
          if (
            data.paymentMethod === 'digital_wallet' &&
            !selectedDigitalWallet
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Pilih dompet digital',
              path: ['paymentMethod'],
            });
          }
        }),
    [selectedBank, selectedDigitalWallet]
  );

  type DonationFormValues = z.infer<typeof donationSchema>;
  const methods = useForm<DonationFormValues>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      amount: '',
      donorName: session?.user?.name || '',
      donorEmail: session?.user?.email || '',
      donorPhone: '',
      paymentMethod: 'bank_transfer',
      bankAccountSender: '',
      bankAccountReceiver: '',
      transferDate: '',
      donationProofImage: '',
    },
    mode: 'onChange',
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState,
    clearErrors,
    getValues,
  } = methods;

  useEffect(() => {
    if (donationAmount) setValue('amount', donationAmount);
  }, [donationAmount, setValue]);

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
    if (selectedPaymentMethod === 'bank_transfer') {
      const sender = getValues('bankAccountSender');
      if (!selectedBank || !sender || sender.trim() === '') {
        // trigger validation messages to show
        setValue('bankAccountSender', sender || '', { shouldValidate: true });
        return;
      }
    }
    if (selectedPaymentMethod === 'digital_wallet' && !selectedDigitalWallet)
      return;

    setValue(
      'paymentMethod',
      selectedPaymentMethod as 'bank_transfer' | 'digital_wallet' | 'qris',
      {
        shouldValidate: true,
      }
    );
    setCurrentStep('upload');
  };
  const handleDonationSubmit = async (values: DonationFormValues) => {
    if (!program) return;
    await createDonation.mutateAsync({
      programId: program.id,
      amount: Number(values.amount) * 1000,
      donorName: values.donorName,
      donorEmail: values.donorEmail,
      donorPhone: values.donorPhone,
      paymentMethod: values.paymentMethod,
      bankAccountSender: values.bankAccountSender,
      bankAccountReceiver: values.bankAccountReceiver,
      donationProofImage: values.donationProofImage,
      // transferDate left optional
    });
    onSubmit(program.id, values.amount);
    setCurrentStep('success');
  };

  const handleClose = () => {
    // Reset all state
    setDonationAmount('');
    setCurrentStep('amount');
    setSelectedPaymentMethod('');
    setUploadedFileName('');
    onClose();
  };

  const handleBack = () => {
    if (currentStep === 'payment') {
      setCurrentStep('amount');
    } else if (currentStep === 'upload') {
      setCurrentStep('payment');
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    const file = files[0];
    setUploadedFileName(file.name);
    setUploading(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'donations');
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 200);
    try {
      const resp = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      clearInterval(progressInterval);
      setUploadProgress(100);
      if (resp.ok) {
        const data = await resp.json();
        setProofUrl(data.url);
        setValue('donationProofImage', data.url, { shouldValidate: true });
        clearErrors('donationProofImage');
      }
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 300);
    }
  };

  // no removeFile list; removal handled by X button on preview

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
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleDonationSubmit)} id='donation-form'>
        <Drawer open={isOpen} onOpenChange={handleClose}>
          <DrawerContent>
            <DrawerHeader>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  {!enableBackButton && (
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={handleBack}
                      className='h-8 w-8'
                    >
                      <ArrowLeft className='h-4 w-4' />
                    </Button>
                  )}
                  <div>
                    <DrawerTitle className='text-lg font-semibold'>
                      {currentStep === 'amount' && program.title}
                      {currentStep === 'payment' && 'Pilih Metode Pembayaran'}
                      {currentStep === 'upload' && 'Upload Bukti Transaksi'}
                      {currentStep === 'success' && 'Donasi Berhasil!'}
                    </DrawerTitle>
                    {currentStep === 'amount' && (
                      <DrawerDescription className='mt-1'>
                        {program.description}
                      </DrawerDescription>
                    )}
                  </div>
                </div>
              </div>
            </DrawerHeader>

            <div className='px-4 pb-4 space-y-6 overflow-auto'>
              {/* Step 1: Amount Selection */}
              {currentStep === 'amount' && (
                <>
                  {/* Program Details */}
                  <div className='space-y-3'>
                    <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                      <Target className='w-4 h-4' />
                      <span>
                        Target Rp {program.target.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                      <Calendar className='w-4 h-4' />
                      <span>
                        {formatPeriodText(program.startDate, program.endDate)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className='space-y-2'>
                      <Progress
                        value={program.progressPercentage}
                        className='h-2'
                      />
                      <div className='flex justify-between text-sm'>
                        <span className='text-gray-600 dark:text-gray-400'>
                          Terkumpul Rp{' '}
                          {program.totalRaisedAmount?.toLocaleString('id-ID')}
                        </span>
                        <span className='font-medium text-gray-900 dark:text-white'>
                          {program.progressPercentage?.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Donation Amount */}
                  <div className='space-y-4'>
                    <div>
                      <Label htmlFor='amount' className='text-base font-medium'>
                        Jumlah Donasi (Ribu Rupiah)
                      </Label>
                      <Input
                        id='amount'
                        type='number'
                        placeholder='Masukkan jumlah donasi'
                        value={donationAmount}
                        onChange={e => setDonationAmount(e.target.value)}
                        className='mt-2'
                      />
                    </div>

                    {/* Quick Amount Buttons */}
                    <div>
                      <Label className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                        Pilih Jumlah Cepat
                      </Label>
                      <div className='grid grid-cols-4 gap-2 mt-2'>
                        {[25, 50, 75, 100, 125, 150, 175, 200].map(amount => (
                          <Button
                            key={amount}
                            variant={
                              donationAmount === amount.toString()
                                ? 'default'
                                : 'outline'
                            }
                            size='sm'
                            onClick={() => handleAmountSelect(amount)}
                            className='text-xs'
                          >
                            {amount}K
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Donation Summary */}
                    <div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-3'>
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-gray-600 dark:text-gray-400'>
                          Total Donasi:
                        </span>
                        <span className='font-semibold text-lg'>
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
                <div className='space-y-4'>
                  <div className='text-sm text-gray-600 dark:text-gray-400'>
                    Pilih metode pembayaran yang Anda inginkan
                  </div>

                  {/* Donor Info */}
                  <div className='grid grid-cols-1 gap-3'>
                    <div>
                      <Label className='text-sm font-medium'>Nama</Label>
                      <Input
                        placeholder='Nama lengkap'
                        {...register('donorName')}
                      />
                      {formState.errors.donorName && (
                        <p className='text-xs text-red-500 mt-1'>
                          {formState.errors.donorName.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className='text-sm font-medium'>Email</Label>
                      <Input
                        placeholder='email@contoh.com'
                        {...register('donorEmail')}
                      />
                      {formState.errors.donorEmail && (
                        <p className='text-xs text-red-500 mt-1'>
                          {formState.errors.donorEmail.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className='text-sm font-medium'>No. Telepon</Label>
                      <Input
                        placeholder='08xxxxxxxxxx'
                        {...register('donorPhone')}
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-3 gap-3'>
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
                        <CardContent className='p-4 text-center'>
                          <div className='flex flex-col items-center gap-2'>
                            <method.icon className='w-8 h-8 text-blue-600' />
                            <div className='space-y-1'>
                              <h3 className='font-medium text-sm'>
                                {method.name}
                              </h3>
                            </div>
                            {selectedPaymentMethod === method.id && (
                              <CheckCircle className='w-4 h-4 text-blue-600' />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Bank Transfer Details */}
                  {selectedPaymentMethod === 'bank_transfer' && (
                    <div className='space-y-3'>
                      <Alert>
                        <Info className='h-4 w-4' />
                        <AlertDescription>
                          Pilih bank tujuan untuk melihat informasi rekening
                        </AlertDescription>
                      </Alert>

                      <div className='space-y-2'>
                        <Label className='text-sm font-medium'>
                          Pilih Bank:
                        </Label>
                        <div className='grid grid-cols-2 gap-2'>
                          {getSelectedPaymentMethod()?.banks?.map(
                            (bank, index) => (
                              <Button
                                key={index}
                                variant={
                                  selectedBank === bank.name
                                    ? 'default'
                                    : 'outline'
                                }
                                size='sm'
                                onClick={() => setSelectedBank(bank.name)}
                                className='justify-start'
                              >
                                <Building2 className='w-4 h-4 mr-2' />
                                {bank.name}
                              </Button>
                            )
                          )}
                        </div>
                      </div>

                      {selectedBank && (
                        <Card className='bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'>
                          <CardContent className='p-4'>
                            <h4 className='font-semibold text-green-800 dark:text-green-200 mb-3'>
                              Informasi Rekening
                            </h4>
                            {getSelectedPaymentMethod()
                              ?.banks?.filter(
                                bank => bank.name === selectedBank
                              )
                              .map((bank, index) => (
                                <div key={index} className='space-y-2'>
                                  <div className='flex justify-between items-center'>
                                    <span className='text-sm text-gray-600 dark:text-gray-400'>
                                      Bank:
                                    </span>
                                    <span className='font-medium'>
                                      {bank.name}
                                    </span>
                                  </div>
                                  <div className='flex justify-between items-center'>
                                    <span className='text-sm text-gray-600 dark:text-gray-400'>
                                      No. Rekening:
                                    </span>
                                    <div className='flex items-center gap-2'>
                                      <span className='font-mono font-medium'>
                                        {bank.account}
                                      </span>
                                      <Button
                                        variant='ghost'
                                        size='sm'
                                        onClick={() =>
                                          copyToClipboard(bank.account)
                                        }
                                        className='h-6 w-6 p-0'
                                      >
                                        <Copy className='w-3 h-3' />
                                      </Button>
                                    </div>
                                  </div>
                                  <div className='flex justify-between items-center'>
                                    <span className='text-sm text-gray-600 dark:text-gray-400'>
                                      Atas Nama:
                                    </span>
                                    <span className='font-medium'>
                                      {bank.holder}
                                    </span>
                                  </div>
                                  <div className='flex justify-between items-center'>
                                    <span className='text-sm text-gray-600 dark:text-gray-400'>
                                      Jumlah:
                                    </span>
                                    <span className='font-semibold text-green-600'>
                                      Rp{' '}
                                      {(
                                        parseInt(donationAmount) * 1000
                                      ).toLocaleString('id-ID')}
                                    </span>
                                  </div>
                                  <div className='mt-3'>
                                    <Label className='text-sm font-medium'>
                                      Rekening Pengirim
                                    </Label>
                                    <Input
                                      placeholder='Nama Bank - No.Rekening - Nama'
                                      {...register('bankAccountSender')}
                                    />
                                    {formState.errors.bankAccountSender && (
                                      <p className='text-xs text-red-500 mt-1'>
                                        {
                                          formState.errors.bankAccountSender
                                            .message
                                        }
                                      </p>
                                    )}
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
                    <div className='space-y-3'>
                      <Alert>
                        <Info className='h-4 w-4' />
                        <AlertDescription>
                          Pilih dompet digital yang akan digunakan
                        </AlertDescription>
                      </Alert>

                      <div className='space-y-2'>
                        <Label className='text-sm font-medium'>
                          Pilih Dompet Digital:
                        </Label>
                        <div className='grid grid-cols-2 gap-2'>
                          {getSelectedPaymentMethod()?.wallets?.map(
                            (wallet, index) => (
                              <Button
                                key={index}
                                variant={
                                  selectedDigitalWallet === wallet.name
                                    ? 'default'
                                    : 'outline'
                                }
                                size='sm'
                                onClick={() =>
                                  setSelectedDigitalWallet(wallet.name)
                                }
                                className='justify-start'
                              >
                                <Smartphone className='w-4 h-4 mr-2' />
                                {wallet.name}
                              </Button>
                            )
                          )}
                        </div>
                      </div>

                      {selectedDigitalWallet && (
                        <Card className='bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'>
                          <CardContent className='p-4'>
                            <h4 className='font-semibold text-blue-800 dark:text-blue-200 mb-3'>
                              Informasi Dompet Digital
                            </h4>
                            {getSelectedPaymentMethod()
                              ?.wallets?.filter(
                                wallet => wallet.name === selectedDigitalWallet
                              )
                              .map((wallet, index) => (
                                <div key={index} className='space-y-2'>
                                  <div className='flex justify-between items-center'>
                                    <span className='text-sm text-gray-600 dark:text-gray-400'>
                                      Dompet:
                                    </span>
                                    <span className='font-medium'>
                                      {wallet.name}
                                    </span>
                                  </div>
                                  <div className='flex justify-between items-center'>
                                    <span className='text-sm text-gray-600 dark:text-gray-400'>
                                      Nomor:
                                    </span>
                                    <div className='flex items-center gap-2'>
                                      <span className='font-mono font-medium'>
                                        {wallet.number}
                                      </span>
                                      <Button
                                        variant='ghost'
                                        size='sm'
                                        onClick={() =>
                                          copyToClipboard(wallet.number)
                                        }
                                        className='h-6 w-6 p-0'
                                      >
                                        <Copy className='w-3 h-3' />
                                      </Button>
                                    </div>
                                  </div>
                                  <div className='flex justify-between items-center'>
                                    <span className='text-sm text-gray-600 dark:text-gray-400'>
                                      Jumlah:
                                    </span>
                                    <span className='font-semibold text-blue-600'>
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
                    <div className='space-y-3'>
                      <Alert>
                        <Info className='h-4 w-4' />
                        <AlertDescription>
                          Scan QR Code dengan aplikasi dompet digital Anda
                        </AlertDescription>
                      </Alert>

                      <Card className='bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800'>
                        <CardContent className='p-4 text-center'>
                          <h4 className='font-semibold text-purple-800 dark:text-purple-200 mb-3'>
                            QR Code Pembayaran
                          </h4>
                          <div className='flex justify-center mb-3'>
                            <img
                              src={getSelectedPaymentMethod()?.qrCode}
                              alt='QR Code Pembayaran'
                              className='w-48 h-48 border rounded-lg'
                            />
                          </div>
                          <div className='space-y-2'>
                            <div className='flex justify-between items-center'>
                              <span className='text-sm text-gray-600 dark:text-gray-400'>
                                Jumlah:
                              </span>
                              <span className='font-semibold text-purple-600'>
                                Rp{' '}
                                {(
                                  parseInt(donationAmount) * 1000
                                ).toLocaleString('id-ID')}
                              </span>
                            </div>
                            <p className='text-xs text-gray-500'>
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
                <div className='space-y-4'>
                  <div className='text-sm text-gray-600 dark:text-gray-400'>
                    Upload bukti transaksi pembayaran Anda
                  </div>

                  {/* Upload Area with preview (like add program) */}
                  <div className='border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center'>
                    {proofUrl ? (
                      <div className='relative'>
                        <img
                          src={proofUrl}
                          alt='Bukti Donasi'
                          className='w-full object-cover rounded-lg border'
                        />
                        {uploadedFileName && (
                          <div className='absolute bottom-2 left-2 right-10 bg-black/60 text-white text-xs px-2 py-1 rounded truncate'>
                            {uploadedFileName}
                          </div>
                        )}
                        <Button
                          type='button'
                          variant='destructive'
                          size='sm'
                          className='absolute top-2 right-2'
                          onClick={() => {
                            setProofUrl('');
                            setUploadedFileName('');
                            setValue('donationProofImage', '', {
                              shouldValidate: true,
                            });
                          }}
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      </div>
                    ) : (
                      <Label
                        htmlFor='file-upload'
                        className='cursor-pointer flex flex-col items-center space-y-2'
                      >
                        {uploading ? (
                          <div className='flex flex-col items-center space-y-2'>
                            <div className='w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin' />
                            <p className='text-sm text-gray-600 dark:text-gray-400'>
                              Mengupload... {uploadProgress}%
                            </p>
                          </div>
                        ) : (
                          <>
                            <Upload className='h-8 w-8 text-gray-400' />
                            <div className='text-sm text-gray-600 dark:text-gray-400'>
                              <p className='font-medium'>
                                Klik untuk upload bukti transfer
                              </p>
                              <p>PNG, JPG, WEBP, GIF (max 5MB)</p>
                            </div>
                          </>
                        )}
                        <Input
                          id='file-upload'
                          type='file'
                          accept='image/*'
                          multiple={false}
                          onChange={handleFileUpload}
                          className='hidden'
                          disabled={uploading}
                        />
                      </Label>
                    )}
                    {!proofUrl && (
                      <p className='text-xs text-gray-500 mt-1'>
                        PNG, JPG, JPEG (max 5MB)
                      </p>
                    )}
                  </div>
                  {/* Validation Message */}
                  {formState.errors.donationProofImage && (
                    <p className='text-xs text-red-500'>
                      {formState.errors.donationProofImage.message}
                    </p>
                  )}
                </div>
              )}

              {/* Step 4: Success */}
              {currentStep === 'success' && (
                <div className='text-center space-y-4'>
                  <CheckCircle className='w-16 h-16 text-green-500 mx-auto' />
                  <div>
                    <h3 className='text-lg font-semibold text-green-600'>
                      Donasi Berhasil!
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                      Terima kasih atas donasi Anda sebesar{' '}
                      <span className='font-semibold'>
                        Rp{' '}
                        {(parseInt(donationAmount) * 1000).toLocaleString(
                          'id-ID'
                        )}
                      </span>
                    </p>
                    <p className='text-xs text-gray-500 mt-2'>
                      Bukti donasi akan diverifikasi dalam 1-2 hari kerja
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className='space-y-2'>
                {currentStep === 'amount' && (
                  <>
                    <Button
                      onClick={handleAmountSubmit}
                      disabled={!donationAmount}
                      className='w-full'
                    >
                      <HandCoins className='w-4 h-4 mr-2' />
                      Lanjutkan Donasi
                    </Button>
                    <DrawerClose asChild>
                      <Button
                        variant='outline'
                        className='w-full'
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
                      className='w-full'
                    >
                      Lanjutkan
                    </Button>
                    <Button
                      variant='outline'
                      className='w-full'
                      onClick={handleBack}
                    >
                      Kembali
                    </Button>
                  </>
                )}

                {currentStep === 'upload' && (
                  <>
                    <Button
                      type='submit'
                      form='donation-form'
                      className='w-full'
                      disabled={!proofUrl || createDonation.isPending}
                      onClick={handleSubmit(handleDonationSubmit)}
                    >
                      <HandCoins className='w-4 h-4 mr-2' />
                      Kirim Donasi
                    </Button>
                    <Button
                      variant='outline'
                      className='w-full'
                      onClick={handleBack}
                    >
                      Kembali
                    </Button>
                  </>
                )}

                {currentStep === 'success' && (
                  <Button onClick={handleClose} className='w-full'>
                    Tutup
                  </Button>
                )}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </form>
    </FormProvider>
  );
}
