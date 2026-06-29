const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const SALT_ROUNDS = 12;


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


    const store1 = await prisma.store.upsert({
        where: { name: 'Toko Elektronik Makmur' },
        update: {},
        create: {
            name: 'Toko Elektronik Makmur',
            description: 'Pusat gadget dan barang elektronik terpercaya dengan garansi resmi dan harga terbaik di kelasnya.',
            userId: seller.id,
        },
    });
    console.log(`[seed]: Store ready — ${store1.name}`);


    const store2 = await prisma.store.upsert({
        where: { name: 'Gaya Nusantara' },
        update: {},
        create: {
            name: 'Gaya Nusantara',
            description: 'Menjual pakaian dan aksesori fashion pria dan wanita terkini dengan kualitas premium dan gaya kekinian.',
            userId: multiRoleUser.id,
        },
    });
    console.log(`[seed]: Store ready — ${store2.name}`);


    const productsData = [
        {
            name: 'Smartphone Android Terbaru',
            description: 'Smartphone dengan prosesor octa-core, RAM 8GB, dan baterai tahan seharian. Layar AMOLED 120Hz.',
            price: 3500000,
            stock: 50,
            imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800',
            storeId: store1.id,
        },
        {
            name: 'Laptop Gaming Pro',
            description: 'Laptop gaming dengan kartu grafis RTX 4060, layar 144Hz, dan pendingin ganda.',
            price: 15000000,
            stock: 30,
            imageUrl: 'https://images.unsplash.com/photo-1531297172868-9441504a7b5c?q=80&w=800',
            storeId: store1.id,
        },
        {
            name: 'Smart TV 4K 50 Inch',
            description: 'TV pintar resolusi 4K dengan sistem operasi Android TV. Nikmati pengalaman menonton bioskop di rumah.',
            price: 5000000,
            stock: 40,
            imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=800',
            storeId: store1.id,
        },
        {
            name: 'Headphone Bluetooth Noise Cancelling',
            description: 'Headphone nirkabel dengan fitur Active Noise Cancelling (ANC) dan daya tahan baterai hingga 30 jam.',
            price: 1200000,
            stock: 20,
            imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800',
            storeId: store1.id,
        },
        {
            name: 'Powerbank 20000mAh Fast Charging',
            description: 'Powerbank kapasitas besar mendukung pengisian cepat 20W untuk semua perangkat pintar.',
            price: 300000,
            stock: 60,
            imageUrl: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?q=80&w=800',
            storeId: store1.id,
        },
        {
            name: 'Smartwatch Fitness Tracker',
            description: 'Jam tangan pintar dengan sensor detak jantung, SpO2, dan berbagai mode olahraga.',
            price: 850000,
            stock: 100,
            imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800',
            storeId: store1.id,
        },
        {
            name: 'Mechanical Keyboard RGB',
            description: 'Keyboard mekanikal dengan switch biru yang tactile dan pencahayaan RGB yang dapat dikustomisasi.',
            price: 650000,
            stock: 80,
            imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=800',
            storeId: store1.id,
        },
        {
            name: 'Kemeja Pria Lengan Panjang',
            description: 'Kemeja kasual pria bahan katun premium yang nyaman dan tidak mudah kusut.',
            price: 150000,
            stock: 70,
            imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e32f6b717?q=80&w=800',
            storeId: store2.id,
        },
        {
            name: 'Celana Jeans Denim Slim Fit',
            description: 'Celana jeans pria potongan slim fit berbahan denim stretch yang lentur dan awet.',
            price: 250000,
            stock: 50,
            imageUrl: 'https://images.unsplash.com/photo-1542272604-780c8d17b2b7?q=80&w=800',
            storeId: store2.id,
        },
        {
            name: 'Sepatu Sneakers Kasual',
            description: 'Sepatu sneakers dengan desain modern, sol karet empuk anti slip, cocok untuk aktivitas sehari-hari.',
            price: 350000,
            stock: 120,
            imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800',
            storeId: store2.id,
        },
        {
            name: 'Tas Ransel Kulit',
            description: 'Tas ransel berkapasitas 20L dengan slot laptop 15 inci. Bahan kulit sintetis berkualitas yang tahan air.',
            price: 450000,
            stock: 45,
            imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800',
            storeId: store2.id,
        },
        {
            name: 'Jaket Hoodie Pria',
            description: 'Jaket hoodie bahan fleece tebal yang hangat dan nyaman digunakan saat cuaca dingin.',
            price: 200000,
            stock: 65,
            imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800',
            storeId: store2.id,
        },
        {
            name: 'Jam Tangan Analog Pria',
            description: 'Jam tangan dengan desain elegan, tali kulit asli, dan fitur tahan air 3 ATM.',
            price: 300000,
            stock: 90,
            imageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=800',
            storeId: store2.id,
        },
        {
            name: 'Kacamata Hitam Polarized',
            description: 'Kacamata anti silau dengan lensa polarized, cocok untuk aktivitas luar ruangan dan berkendara.',
            price: 120000,
            stock: 150,
            imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800',
            storeId: store2.id,
        },
        {
            name: 'Dompet Kulit Pria Asli',
            description: 'Dompet pria model bifold dengan banyak slot kartu. Terbuat dari 100% kulit sapi asli pilihan.',
            price: 180000,
            stock: 85,
            imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=800',
            storeId: store2.id,
        },
    ];

    const existingProducts = await prisma.product.count();
    if (existingProducts === 0) {
        await prisma.product.createMany({ data: productsData });
        console.log(`[seed]: ${productsData.length} products created`);
    } else {
        console.log(`[seed]: Products already exist, skipping`);
    }


    const reviewsData = [
        {
            reviewerName: 'Budi Santoso',
            rating: 5,
            comment: 'Marketplace terbaik! Produknya lengkap dan pengirimannya cepat. Sangat recommended!',
            userId: buyer.id,
        },
        {
            reviewerName: 'Siti Rahayu',
            rating: 4,
            comment: 'Aplikasinya mudah digunakan, pilihan produk lumayan banyak. Semoga bisa tambah fitur wishlist ya.',
            userId: null,
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
            comment: 'Senang ada e-commerce lokal yang kualitasnya bagus. Harga kompetitif dan barang terjamin orisinil.',
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


    const vouchersData = [
        {
            code: 'SEADISKON10K',
            discountAmount: 10000,
            discountPercent: null,
            expiryDate: new Date('2027-12-31'),
            remainingUsage: 100,
        },
        {
            code: 'SEAFRESH20',
            discountAmount: null,
            discountPercent: 20,
            expiryDate: new Date('2027-06-30'),
            remainingUsage: 50,
        },
        {
            code: 'LAUTBIRU5K',
            discountAmount: 5000,
            discountPercent: null,
            expiryDate: new Date('2027-03-31'),
            remainingUsage: 200,
        },
    ];

    const existingVouchers = await prisma.voucher.count();
    if (existingVouchers === 0) {
        await prisma.voucher.createMany({ data: vouchersData });
        console.log(`[seed]: ${vouchersData.length} vouchers created`);
    } else {
        console.log(`[seed]: Vouchers already exist, skipping`);
    }


    const promosData = [
        {
            code: 'PROMOSEAPEDIA',
            discountAmount: null,
            discountPercent: 15,
            expiryDate: new Date('2027-12-31'),
        },
        {
            code: 'HEMAT25K',
            discountAmount: 25000,
            discountPercent: null,
            expiryDate: new Date('2027-09-30'),
        },
    ];

    const existingPromos = await prisma.promo.count();
    if (existingPromos === 0) {
        await prisma.promo.createMany({ data: promosData });
        console.log(`[seed]: ${promosData.length} promos created`);
    } else {
        console.log(`[seed]: Promos already exist, skipping`);
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
