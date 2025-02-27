### guide how to exec this API

#### run API

`pnpm exec json-server -p 2000 db.json` -> run fake API

#### example:

| Endpoint                       | Method | Deskripsi                      |
| ------------------------------ | ------ | ------------------------------ |
| `https://localhost:3000`       | -      | Untuk mendapatkan token        |
| `https://localhost:3000`       | GET    | Untuk mendapatkan data users   |
| `https://localhost:3000/users` | POST   | Pasang token pada Bearer token |

### about

this is a note about API for study, i just want to know how to use JWT

### used

- postgresql
- prisma
- express
- ts
- jwt

### run

Jalankan API dengan `pnpm` dan jalankan DB menggunakan `Docker` seperti penjelasan di bawah atau sesuaikan dengan DB yang teman teman punya.

- `pnpm info pnpm version` # cek new versi from official pnpm
- `pnpm self-update` # update on this project
- `pnpm add -g pnpm` # update global
- `pnpm --version` # cek version pnpm on this computer
- `pnpm install` # install package

```bash
pnpm ts-node-dev --respawn --transpile-only src/index.ts #or
pnpm dev
```

runing on `http://localhost:3000`

### docker

```bash
# structur db postgresql yang di buat for this project on Docker
docker run --name my-postgres
-e POSTGRES_USER=myuser
-e POSTGRES_PASSWORD=mypassword
-e POSTGRES_DB=mydatabase
-p 5433:5432
-d postgres
```

- `sudo docker container start containerId`
  untuk menjalankan db postgresql di docker
- `sudo docker exec -it my-postgres psql -U myuser -d mydatabase`
  untuk masuk ke container postqresql dan db mydatabase

### prisma

| Perintah                       | Deskripsi                                                                           |
| ------------------------------ | ----------------------------------------------------------------------------------- |
| `pnpm add prisma@latest`       | Menambahkan Prisma ke proyek Anda dengan versi terbaru.                             |
| `pnpm exec prisma@latest init` | Menginisialisasi Prisma dalam proyek Anda.                                          |
| `pnpm exec prisma generate`    | Menghasilkan Prisma Client berdasarkan skema yang telah didefinisikan.              |
| `pnpm exec prisma db push`     | Menerapkan perubahan skema ke database tanpa melakukan migrasi.                     |
| `pnpm exec prisma studio`      | Membuka Prisma Studio, sebuah UI untuk mengelola database. `http://localhost:5555/` |

### menemerapkan JWT

```sh
pnpm add jsonwebtoken
pnpm add -D @types/jsonwebtoken
```

## Seeder Data (Opsional)

contoh file menambahkan feek data `src/seed.ts:`

```sh
pnpm tsx src/seed.ts
```

## git

push branch yang sudah di kerjakan

```sh
git push -u origin nama_branch
```
