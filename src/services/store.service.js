const prisma = require('../config/database');
const ApiError = require('../utils/apiError');


const getStores = async ({ page = 1, limit = 12, search }) => {
    const skip = (page - 1) * limit;

    const where = {};

    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
        ];
    }

    const [stores, total] = await Promise.all([
        prisma.store.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                description: true,
                createdAt: true,
                _count: {
                    select: { products: true },
                },
            },
        }),
        prisma.store.count({ where }),
    ]);

    return {
        stores,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

const getStoreById = async (storeId) => {
    const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            updatedAt: true,
            products: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    price: true,
                    stock: true,
                    imageUrl: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
            },
            _count: {
                select: { products: true },
            },
        },
    });

    if (!store) {
        throw ApiError.notFound('Store not found');
    }

    return store;
};


const getMyStore = async (userId) => {
    const store = await prisma.store.findUnique({
        where: { userId },
    });

    if (!store) {
        throw ApiError.notFound('Store not found. Please create one.');
    }

    return store;
};

const createStore = async (userId, data) => {
    
    const existingStore = await prisma.store.findUnique({
        where: { userId },
    });

    if (existingStore) {
        throw ApiError.badRequest('You already have a store.');
    }

    const existingName = await prisma.store.findUnique({
        where: { name: data.name },
    });

    if (existingName) {
        throw ApiError.badRequest('Store name is already taken.');
    }

    const store = await prisma.store.create({
        data: {
            name: data.name,
            description: data.description || null,
            userId,
        },
    });

    return store;
};

const updateStore = async (userId, data) => {
    const store = await prisma.store.findUnique({
        where: { userId },
    });

    if (!store) {
        throw ApiError.notFound('Store not found. Please create one first.');
    }

    if (data.name && data.name !== store.name) {
        const existingName = await prisma.store.findUnique({
            where: { name: data.name },
        });

        if (existingName) {
            throw ApiError.badRequest('Store name is already taken.');
        }
    }

    const updatedStore = await prisma.store.update({
        where: { userId },
        data: {
            name: data.name !== undefined ? data.name : store.name,
            description: data.description !== undefined ? data.description : store.description,
        },
    });

    return updatedStore;
};

module.exports = {
    getStores,
    getStoreById,
    getMyStore,
    createStore,
    updateStore,
};
