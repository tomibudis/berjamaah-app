'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import type { DateRange } from 'react-day-picker';

// Mock data for programs
const mockPrograms = [
  {
    id: 1,
    title: 'Bantuan Pendidikan Anak Yatim',
    description:
      'Program bantuan pendidikan untuk anak-anak yatim piatu di daerah terpencil',
    targetAmount: 50000000,
    currentAmount: 32500000,
    participants: 45,
    status: 'active',
    startDate: '2024-01-15',
    endDate: '2024-12-31',
    image: '/api/placeholder/300/200',
    category: 'Pendidikan',
    location: 'Jakarta Selatan',
    organizer: 'Yayasan Berjamaah',
    contact: 'admin@berjamaah.com',
    details:
      'Program ini bertujuan untuk memberikan bantuan pendidikan kepada anak-anak yatim piatu yang tinggal di daerah terpencil. Bantuan meliputi biaya sekolah, buku pelajaran, seragam, dan kebutuhan pendidikan lainnya. Program ini telah berjalan selama 3 tahun dan telah membantu lebih dari 200 anak.',
    beneficiaries: 'Anak-anak yatim piatu usia 6-18 tahun',
    requirements:
      'Surat keterangan yatim piatu, KTP orang tua/wali, Surat keterangan tidak mampu',
    updates: [
      {
        date: '2024-01-20',
        title: 'Program dimulai',
        description:
          'Program bantuan pendidikan anak yatim telah dimulai dengan 45 peserta pertama.',
      },
      {
        date: '2024-02-15',
        title: 'Penambahan peserta',
        description:
          'Program berhasil menambah 20 peserta baru dari daerah terpencil.',
      },
    ],
  },
  {
    id: 2,
    title: 'Renovasi Masjid Al-Ikhlas',
    description:
      'Renovasi masjid yang sudah lama tidak terawat untuk kenyamanan jamaah',
    targetAmount: 100000000,
    currentAmount: 75000000,
    participants: 120,
    status: 'active',
    startDate: '2024-02-01',
    endDate: '2024-11-30',
    image: '/api/placeholder/300/200',
    category: 'Infrastruktur',
    location: 'Bekasi',
    organizer: 'DKM Masjid Al-Ikhlas',
    contact: 'dkm@masjid-alikhlas.com',
    details:
      'Renovasi masjid Al-Ikhlas yang sudah berdiri selama 20 tahun dan membutuhkan perbaikan menyeluruh. Renovasi meliputi atap, lantai, sistem listrik, dan fasilitas wudhu. Masjid ini melayani jamaah sekitar 500 orang setiap hari.',
    beneficiaries: 'Jamaah Masjid Al-Ikhlas dan masyarakat sekitar',
    requirements: 'Dokumen legalitas masjid, IMB, Surat izin renovasi',
    updates: [
      {
        date: '2024-02-01',
        title: 'Survey lokasi',
        description:
          'Tim survey telah melakukan pengecekan kondisi masjid dan menyusun rencana renovasi.',
      },
      {
        date: '2024-03-15',
        title: 'Mulai renovasi',
        description:
          'Renovasi dimulai dengan perbaikan atap dan sistem listrik.',
      },
    ],
  },
  {
    id: 3,
    title: 'Bantuan Korban Bencana Banjir',
    description:
      'Bantuan darurat untuk korban banjir di wilayah Jakarta Selatan',
    targetAmount: 75000000,
    currentAmount: 75000000,
    participants: 200,
    status: 'completed',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    image: '/api/placeholder/300/200',
    category: 'Bencana',
    location: 'Jakarta Selatan',
    organizer: 'Tim Relawan Berjamaah',
    contact: 'relawan@berjamaah.com',
    details:
      'Program bantuan darurat untuk korban banjir yang melanda Jakarta Selatan pada awal tahun 2024. Bantuan meliputi makanan, pakaian, obat-obatan, dan kebutuhan dasar lainnya. Program telah berhasil membantu 200 keluarga yang terdampak.',
    beneficiaries: 'Korban banjir di Jakarta Selatan',
    requirements: 'KTP, Surat keterangan terdampak banjir dari RT/RW',
    updates: [
      {
        date: '2024-01-05',
        title: 'Distribusi bantuan pertama',
        description:
          'Bantuan makanan dan pakaian telah didistribusikan ke 50 keluarga pertama.',
      },
      {
        date: '2024-02-10',
        title: 'Bantuan medis',
        description:
          'Tim medis telah memberikan bantuan kesehatan kepada korban banjir.',
      },
      {
        date: '2024-03-31',
        title: 'Program selesai',
        description:
          'Program bantuan banjir telah selesai dengan total 200 keluarga terbantu.',
      },
    ],
  },
  {
    id: 4,
    title: 'Program Beasiswa Mahasiswa',
    description:
      'Beasiswa untuk mahasiswa berprestasi dari keluarga kurang mampu',
    targetAmount: 200000000,
    currentAmount: 45000000,
    participants: 25,
    status: 'active',
    startDate: '2024-03-01',
    endDate: '2024-12-31',
    image: '/api/placeholder/300/200',
    category: 'Pendidikan',
    location: 'Seluruh Indonesia',
    organizer: 'Yayasan Berjamaah',
    contact: 'beasiswa@berjamaah.com',
    details:
      'Program beasiswa untuk mahasiswa berprestasi dari keluarga kurang mampu. Beasiswa meliputi biaya kuliah, buku, dan uang saku. Program ini bertujuan untuk membantu mahasiswa yang memiliki prestasi akademik namun terkendala biaya.',
    beneficiaries: 'Mahasiswa berprestasi dari keluarga kurang mampu',
    requirements:
      'Transkrip nilai, Surat keterangan tidak mampu, Rekomendasi dosen',
    updates: [
      {
        date: '2024-03-01',
        title: 'Pembukaan pendaftaran',
        description:
          'Pendaftaran beasiswa dibuka untuk mahasiswa semester 3-7.',
      },
      {
        date: '2024-04-15',
        title: 'Seleksi tahap 1',
        description:
          'Seleksi dokumen telah selesai, 50 kandidat lolos ke tahap wawancara.',
      },
    ],
  },
];

// Program Details Drawer Component
function ProgramDetailsDrawer({ program }: { program: any }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'completed':
        return 'Selesai';
      case 'paused':
        return 'Dijeda';
      default:
        return 'Tidak Diketahui';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {program.title}
        </h2>
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(program.status)}`}
        >
          {getStatusText(program.status)}
        </span>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Progress</span>
          <span className="text-gray-900 dark:text-white font-medium">
            {Math.round((program.currentAmount / program.targetAmount) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-green-600 h-3 rounded-full transition-all duration-300"
            style={{
              width: `${(program.currentAmount / program.targetAmount) * 100}%`,
            }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Terkumpul: {formatCurrency(program.currentAmount)}</span>
          <span>Target: {formatCurrency(program.targetAmount)}</span>
        </div>
      </div>

      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Deskripsi
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {program.description}
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Detail Program
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {program.details}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
              Kategori
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {program.category}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
              Lokasi
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {program.location}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
              Peserta
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {program.participants} orang
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
              Organizer
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {program.organizer}
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
            Penerima Manfaat
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {program.beneficiaries}
          </p>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
            Persyaratan
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {program.requirements}
          </p>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
            Kontak
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {program.contact}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
              Tanggal Mulai
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {formatDate(program.startDate)}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
              Tanggal Selesai
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {formatDate(program.endDate)}
            </p>
          </div>
        </div>
      </div>

      {/* Updates */}
      {program.updates && program.updates.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Update Terbaru
          </h3>
          <div className="space-y-3">
            {program.updates.map((update: any, index: number) => (
              <div key={index} className="border-l-2 border-green-500 pl-4">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                    {update.title}
                  </h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(update.date)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {update.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Filter Drawer Component
function FilterDrawer({
  onApplyFilters,
  onClearFilters,
}: {
  onApplyFilters: (filters: any) => void;
  onClearFilters: () => void;
}) {
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    minAmount: '',
    maxAmount: '',
    dateRange: undefined as DateRange | undefined,
    achievement: 'all',
  });

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
  };

  const handleClear = () => {
    setFilters({
      status: 'all',
      category: 'all',
      minAmount: '',
      maxAmount: '',
      dateRange: undefined,
      achievement: 'all',
    });
    onClearFilters();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Status Filter */}
        <div>
          <label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">
            Status
          </label>
          <Select
            value={filters.status}
            onValueChange={value => handleFilterChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="completed">Selesai</SelectItem>
              <SelectItem value="paused">Dijeda</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">
            Kategori
          </label>
          <Select
            value={filters.category}
            onValueChange={value => handleFilterChange('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              <SelectItem value="Pendidikan">Pendidikan</SelectItem>
              <SelectItem value="Infrastruktur">Infrastruktur</SelectItem>
              <SelectItem value="Bencana">Bencana</SelectItem>
              <SelectItem value="Kesehatan">Kesehatan</SelectItem>
              <SelectItem value="Sosial">Sosial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Amount Range Filter */}
        <div>
          <label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">
            Range Jumlah (Rupiah)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.minAmount}
              onChange={e => handleFilterChange('minAmount', e.target.value)}
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxAmount}
              onChange={e => handleFilterChange('maxAmount', e.target.value)}
            />
          </div>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">
            Range Tanggal
          </label>
          <DateRangePicker
            value={filters.dateRange}
            onChange={range => handleFilterChange('dateRange', range)}
            placeholder="Pilih rentang tanggal"
          />
        </div>

        {/* Achievement Filter */}
        <div>
          <label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">
            Pencapaian
          </label>
          <Select
            value={filters.achievement}
            onValueChange={value => handleFilterChange('achievement', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih pencapaian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Pencapaian</SelectItem>
              <SelectItem value="0-25">0% - 25%</SelectItem>
              <SelectItem value="25-50">25% - 50%</SelectItem>
              <SelectItem value="50-75">50% - 75%</SelectItem>
              <SelectItem value="75-100">75% - 100%</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          onClick={handleApply}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          Terapkan Filter
        </Button>
        <Button onClick={handleClear} variant="outline" className="flex-1">
          Reset
        </Button>
      </div>
    </div>
  );
}

export default function ProgramPage() {
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [filteredPrograms, setFilteredPrograms] = useState(mockPrograms);
  const [activeFilters, setActiveFilters] = useState<any>({});

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'completed':
        return 'Selesai';
      case 'paused':
        return 'Dijeda';
      default:
        return 'Tidak Diketahui';
    }
  };

  const applyFilters = (filters: any) => {
    let filtered = [...mockPrograms];

    // Filter by status
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(program => program.status === filters.status);
    }

    // Filter by category
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(
        program => program.category === filters.category
      );
    }

    // Filter by amount range
    if (filters.minAmount) {
      filtered = filtered.filter(
        program => program.targetAmount >= parseInt(filters.minAmount)
      );
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(
        program => program.targetAmount <= parseInt(filters.maxAmount)
      );
    }

    // Filter by date range
    if (filters.dateRange?.from) {
      filtered = filtered.filter(
        program =>
          program.startDate >=
          filters.dateRange.from!.toISOString().split('T')[0]
      );
    }
    if (filters.dateRange?.to) {
      filtered = filtered.filter(
        program =>
          program.endDate <= filters.dateRange.to!.toISOString().split('T')[0]
      );
    }

    // Filter by achievement
    if (filters.achievement && filters.achievement !== 'all') {
      const [min, max] = filters.achievement.split('-').map(Number);
      filtered = filtered.filter(program => {
        const achievement =
          (program.currentAmount / program.targetAmount) * 100;
        return achievement >= min && achievement <= max;
      });
    }

    setFilteredPrograms(filtered);
    setActiveFilters(filters);
  };

  const clearFilters = () => {
    setFilteredPrograms(mockPrograms);
    setActiveFilters({});
  };

  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-sm px-4 py-6 sm:max-w-md md:max-w-lg lg:max-w-md xl:max-w-lg">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Program Aktif
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Sedang berjalan
                </p>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  12
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Total Peserta
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Semua program
                </p>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  1,234
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Program Selesai
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Berhasil diselesaikan
                </p>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  45
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Total Terkumpul
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Sepanjang waktu
                </p>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  Rp 2.5M
                </div>
              </div>
            </div>
          </div>
          {/* Header */}
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              List Program
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Buat program baru, edit yang sudah ada, dan pantau
              perkembangannya.
            </p>
          </div>

          {/* Add Program Button and Filter */}
          <div className="flex justify-between items-center gap-2">
            <Link href="/admin/program/add">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Tambah Program
              </Button>
            </Link>

            <Drawer direction="bottom">
              <DrawerTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  Filter
                  {Object.keys(activeFilters).some(key => {
                    const value = activeFilters[key];
                    if (key === 'dateRange') {
                      return (
                        (value && (value as DateRange)?.from) ||
                        (value as DateRange)?.to
                      );
                    }
                    return value && value !== 'all';
                  }) && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {
                        Object.entries(activeFilters).filter(([key, value]) => {
                          if (key === 'dateRange') {
                            return (
                              (value && (value as DateRange)?.from) ||
                              (value as DateRange)?.to
                            );
                          }
                          return value && value !== 'all';
                        }).length
                      }
                    </span>
                  )}
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mx-auto w-full max-w-md h-[80vh] flex flex-col overflow-y-auto">
                  <DrawerHeader className="flex-shrink-0">
                    <DrawerTitle>Filter Program</DrawerTitle>
                    <DrawerDescription>
                      Saring program berdasarkan kriteria yang diinginkan
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className="flex-1 px-4 pb-4">
                    <FilterDrawer
                      onApplyFilters={applyFilters}
                      onClearFilters={clearFilters}
                    />
                  </div>
                  <DrawerFooter className="flex-shrink-0">
                    <DrawerClose asChild>
                      <Button variant="outline">Tutup</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </div>
              </DrawerContent>
            </Drawer>
          </div>

          {/* Program Cards */}
          <div className="space-y-4">
            {filteredPrograms.map(program => (
              <Drawer key={program.id}>
                <DrawerTrigger asChild className="gap-2">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                            {program.title}
                          </CardTitle>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(program.status)}`}
                        >
                          {getStatusText(program.status)}
                        </span>
                      </div>
                      <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                        {program.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Progress Bar */}
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-400">
                              Progress
                            </span>
                            <span className="text-gray-900 dark:text-white font-medium">
                              {Math.round(
                                (program.currentAmount / program.targetAmount) *
                                  100
                              )}
                              %
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${(program.currentAmount / program.targetAmount) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                            <span>
                              Terkumpul: {formatCurrency(program.currentAmount)}
                            </span>
                            <span>
                              Target: {formatCurrency(program.targetAmount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </DrawerTrigger>
                <DrawerContent>
                  <div className="mx-auto w-full max-w-md h-[80vh] flex flex-col overflow-y-auto">
                    <DrawerHeader className="flex-shrink-0">
                      <DrawerTitle>Detail Program</DrawerTitle>
                      <DrawerDescription>
                        Informasi lengkap tentang program ini
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="flex-1  px-4 pb-4">
                      <ProgramDetailsDrawer program={program} />
                    </div>
                    <DrawerFooter className="flex-shrink-0">
                      <DrawerClose asChild>
                        <Button variant="outline">Tutup</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </div>
                </DrawerContent>
              </Drawer>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
