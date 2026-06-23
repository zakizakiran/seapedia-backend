const prisma = require('../config/database');
const ApiError = require('../utils/apiError');

const getCart = async (userId) => {
    let cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
            store: {
                select: { id: true, name: true }
            },
            items: {
                include: {
                    product: {
                        select: { id: true, name: true, price: true, stock: true, imageUrl: true }
                    }
                }
            }
        }
    });

    if (!cart) {
        cart = await prisma.cart.create({
            data: { userId },
            include: {
                items: true,
                store: true
            }
        });
    }

    let subtotal = 0;
    cart.items.forEach(item => {
        subtotal += item.quantity * item.product.price;
    });

    return { ...cart, subtotal };
};

const addOrUpdateItem = async (userId, productId, quantity) => {
    return await prisma.$transaction(async (tx) => {
        const product = await tx.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            throw ApiError.notFound('Product not found');
        }

        if (product.stock < quantity) {
            throw ApiError.badRequest(`Insufficient stock. Only ${product.stock} left.`);
        }

        let cart = await tx.cart.findUnique({
            where: { userId }
        });

        if (!cart) {
            cart = await tx.cart.create({
                data: { userId }
            });
        }

        if (cart.storeId && cart.storeId !== product.storeId) {
            throw ApiError.badRequest('Satu cart hanya boleh berisi produk dari satu toko. Kosongkan cart Anda terlebih dahulu untuk menambah produk dari toko lain.');
        }

        if (!cart.storeId) {
            await tx.cart.update({
                where: { id: cart.id },
                data: { storeId: product.storeId }
            });
        }

        const existingItem = await tx.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId
                }
            }
        });

        let cartItem;
        if (existingItem) {
            cartItem = await tx.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity }
            });
        } else {
            cartItem = await tx.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId,
                    quantity
                }
            });
        }

        return cartItem;
    });
};

const removeItem = async (userId, productId) => {
    return await prisma.$transaction(async (tx) => {
        const cart = await tx.cart.findUnique({
            where: { userId }
        });

        if (!cart) {
            throw ApiError.notFound('Cart not found');
        }

        const existingItem = await tx.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId
                }
            }
        });

        if (!existingItem) {
            throw ApiError.notFound('Item not found in cart');
        }

        await tx.cartItem.delete({
            where: { id: existingItem.id }
        });

        const remainingItems = await tx.cartItem.count({
            where: { cartId: cart.id }
        });

        if (remainingItems === 0) {
            await tx.cart.update({
                where: { id: cart.id },
                data: { storeId: null }
            });
        }

        return { message: 'Item removed from cart' };
    });
};

const clearCart = async (userId) => {
    return await prisma.$transaction(async (tx) => {
        const cart = await tx.cart.findUnique({
            where: { userId }
        });

        if (cart) {
            await tx.cartItem.deleteMany({
                where: { cartId: cart.id }
            });

            await tx.cart.update({
                where: { id: cart.id },
                data: { storeId: null }
            });
        }

        return { message: 'Cart cleared' };
    });
};

module.exports = {
    getCart,
    addOrUpdateItem,
    removeItem,
    clearCart
};
