const prisma = require('../config/database');
const ApiError = require('../utils/apiError');

/**
 * Get all products (public).
 * Supports pagination, search, and filtering by store.
 */
const getProducts = async ({ page = 1, limit = 12, search, storeId }) => {
    const skip = (page - 1) * limit;

    const where = {};

    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
        ];
    }

    if (storeId) {
        where.storeId = storeId;
    }

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                store: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        }),
        prisma.product.count({ where }),
    ]);

    return {
        products,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Get a single product by ID (public).
 * Includes full store info.
 */
const getProductById = async (productId) => {
    const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
            store: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    createdAt: true,
                },
            },
        },
    });

    if (!product) {
        throw ApiError.notFound('Product not found');
    }

    return product;
};

/**
 * Get products owned by the currently logged in SELLER.
 */
const getMyProducts = async (userId, { page = 1, limit = 12, search }) => {
    // Get seller's store
    const store = await prisma.store.findUnique({
        where: { userId },
    });

    if (!store) {
        throw ApiError.badRequest('You must create a store first before managing products.');
    }

    const skip = (page - 1) * limit;
    const where = { storeId: store.id };

    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
        ];
    }

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.product.count({ where }),
    ]);

    return {
        products,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Create a new product for the SELLER's store.
 */
const createProduct = async (userId, data) => {
    const store = await prisma.store.findUnique({
        where: { userId },
    });

    if (!store) {
        throw ApiError.badRequest('You must create a store first before adding products.');
    }

    const product = await prisma.product.create({
        data: {
            name: data.name,
            description: data.description,
            price: data.price,
            stock: data.stock,
            imageUrl: data.imageUrl,
            storeId: store.id,
        },
    });

    return product;
};

/**
 * Update a product. Only allowed if the SELLER owns it.
 */
const updateProduct = async (userId, productId, data) => {
    const store = await prisma.store.findUnique({
        where: { userId },
    });

    if (!store) {
        throw ApiError.badRequest('You must create a store first.');
    }

    // Ensure the product exists and belongs to this store
    const product = await prisma.product.findUnique({
        where: { id: productId },
    });

    if (!product) {
        throw ApiError.notFound('Product not found');
    }

    if (product.storeId !== store.id) {
        throw ApiError.forbidden('You do not have permission to update this product.');
    }

    const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: {
            name: data.name !== undefined ? data.name : product.name,
            description: data.description !== undefined ? data.description : product.description,
            price: data.price !== undefined ? data.price : product.price,
            stock: data.stock !== undefined ? data.stock : product.stock,
            imageUrl: data.imageUrl !== undefined ? data.imageUrl : product.imageUrl,
        },
    });

    return updatedProduct;
};

/**
 * Delete a product. Only allowed if the SELLER owns it.
 */
const deleteProduct = async (userId, productId) => {
    const store = await prisma.store.findUnique({
        where: { userId },
    });

    if (!store) {
        throw ApiError.badRequest('You must create a store first.');
    }

    const product = await prisma.product.findUnique({
        where: { id: productId },
    });

    if (!product) {
        throw ApiError.notFound('Product not found');
    }

    if (product.storeId !== store.id) {
        throw ApiError.forbidden('You do not have permission to delete this product.');
    }

    await prisma.product.delete({
        where: { id: productId },
    });

    return true;
};

module.exports = {
    getProducts,
    getProductById,
    getMyProducts,
    createProduct,
    updateProduct,
    deleteProduct,
};
