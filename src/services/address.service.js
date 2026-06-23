const prisma = require('../config/database');
const ApiError = require('../utils/apiError');

const createAddress = async (userId, addressData) => {
    return await prisma.$transaction(async (tx) => {
        const existingAddressesCount = await tx.address.count({
            where: { userId }
        });

        let isDefault = addressData.isDefault || false;

        if (existingAddressesCount === 0) {
            isDefault = true;
        }

        if (isDefault && existingAddressesCount > 0) {
            await tx.address.updateMany({
                where: { userId },
                data: { isDefault: false }
            });
        }

        return await tx.address.create({
            data: {
                ...addressData,
                userId,
                isDefault
            }
        });
    });
};

const getUserAddresses = async (userId) => {
    return await prisma.address.findMany({
        where: { userId },
        orderBy: [
            { isDefault: 'desc' },
            { createdAt: 'desc' }
        ]
    });
};

const getAddressById = async (userId, addressId) => {
    const address = await prisma.address.findFirst({
        where: { id: addressId, userId }
    });

    if (!address) {
        throw ApiError.notFound('Address not found');
    }

    return address;
};

const updateAddress = async (userId, addressId, addressData) => {
    return await prisma.$transaction(async (tx) => {
        const address = await tx.address.findFirst({
            where: { id: addressId, userId }
        });

        if (!address) {
            throw ApiError.notFound('Address not found');
        }

        if (addressData.isDefault && !address.isDefault) {
            await tx.address.updateMany({
                where: { userId },
                data: { isDefault: false }
            });
        }

        if (addressData.isDefault === false && address.isDefault) {
            const nextAddress = await tx.address.findFirst({
                where: { userId, id: { not: addressId } },
                orderBy: { createdAt: 'desc' }
            });
            if (!nextAddress) {
                addressData.isDefault = true;
            } else {
                await tx.address.update({
                    where: { id: nextAddress.id },
                    data: { isDefault: true }
                });
            }
        }

        return await tx.address.update({
            where: { id: addressId },
            data: addressData
        });
    });
};

const deleteAddress = async (userId, addressId) => {
    return await prisma.$transaction(async (tx) => {
        const address = await tx.address.findFirst({
            where: { id: addressId, userId }
        });

        if (!address) {
            throw ApiError.notFound('Address not found');
        }

        await tx.address.delete({
            where: { id: addressId }
        });

        if (address.isDefault) {
            const nextAddress = await tx.address.findFirst({
                where: { userId },
                orderBy: { createdAt: 'desc' }
            });

            if (nextAddress) {
                await tx.address.update({
                    where: { id: nextAddress.id },
                    data: { isDefault: true }
                });
            }
        }

        return { message: 'Address deleted successfully' };
    });
};

const setDefaultAddress = async (userId, addressId) => {
    return await prisma.$transaction(async (tx) => {
        const address = await tx.address.findFirst({
            where: { id: addressId, userId }
        });

        if (!address) {
            throw ApiError.notFound('Address not found');
        }

        if (address.isDefault) {
            return address;
        }

        await tx.address.updateMany({
            where: { userId },
            data: { isDefault: false }
        });

        return await tx.address.update({
            where: { id: addressId },
            data: { isDefault: true }
        });
    });
};

module.exports = {
    createAddress,
    getUserAddresses,
    getAddressById,
    updateAddress,
    deleteAddress,
    setDefaultAddress
};
