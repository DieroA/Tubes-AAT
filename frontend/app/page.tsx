"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Camera,
  CheckCircle,
  ImageIcon,
  Loader2,
  MapPin,
  X,
} from "lucide-react";
import { useRef, useState } from "react";

export default function ReportPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    isAnonymous: true,
    location: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);

      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulasi latensi Network/Kafka
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const finalPayload = {
      ...formData,
      attachment: file ? file.name : "No attachment",
      fileSize: file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "0 MB",
    };

    console.log("Payload Event ke Kafka:", finalPayload);
    setLoading(false);
    setSuccess(true);
  };

  const resetForm = () => {
    setSuccess(false);
    setFormData({
      title: "",
      description: "",
      category: "",
      isAnonymous: true,
      location: "",
    });
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md text-center pt-6">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">
                Laporan Diterima!
              </h2>
              <p className="text-slate-500 text-sm">
                Sistem telah menerbitkan tiket laporan Anda.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={resetForm} className="w-full">
              Buat Laporan Baru
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Portal Warga
          </h1>
          <p className="text-slate-500">
            Sampaikan aspirasi dan laporan infrastruktur kota secara transparan.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Formulir Pelaporan</CardTitle>
            <CardDescription>
              Isi detail laporan di bawah. Tanda (
              <span className="text-red-500">*</span>) wajib diisi.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Judul */}
              <div className="space-y-2">
                <Label htmlFor="title" className="flex gap-0">
                  Judul Laporan<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Lampu Merah Mati di Simpang Lima"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              {/* Kategori & Lokasi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 w-full">
                  <Label>Kategori Masalah</Label>
                  <Select
                    onValueChange={(val) =>
                      setFormData({ ...formData, category: val })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="infrastruktur">
                        Infrastruktur & Jalan
                      </SelectItem>
                      <SelectItem value="kebersihan">
                        Kebersihan & Taman
                      </SelectItem>
                      <SelectItem value="keamanan">
                        Keamanan & Ketertiban
                      </SelectItem>
                      <SelectItem value="kesehatan">
                        Kesehatan Masyarakat
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="flex gap-0">
                    Lokasi Kejadian<span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                      id="location"
                      className="pl-9"
                      placeholder="e.g., Jl. Contoh No. 12"
                      required
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Deskripsi */}
              <div className="space-y-2">
                <Label htmlFor="description" className="flex gap-0">
                  Deskripsi Detail<span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Jelaskan kronologi atau kondisi kerusakan secara rinci..."
                  className="min-h-30"
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              {/* Upload Mockup */}
              <div className="space-y-2">
                <Label>Bukti Pendukung</Label>

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                />

                {!preview ? (
                  <div
                    onClick={triggerFileInput}
                    className="border-2 border-dashed border-slate-200 rounded-lg p-6 hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer flex flex-col items-center justify-center text-center group"
                  >
                    <div className="bg-slate-50 p-3 rounded-full mb-3 group-hover:bg-slate-100 transition">
                      <Camera className="h-6 w-6 text-slate-400 group-hover:text-slate-500" />
                    </div>
                    <p className="text-sm text-slate-600 font-medium">
                      Klik untuk unggah foto/video
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Maksimal 10MB (JPG, PNG, MP4)
                    </p>
                  </div>
                ) : (
                  <div className="relative border rounded-lg overflow-hidden group">
                    {/* Preview Image */}
                    <div className="relative h-48 w-full bg-slate-100 flex items-center justify-center">
                      <img
                        src={preview}
                        alt="Preview"
                        className="h-full w-full object-contain"
                      />
                    </div>

                    {/* File Info */}
                    <div className="bg-white p-3 border-t flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <ImageIcon className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-slate-600 truncate max-w-50">
                          {file?.name}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2 cursor-pointer"
                        onClick={removeFile}
                      >
                        <X className="h-4 w-4 mr-1" /> Hapus
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Anonim Toggle */}
              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Lapor Anonim</Label>
                  <p className="text-xs text-slate-500">
                    Identitas Anda akan dienkripsi dan tidak terlihat oleh
                    petugas.
                  </p>
                </div>
                <Switch
                  checked={formData.isAnonymous}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isAnonymous: checked })
                  }
                  className="cursor-pointer"
                />
              </div>

              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengirim ke Server...
                  </>
                ) : (
                  "Kirim Laporan"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
