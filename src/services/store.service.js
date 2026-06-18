const prisma = require('../config/database');
const ApiError = require('../utils/apiError');

/**
 * Get store belonging to the currently logged in user.
 */
const getMyStore = async (userId) => {
    const store = await prisma.store.findUnique({
        where: { userId },
    });

    if (!store) {
        throw ApiError.notFound('Store not found. Please create one.');
    }

    return store;
};

/**
 * Create a new store for the user.
 * A user can only have one store.
 * Store name must be unique.
 */
const createStore = async (userId, data) => {
    // Check if user already has a store
    const existingStore = await prisma.store.findUnique({
        where: { userId },
    });

    if (existingStore) {
        throw ApiError.badRequest('You already have a store.');
    }

    // Check if store name is already taken
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

/**
 * Update user's store profile.
 */
const updateStore = async (userId, data) => {
    const store = await prisma.store.findUnique({
        where: { userId },
    });

    if (!store) {
        throw ApiError.notFound('Store not found. Please create one first.');
    }

    // Check if new name is taken by another store
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
    getMyStore,
    createStore,
    updateStore,
};
