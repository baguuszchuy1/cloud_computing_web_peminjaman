# PinjamSekre – Peminjaman Barang Sekretariat Prodi
Next.js (JavaScript) + Tailwind + Supabase (Auth dan database PostgreSQL), siap deploy di Vercel.

## Menjalankan
1. Buat project di supabase.com. Buka **SQL Editor**, tempel isi `supabase/schema.sql`, lalu **Run**.
2. Supabase > Authentication > Sign In / Providers > Email: matikan **Confirm email** agar daftar langsung bisa masuk.
3. Supabase > Project Settings > API: salin **Project URL** dan **anon public key**.
4. Salin `.env.example` menjadi `.env.local`, isi kedua nilai tadi.
5. `npm install` lalu `npm run dev`, buka http://localhost:3000
6. Daftar satu akun di website, lalu jadikan admin lewat SQL Editor:
   `update profiles set role='admin' where id=(select id from auth.users where email='EMAIL_ANDA');`

## Deploy ke Vercel
Upload folder ke GitHub, import di vercel.com, tambahkan Environment Variables `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`, lalu Deploy.

## Pembaruan (jam, denda, foto)
Setelah `schema.sql`, jalankan juga `supabase/02-update.sql` di SQL Editor (sekali saja). File ini menambah jam peminjaman, cek bentrok jadwal, denda keterlambatan, dan penyimpanan foto barang.

## Docker
Aplikasi dikemas dengan Dockerfile bertahap (deps, build, produksi) dan dijalankan lewat Docker Compose bersama Nginx sebagai reverse proxy.
```
docker compose --env-file .env.local up --build -d
```
Buka http://localhost:8080 . Perintah berguna: `docker compose ps`, `docker compose logs -f web`, `docker compose down`.
Healthcheck aplikasi ada di `/api/health`. Database dan Auth tetap di Supabase (cloud).
