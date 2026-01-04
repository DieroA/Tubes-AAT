# Tubes AAT - Portal Warga Microservices

Platform pelaporan warga berbasis **Event-Driven Microservices**. Proyek ini mendemonstrasikan pemisahan proses antara penerimaan laporan (HTTP) dan pemrosesan latar belakang (Kafka Consumers) untuk skalabilitas dan responsivitas.

## Arsitektur Sistem

Sistem ini terdiri dari komponen berikut yang berjalan dalam container Docker:

- **Frontend**: Next.js (Port 3000) - Antarmuka pengguna "Portal Warga".
- **API Gateway**: Nginx (Port 8080) - Entry point tunggal yang meneruskan request ke backend.
- **Message Broker**: Apache Kafka (Single Node) - Mengelola distribusi event antar service.
- **Microservices (NestJS)**:
  1.  **Report Service**: Menerima input HTTP dan mem-publish event `citizen.report.created`.
  2.  **Workflow Service**: Consumer yang memvalidasi dan menetapkan tiket dinas.
  3.  **Notification Service**: Consumer yang mensimulasikan pengiriman notifikasi ke user.
- **Database**: PostgreSQL.

## Cara Menjalankan

Prasyarat: Pastikan **Docker Desktop** sudah terinstall dan berjalan.

1.  **Clone Repository**

    ```bash
    git clone https://github.com/DieroA/Tubes-AAT.git
    cd Tubes-AAT
    ```

2.  **Jalankan dengan Docker Compose**
    Perintah ini akan mem-build image dan menjalankan semua service (Frontend, Backend, Kafka, DB).

    ```bash
    docker-compose up -d --build
    ```

3.  **Tunggu Inisialisasi**
    Tunggu sekitar 30-60 detik agar Kafka siap sepenuhnya. Anda bisa memantau status service:
    ```bash
    docker-compose logs -f report-service
    ```
    _Pastikan log menampilkan: "REPORT SERVICE is listening on port 3001"_

## Cara Demo / Testing

1.  **Buka Aplikasi**
    Akses browser ke: [http://localhost:3000](http://localhost:3000)

2.  **Pantau Log (Visualisasi Event)**
    Buka terminal baru dan jalankan perintah ini untuk melihat aliran data antar service secara real-time:

    ```bash
    docker-compose logs -f report-service workflow-service notification-service
    ```

3.  **Kirim Laporan**
    - Isi formulir di web dan klik **"Kirim Laporan"**.
    - Anda akan melihat log berbeda muncul secara bersamaan di terminal:
      - `[Report Service]`: Menerima request HTTP.
      - `[Workflow Service]`: Memproses validasi lokasi & assignment.
      - `[Notification Service]`: Mengirim notifikasi push/email.

## Tech Stack

- **Frontend**: Next.js 16, Tailwind CSS, Shadcn UI
- **Backend**: NestJS (Monorepo setup)
- **Infrastructure**: Docker, Nginx, Apache Kafka, PostgreSQL

## Troubleshooting

Jika mengalami error koneksi Kafka atau service crash saat awal startup:

```bash
# Restart service backend saja
docker-compose restart report-service workflow-service notification-service
```
