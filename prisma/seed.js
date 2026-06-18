const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const SALT_ROUNDS = 12;

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
            activeRole: null, // Must select role after login
            userRoles: {
                create: [{ role: 'BUYER' }, { role: 'SELLER' }],
            },
        },
    });
    console.log(`[seed]: BUYER+SELLER account ready — ${multiRoleUser.email}`);

    // --- Single-role Demo: Driver ---
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

    // --- Single-role Demo: Buyer ---
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
