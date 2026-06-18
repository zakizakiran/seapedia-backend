const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const SALT_ROUNDS = 12;

    // =====================================================
    // 1. USER ACCOUNTS
    // =====================================================

    // --- Admin Account ---
    const adminPassword = await bcrypt.hash('Admin@1234', SALT_ROUNDS);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@seapedia.com' },
        update: {},
        create: {
            email: 'admin@seapedia.com',
            password: adminPassword,
            name: 'System Admin',
            activeRole: 'ADMIN',
            userRoles: {
                create: [{ role: 'ADMIN' }],
            },
        },
    });
    console.log(`[seed]: ADMIN account ready — ${admin.email}`);

    // --- Multi-role Demo: Buyer + Seller ---
    const multiRolePassword = await bcrypt.hash('User@1234', SALT_ROUNDS);
    const multiRoleUser = await prisma.user.upsert({
        where: { email: 'demo@seapedia.com' },
        update: {},
        create: {
            email: 'demo@seapedia.com',
            password: multiRolePassword,
            name: 'Demo User',
            activeRole: null,
            userRoles: {
                create: [{ role: 'BUYER' }, { role: 'SELLER' }],
            },
        },
    });
    console.log(`[seed]: BUYER+SELLER account ready — ${multiRoleUser.email}`);

    // --- Seller Account (for dummy store & products) ---
    const sellerPassword = await bcrypt.hash('Seller@1234', SALT_ROUNDS);
    const seller = await prisma.user.upsert({
        where: { email: 'seller@seapedia.com' },
        update: {},
        create: {
            email: 'seller@seapedia.com',
            password: sellerPassword,
            name: 'Demo Seller',
            activeRole: 'SELLER',
            userRoles: {
                create: [{ role: 'SELLER' }],
            },
        },
    });
    console.log(`[seed]: SELLER account ready — ${seller.email}`);

    // --- Driver Account ---
    const driverPassword = await bcrypt.hash('Driver@1234', SALT_ROUNDS);
    const driver = await prisma.user.upsert({
        where: { email: 'driver@seapedia.com' },
        update: {},
        create: {
            email: 'driver@seapedia.com',
            password: driverPassword,
            name: 'Demo Driver',
            activeRole: 'DRIVER',
            userRoles: {
                create: [{ role: 'DRIVER' }],
            },
        },
    });
    console.log(`[seed]: DRIVER account ready — ${driver.email}`);

    // --- Buyer Account ---
    const buyerPassword = await bcrypt.hash('Buyer@1234', SALT_ROUNDS);
    const buyer = await prisma.user.upsert({
        where: { email: 'buyer@seapedia.com' },
        update: {},
        create: {
            email: 'buyer@seapedia.com',
            password: buyerPassword,
            name: 'Demo Buyer',
            activeRole: 'BUYER',
            userRoles: {
                create: [{ role: 'BUYER' }],
            },
        },
    });
    console.log(`[seed]: BUYER account ready — ${buyer.email}`);

    // =====================================================
    // 2. STORES (Dummy for Level 1.1)
    // =====================================================

    const store1 = await prisma.store.upsert({
        where: { name: 'Toko Laut Nusantara' },
        update: {},
        create: {
            name: 'Toko Laut Nusantara',
            description: 'Menjual berbagai hasil laut segar langsung dari nelayan Indonesia. Ikan, udang, cumi, dan kerang berkualitas premium.',
            userId: seller.id,
        },
    });
    console.log(`[seed]: Store ready — ${store1.name}`);

    // Create a second store for multi-role user (if they have SELLER role)
    const store2 = await prisma.store.upsert({
        where: { name: 'Samudra Seafood' },
        update: {},
        create: {
            name: 'Samudra Seafood',
            description: 'Seafood olahan siap masak. Praktis, higienis, dan lezat untuk keluarga Anda.',
            userId: multiRoleUser.id,
        },
    });
    console.log(`[seed]: Store ready — ${store2.name}`);

    // =====================================================
    // 3. PRODUCTS (Dummy for Level 1.1)
    // =====================================================

    const productsData = [
        // Store 1 products
        {
            name: 'Ikan Tuna Segar',
            description: 'Ikan tuna segar kualitas ekspor, ditangkap langsung dari laut dalam Maluku. Cocok untuk sashimi, steak, atau masakan rumahan.',
            price: 85000,
            stock: 50,
            imageUrl: null,
            storeId: store1.id,
        },
        {
            name: 'Udang Vaname Premium',
            description: 'Udang vaname ukuran jumbo (size 20-30), segar dan sudah dibersihkan. Ideal untuk hidangan seafood spesial.',
            price: 120000,
            stock: 30,
            imageUrl: null,
            storeId: store1.id,
        },
        {
            name: 'Cumi-Cumi Segar',
            description: 'Cumi-cumi segar dari perairan Sulawesi, ukuran medium. Tekstur kenyal dan rasa manis alami.',
            price: 65000,
            stock: 40,
            imageUrl: null,
            storeId: store1.id,
        },
        {
            name: 'Kepiting Rajungan',
            description: 'Kepiting rajungan hidup dari tambak Jawa Timur. Daging tebal dan manis, cocok untuk kepiting saus padang.',
            price: 95000,
            stock: 20,
            imageUrl: null,
            storeId: store1.id,
        },
        {
            name: 'Kerang Hijau Segar',
            description: 'Kerang hijau pilihan dari Muara Angke, sudah dicuci bersih. Per kilogram.',
            price: 35000,
            stock: 60,
            imageUrl: null,
            storeId: store1.id,
        },
        // Store 2 products
        {
            name: 'Nugget Ikan Dori',
            description: 'Nugget ikan dori homemade, tanpa pengawet. Dilapisi tepung roti renyah, tinggal goreng. Isi 15 pcs per pack.',
            price: 45000,
            stock: 100,
            imageUrl: null,
            storeId: store2.id,
        },
        {
            name: 'Otak-otak Bandeng',
            description: 'Otak-otak bandeng khas Semarang, bumbu rempah pilihan. Siap kukus atau bakar. Isi 10 pcs.',
            price: 38000,
            stock: 80,
            imageUrl: null,
            storeId: store2.id,
        },
        {
            name: 'Bakso Ikan Tenggiri',
            description: 'Bakso ikan tenggiri kenyal dan gurih, tanpa bahan pengawet. Per pack 500g (±20 butir).',
            price: 42000,
            stock: 70,
            imageUrl: null,
            storeId: store2.id,
        },
        {
            name: 'Siomay Udang Frozen',
            description: 'Siomay udang premium, isi udang melimpah. Tinggal kukus 10 menit. Isi 12 pcs per box.',
            price: 55000,
            stock: 50,
            imageUrl: null,
            storeId: store2.id,
        },
        {
            name: 'Kerupuk Ikan Salmon',
            description: 'Kerupuk ikan salmon renyah dan gurih. Snack sehat kaya omega-3. Per pack 200g.',
            price: 28000,
            stock: 120,
            imageUrl: null,
            storeId: store2.id,
        },
    ];

    for (const product of productsData) {
        await prisma.product.upsert({
            where: {
                id: `seed-${product.name.toLowerCase().replace(/\s+/g, '-')}`,
            },
            update: {},
            create: product,
        });
    }
    console.log(`[seed]: ${productsData.length} products created`);

    // =====================================================
    // 4. APPLICATION REVIEWS (Dummy for Level 1.3)
    // =====================================================

    const reviewsData = [
        {
            reviewerName: 'Budi Santoso',
            rating: 5,
            comment: 'Marketplace seafood terbaik! Produknya segar-segar dan pengirimannya cepat. Sangat recommended!',
            userId: buyer.id,
        },
        {
            reviewerName: 'Siti Rahayu',
            rating: 4,
            comment: 'Aplikasinya mudah digunakan, pilihan produk lumayan banyak. Semoga bisa tambah fitur wishlist ya.',
            userId: null, // guest review
        },
        {
            reviewerName: 'Ahmad Fauzi',
            rating: 5,
            comment: 'Sebagai penjual, platform ini sangat membantu menjangkau pembeli baru. Dashboard seller-nya intuitif.',
            userId: null,
        },
        {
            reviewerName: 'Dewi Lestari',
            rating: 3,
            comment: 'Secara keseluruhan bagus, tapi perlu perbaikan di bagian pencarian produk. Kadang loading agak lama.',
            userId: null,
        },
        {
            reviewerName: 'Rizky Pratama',
            rating: 4,
            comment: 'Senang ada marketplace khusus seafood di Indonesia. Harga kompetitif dan kualitas terjamin.',
            userId: null,
        },
    ];

    const existingReviews = await prisma.review.count();
    if (existingReviews === 0) {
        await prisma.review.createMany({ data: reviewsData });
        console.log(`[seed]: ${reviewsData.length} reviews created`);
    } else {
        console.log(`[seed]: Reviews already exist, skipping`);
    }

    console.log('[seed]: Seeding completed successfully');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('[seed]: Seeding failed', e);
        await prisma.$disconnect();
        process.exit(1);
    });
