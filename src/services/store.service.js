const prisma = require('../config/database');
const ApiError = require('../utils/apiError');
const { escapeHtml } = require('../utils/sanitize.utils');


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

    const sanitizedName = escapeHtml(data.name);
    const sanitizedDescription = data.description ? escapeHtml(data.description) : null;

    const existingName = await prisma.store.findUnique({
        where: { name: sanitizedName },
    });

    if (existingName) {
        throw ApiError.badRequest('Store name is already taken.');
    }

    const store = await prisma.store.create({
        data: {
            name: sanitizedName,
            description: sanitizedDescription,
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

    let sanitizedName = store.name;
    let sanitizedDescription = store.description;

    if (data.name && data.name !== store.name) {
        sanitizedName = escapeHtml(data.name);
        const existingName = await prisma.store.findUnique({
            where: { name: sanitizedName },
        });

        if (existingName) {
            throw ApiError.badRequest('Store name is already taken.');
        }
    }

    if (data.description !== undefined) {
        sanitizedDescription = data.description ? escapeHtml(data.description) : null;
    }

    const updatedStore = await prisma.store.update({
        where: { userId },
        data: {
            name: sanitizedName,
            description: sanitizedDescription,
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
