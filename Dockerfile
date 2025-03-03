FROM node:18-alpine
RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm prisma generate
RUN pnpm run build
EXPOSE 3000
CMD ["node", "dist/index.js"]

# # Gunakan image Node.js
# FROM node:18-alpine

# # Install pnpm secara global
# RUN npm install -g pnpm

# # Set working directory
# WORKDIR /app

# # Copy package.json dan pnpm-lock.yaml terlebih dahulu
# COPY package.json pnpm-lock.yaml ./

# # Install dependencies menggunakan pnpm
# RUN pnpm install --frozen-lockfile

# # Copy seluruh kode ke dalam container (termasuk prisma/schema.prisma)
# COPY . .

# # Generate Prisma Client
# RUN pnpm prisma generate

# # Build TypeScript
# RUN pnpm run build

# # Expose port aplikasi
# EXPOSE 3000

# # Jalankan aplikasi
# CMD ["node", "dist/index.js"]
