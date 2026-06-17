const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();


async function main() {
    const SALT_ROUNDS = 12;

    const admins = [
        {
            email: 'admin@seapedia.com',
            password: 'Admin@1234',
            name: 'System Admin',
            role: 'ADMIN',
        },
    ];

    for (const admin of admins) {
        const hashedPassword = await bcrypt.hash(admin.password, SALT_ROUNDS);

        const user = await prisma.user.upsert({
            where: { email: admin.email },
            update: {},
            create: {
                email: admin.email,
                password: hashedPassword,
                name: admin.name,
                role: admin.role,
            },
        });

        console.log(`[seed]: ${admin.role} account ready — ${user.email}`);
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
