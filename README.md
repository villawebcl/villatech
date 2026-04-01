# VillaTech

Ecommerce en Next.js 16 + App Router + Prisma + NextAuth v5.

## Primera corrida local

1. Copia `.env.example` a `.env`.
2. Completa al menos estas variables:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/villatech"
AUTH_SECRET="un-secreto-largo-de-32-caracteres-o-mas"
NEXTAUTH_SECRET="un-secreto-largo-de-32-caracteres-o-mas"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_URL="http://localhost:3000"
```

3. Levanta Postgres localmente y crea la base `villatech`.
4. Ejecuta:

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

## Credenciales seed

- Admin: `admin@villatech.cl`
- Password: `admin1234`

## Variables opcionales

- `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`: habilitan login con Google.
- `CLOUDINARY_*` y `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`: necesarias para subir imágenes desde el panel admin.
- `TRANSBANK_*`: ya vienen con credenciales de integración para pruebas locales.
- `MERCADOPAGO_*`, `UPSTASH_*`: declaradas, pero no participan del flujo principal actual.

## Verificación rápida

- Tienda: `http://localhost:3000`
- Admin: `http://localhost:3000/admin`
- Login admin: usar las credenciales seed
