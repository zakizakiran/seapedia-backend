const prisma = require('../config/database');
const ApiError = require('../utils/apiError');
const { escapeHtml } = require('../utils/sanitize.utils');

const getProducts = async ({ page = 1, limit = 12, search, storeId, category }) => {
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

    if (category && category !== 'All') {
        where.category = category;
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

const getMyProducts = async (userId, { page = 1, limit = 12, search }) => {
    
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

const createProduct = async (userId, data) => {
    const store = await prisma.store.findUnique({
        where: { userId },
    });

    if (!store) {
        throw ApiError.badRequest('You must create a store first before adding products.');
    }

    const sanitizedName = escapeHtml(data.name);
    const sanitizedDescription = data.description ? escapeHtml(data.description) : null;

    const product = await prisma.product.create({
        data: {
            name: sanitizedName,
            description: sanitizedDescription,
            price: data.price,
            stock: data.stock,
            imageUrl: data.imageUrl,
            category: data.category,
            storeId: store.id,
        },
    });

    return product;
};

const updateProduct = async (userId, productId, data) => {
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
        throw ApiError.forbidden('You do not have permission to update this product.');
    }

    const sanitizedName = data.name !== undefined ? escapeHtml(data.name) : product.name;
    const sanitizedDescription = data.description !== undefined ? (data.description ? escapeHtml(data.description) : null) : product.description;

    const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: {
            name: sanitizedName,
            description: sanitizedDescription,
            price: data.price !== undefined ? data.price : product.price,
            stock: data.stock !== undefined ? data.stock : product.stock,
            imageUrl: data.imageUrl !== undefined ? data.imageUrl : product.imageUrl,
            category: data.category !== undefined ? data.category : product.category,
        },
    });

    return updatedProduct;
};

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
