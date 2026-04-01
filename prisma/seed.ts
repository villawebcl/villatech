import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import { getPgConnectionConfig } from '@/lib/db'

const adapter = new PrismaPg(getPgConnectionConfig(process.env.DATABASE_URL!))
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding VillaTech database...')

  // ─── Categorías ─────────────────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'notebooks' },
      update: {},
      create: { name: 'Notebooks', slug: 'notebooks', order: 0 },
    }),
    prisma.category.upsert({
      where: { slug: 'componentes' },
      update: {},
      create: { name: 'Componentes', slug: 'componentes', order: 1 },
    }),
    prisma.category.upsert({
      where: { slug: 'gaming' },
      update: {},
      create: { name: 'Gaming', slug: 'gaming', order: 2 },
    }),
    prisma.category.upsert({
      where: { slug: 'perifericos' },
      update: {},
      create: { name: 'Periféricos', slug: 'perifericos', order: 3 },
    }),
    prisma.category.upsert({
      where: { slug: 'almacenamiento' },
      update: {},
      create: { name: 'Almacenamiento', slug: 'almacenamiento', order: 4 },
    }),
    prisma.category.upsert({
      where: { slug: 'redes' },
      update: {},
      create: { name: 'Redes', slug: 'redes', order: 5 },
    }),
  ])

  const [notebooks, componentes, gaming, perifericos, almacenamiento] = categories
  console.log(`✓ ${categories.length} categorías creadas`)

  // ─── Admin user ──────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('admin1234', 12)
  await prisma.user.upsert({
    where: { email: 'admin@villatech.cl' },
    update: {},
    create: {
      email: 'admin@villatech.cl',
      name: 'Admin VillaTech',
      passwordHash: adminHash,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  })
  console.log('✓ Admin creado: admin@villatech.cl / admin1234')

  // ─── Productos de muestra ────────────────────────────────────────────────────
  const PLACEHOLDER = 'https://res.cloudinary.com/demo/image/upload/sample.jpg'

  const products = [
    {
      name: 'MacBook Air M3 15" 16GB 512GB',
      slug: 'macbook-air-m3-15-16gb-512gb',
      description:
        'El MacBook Air M3 redefine lo que significa ser ultradelgado y ultraliviano. Con el chip M3, supera cualquier laptop de su clase en rendimiento y eficiencia. 18 horas de batería, pantalla Liquid Retina 15.3 pulgadas y diseño sin ventilador.',
      price: 1_399_990,
      comparePrice: 1_599_990,
      stock: 8,
      sku: 'MBA-M3-15-16-512',
      images: [PLACEHOLDER],
      specs: {
        Procesador: 'Apple M3 (8 núcleos)',
        RAM: '16 GB',
        Almacenamiento: '512 GB SSD',
        Pantalla: '15.3" Liquid Retina 2560×1664',
        Batería: 'Hasta 18 horas',
        Peso: '1.51 kg',
        Sistema: 'macOS Sequoia',
        Color: 'Medianoche',
      },
      isActive: true,
      isFeatured: true,
      categoryId: notebooks.id,
    },
    {
      name: 'ASUS TUF Gaming F15 RTX 4060 144Hz',
      slug: 'asus-tuf-gaming-f15-rtx4060',
      description:
        'Notebook gaming de alto rendimiento con RTX 4060, pantalla 144Hz y teclado RGB. Ideal para gamers que exigen rendimiento en AAA sin sacrificar portabilidad.',
      price: 899_990,
      comparePrice: 999_990,
      stock: 5,
      sku: 'ASUS-TUF-F15-4060',
      images: [PLACEHOLDER],
      specs: {
        Procesador: 'Intel Core i7-12700H',
        RAM: '16 GB DDR5',
        Almacenamiento: '512 GB NVMe SSD',
        GPU: 'NVIDIA RTX 4060 8 GB',
        Pantalla: '15.6" FHD 144Hz IPS',
        Batería: '90 Wh',
        Sistema: 'Windows 11 Home',
      },
      isActive: true,
      isFeatured: false,
      categoryId: gaming.id,
    },
    {
      name: 'AMD Ryzen 9 7900X3D',
      slug: 'amd-ryzen-9-7900x3d',
      description:
        'Procesador de escritorio con tecnología 3D V-Cache para gaming extremo. Hasta 5.6 GHz boost, 12 núcleos y 24 hilos. Compatible con plataforma AM5.',
      price: 379_990,
      comparePrice: null,
      stock: 12,
      sku: 'AMD-R9-7900X3D',
      images: [PLACEHOLDER],
      specs: {
        Arquitectura: 'Zen 4 con 3D V-Cache',
        Núcleos: '12 (24 hilos)',
        'Frecuencia base': '4.4 GHz',
        'Frecuencia boost': '5.6 GHz',
        Caché: '140 MB (12 + 64 L3 3D)',
        TDP: '120 W',
        Socket: 'AM5',
        Memoria: 'DDR5',
      },
      isActive: true,
      isFeatured: false,
      categoryId: componentes.id,
    },
    {
      name: 'Samsung 990 Pro 2TB NVMe PCIe 4.0',
      slug: 'samsung-990-pro-2tb-nvme',
      description:
        'El SSD NVMe más rápido de Samsung para consumidores. Velocidades de lectura hasta 7450 MB/s. Factor M.2 2280, perfecto para gaming, edición de video y workstations.',
      price: 189_990,
      comparePrice: 229_990,
      stock: 20,
      sku: 'SAM-990PRO-2TB',
      images: [PLACEHOLDER],
      specs: {
        Capacidad: '2 TB',
        Interfaz: 'PCIe 4.0 x4 NVMe 2.0',
        'Lectura secuencial': '7,450 MB/s',
        'Escritura secuencial': '6,900 MB/s',
        'Factor de forma': 'M.2 2280',
        TBW: '1,200 TBW',
        Garantía: '5 años',
      },
      isActive: true,
      isFeatured: true,
      categoryId: almacenamiento.id,
    },
    {
      name: 'Logitech MX Master 3S Inalámbrico',
      slug: 'logitech-mx-master-3s-inalambrico',
      description:
        'El mejor mouse de productividad del mercado. Scroll electromagnético MagSpeed, sensor 8000 DPI, conexión Bluetooth o Logi Bolt. Funciona en cualquier superficie.',
      price: 89_990,
      comparePrice: 109_990,
      stock: 30,
      sku: 'LOG-MX3S-BLK',
      images: [PLACEHOLDER],
      specs: {
        Sensor: 'Darkfield 8000 DPI',
        Botones: '7 programables',
        Conectividad: 'Bluetooth / Logi Bolt USB',
        Batería: 'Recargable USB-C (70 días)',
        Peso: '141 g',
        Compatibilidad: 'Windows, macOS, Linux',
        Color: 'Negro grafito',
      },
      isActive: true,
      isFeatured: false,
      categoryId: perifericos.id,
    },
    {
      name: 'Corsair K70 RGB MK.2 Cherry MX Red',
      slug: 'corsair-k70-rgb-mk2-cherry-mx-red',
      description:
        'Teclado mecánico gaming full-size con switches Cherry MX Red, retroiluminación RGB por tecla y estructura de aluminio anodizado. El estándar de referencia en gaming.',
      price: 119_990,
      comparePrice: 139_990,
      stock: 15,
      sku: 'COR-K70-MK2-RED',
      images: [PLACEHOLDER],
      specs: {
        Switches: 'Cherry MX Red (lineal)',
        Retroiluminación: 'RGB por tecla',
        Estructura: 'Aluminio anodizado',
        Conexión: 'USB-A dorado trenzado',
        'Polling rate': '1000 Hz',
        Reposamuñecas: 'Incluido (desmontable)',
        Layout: 'Full-size US',
      },
      isActive: true,
      isFeatured: false,
      categoryId: perifericos.id,
    },
    {
      name: 'ASUS ROG STRIX B650E-F Gaming WiFi',
      slug: 'asus-rog-strix-b650e-f-gaming-wifi',
      description:
        'Placa madre AM5 para Ryzen 7000 con PCIe 5.0, WiFi 6E, 4 slots M.2 y VRM de 18+2 fases para máximo overclocking. La base perfecta para un build de alto rendimiento.',
      price: 329_990,
      comparePrice: null,
      stock: 7,
      sku: 'ASUS-B650E-F-WIFI',
      images: [PLACEHOLDER],
      specs: {
        Socket: 'AM5 (Ryzen 7000)',
        Chipset: 'AMD B650E',
        'Slots RAM': '4x DDR5 (hasta 128 GB)',
        PCIe: 'PCIe 5.0 x16 (GPU)',
        'Slots M.2': '4x (1x PCIe 5.0)',
        Red: 'Intel 2.5G LAN + WiFi 6E',
        USB: 'USB 3.2 Gen 2x2 (20 Gbps)',
        VRM: '18+2 Dr. MOS',
        Form: 'ATX',
      },
      isActive: true,
      isFeatured: false,
      categoryId: componentes.id,
    },
    {
      name: 'Lenovo ThinkPad X1 Carbon Gen 12',
      slug: 'lenovo-thinkpad-x1-carbon-gen-12',
      description:
        'El ultrabook empresarial definitivo. Certificado MIL-STD-810H, pantalla 2.8K OLED, Intel Core Ultra 7, 32 GB LPDDR5x. Diseñado para profesionales exigentes.',
      price: 1_799_990,
      comparePrice: 1_999_990,
      stock: 3,
      sku: 'LEN-X1C-G12-32-1T',
      images: [PLACEHOLDER],
      specs: {
        Procesador: 'Intel Core Ultra 7 165U',
        RAM: '32 GB LPDDR5x',
        Almacenamiento: '1 TB PCIe Gen4 SSD',
        Pantalla: '14" 2.8K OLED 120Hz',
        Batería: '57 Wh (hasta 15 hrs)',
        Peso: '1.12 kg',
        Certificación: 'MIL-STD-810H',
        Sistema: 'Windows 11 Pro',
      },
      isActive: true,
      isFeatured: true,
      categoryId: notebooks.id,
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    })
  }
  console.log(`✓ ${products.length} productos creados`)

  // ─── Cupones de muestra ──────────────────────────────────────────────────────
  await prisma.coupon.upsert({
    where: { code: 'BIENVENIDO10' },
    update: {},
    create: {
      code: 'BIENVENIDO10',
      type: 'PERCENT',
      value: 10,
      minOrder: 50_000,
      maxUses: 100,
      isActive: true,
    },
  })

  await prisma.coupon.upsert({
    where: { code: 'DESCUENTO50K' },
    update: {},
    create: {
      code: 'DESCUENTO50K',
      type: 'FIXED',
      value: 50_000,
      minOrder: 300_000,
      maxUses: 50,
      isActive: true,
    },
  })
  console.log('✓ 2 cupones de muestra creados')

  console.log('\n✅ Seed completado')
  console.log('─────────────────────────────────────')
  console.log('Admin:    admin@villatech.cl')
  console.log('Password: admin1234')
  console.log('Cupones:  BIENVENIDO10 | DESCUENTO50K')
  console.log('─────────────────────────────────────')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
