const prisma = require('../config/database');
const ApiError = require('../utils/apiError');

const getWalletDetails = async (userId) => {
    let wallet = await prisma.wallet.findUnique({
        where: { userId },
        include: {
            transactions: {
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!wallet) {
        wallet = await prisma.wallet.create({
            data: {
                userId,
                balance: 0
            },
            include: {
                transactions: true
            }
        });
    }

    return wallet;
};

const topUp = async (userId, amount) => {
    return await prisma.$transaction(async (tx) => {
        let wallet = await tx.wallet.findUnique({
            where: { userId }
        });

        if (!wallet) {
            wallet = await tx.wallet.create({
                data: {
                    userId,
                    balance: 0
                }
            });
        }

        const updatedWallet = await tx.wallet.update({
            where: { id: wallet.id },
            data: {
                balance: {
                    increment: amount
                }
            }
        });

        const transaction = await tx.walletTransaction.create({
            data: {
                walletId: wallet.id,
                amount,
                type: 'TOP_UP',
                description: 'Dummy top-up'
            }
        });

        return {
            wallet: updatedWallet,
            transaction
        };
    });
};

module.exports = {
    getWalletDetails,
    topUp
};
