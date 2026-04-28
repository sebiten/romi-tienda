# Romi Tienda

E-commerce de indumentaria hecho con Next.js, Supabase y Mercado Pago.

## Stack

- Next.js 16
- React 19
- Supabase
- Tailwind CSS
- shadcn/ui
- Mercado Pago
- pnpm

## Requisitos

- Node.js 20 o superior
- pnpm 10
- Un proyecto de Supabase
- Credenciales de Mercado Pago para checkout

## Instalación

```bash
pnpm install
cp .env.example .env.local
pnpm build
pnpm dev
```

La app queda disponible en `http://localhost:3000`.

## Variables de entorno

Usá `.env.example` como base. Variables principales:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_SITE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MERCADOPAGO_ACCESS_TOKEN`

Variables opcionales:

- `ALLOWED_DEV_ORIGINS`
- `WHATSAPP_ACCESS_TOKEN`

## Scripts

```bash
pnpm dev
pnpm build
pnpm start
```

## Notas de producción

- El checkout recalcula precios, descuentos y envío en backend.
- El webhook de Mercado Pago actualiza estado de pago y evita descontar stock dos veces.
- `next.config.ts` acepta imágenes remotas solo desde Supabase Storage.
- El repositorio está estandarizado para `pnpm`.

## Pendientes recomendados

- Adaptar y endurecer `app/api/send-whatsapp/route.ts` si ese flujo vuelve a entrar en alcance.
- Agregar tests del flujo de compra y del webhook.
