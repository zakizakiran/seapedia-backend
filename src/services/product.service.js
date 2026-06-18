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

module.exports = {
    getProducts,
    getProductById,
};
