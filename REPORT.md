# Laporan Praktikum #4 – Web Service Development Methodologies (AGILE)
**Nama/NIM**: LIRA ANGGRAINI - 230104040207
**Kelas**: TI23A
**Repo/Zip**: 
**Tanggal**: 2025-10-26

---

## 1. Tujuan
Mendemonstrasikan siklus **Agile (Mini-Sprint)** untuk layanan web:
Design-First → Mock-First (OpenAPI + Prism) → Test-First (Jest + Supertest) →
Implementasi (GREEN) → CI (lint+typecheck+test) → Hardening (observability & security).

## 2. Ringkasan Arsitektur
- **Services**: `order-service`, `notification-service`
- **Kontrak**: `openapi/api.yaml` (lint 0 error)
- **Testing**: Jest + Supertest
- **CI**: GitHub Actions (`.github/workflows/ci.yml`)
- **Observability**: Pino (JSON), `x-correlation-id`
- **Security**: Auth Bearer (dummy), Helmet, Rate-Limit, Validasi (Zod)

## 3. Hasil Utama
- **Lint OpenAPI**: LULUS (lihat `docs/spectral_pass.png`)
- **Unit test**: 2 passed, 5 tests (lihat `docs/npm_test_pass.png`)
- **CI**: Hijau (lihat `docs/ci_pass.png`)
- **Mock-First bukti**: lihat `mock_logs/`
- **Hardening bukti**: lihat `hardening_logs/`

## 4. Bukti Eksekusi (tautan cepat)
### 4.1 Mock-First
- 201 Created – `mock_logs/<ts>_201_orders.txt`
- 200 OK – `mock_logs/<ts>_200_notifications.txt`
- 401 Unauthorized – `mock_logs/<ts>_401_notifications.txt`
- 400 Bad Request – `mock_logs/<ts>_400_orders.txt`

### 4.2 Hardening (Runtime)
- 201 Created (orders) – `hardening_logs/<ts>_201_orders.txt`
- 200 OK (notifications) – `hardening_logs/<ts>_200_notifications.txt`
- 401 Unauthorized (orders, tanpa bearer) – `hardening_logs/<ts>_401_orders.txt`
- 400 ValidationError (orders) – `hardening_logs/<ts>_400_orders_validation.txt`
- 400 Bad JSON (opsional) – `hardening_logs/<ts>_400_orders_badjson.txt`

> **Cek header**: `x-correlation-id` muncul di response;
> **Helmet headers** (CSP, X-Frame-Options, X-Content-Type-Options, dll.) muncul di 200/201.

## 5. Penjelasan Hardening
- **Logging**: Pino (JSON). Field sensitif (`authorization`, `cookie`) **[REDACTED]**.
- **Tracing**: `x-correlation-id` disisipkan lebih awal → konsisten di log & response.
- **Error Safety**:
  - JSON rusak ⇒ **400 BAD_JSON** (bukan 500).
  - Validasi bisnis gagal ⇒ **400 ValidationError**.
  - Tanpa bearer ⇒ **401 UNAUTH**.
- **Rate-Limit**: 60/min (orders), 120/min (notif).
- **Security Headers**: via Helmet (CSP, X-Frame-Options, HSTS, dsb).

## 6. Cara Reproduksi (singkat)
```bash
npm ci
npm run dev:orders    # :5002
npm run dev:notif     # :5003
# gunakan curl.exe (Windows) sesuai lampiran perintah uji