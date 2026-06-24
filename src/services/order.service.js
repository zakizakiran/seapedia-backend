const prisma = require('../config/database');
const ApiError = require('../utils/apiError');

const DELIVERY_FEES = {
    INSTANT: 50000,
    NEXT_DAY: 30000,
    REGULAR: 15000
};

const TAX_RATE = 0.12;

const getCheckoutSummary = async (buyerId, addressId, deliveryMethod, discountCode) => {
    // Get Cart
    const cart = await prisma.cart.findUnique({
        where: { userId: buyerId },
        include: {
            items: { include: { product: true } }
        }
    });

    if (!cart || cart.items.length === 0) {
        throw ApiError.badRequest('Cart is empty');
    }

    // Verify Address
    const address = await prisma.address.findUnique({
        where: { id: addressId }
    });

    if (!address || address.userId !== buyerId) {
        throw ApiError.badRequest('Invalid address');
    }

    let subtotal = 0;
    cart.items.forEach(item => {
        subtotal += item.product.price * item.quantity;
    });

    let discount = 0;
    if (discountCode) {
        const voucher = await prisma.voucher.findUnique({ where: { code: discountCode } });
        const promo = await prisma.promo.findUnique({ where: { code: discountCode } });

        if (voucher) {
            if (voucher.expiryDate < new Date()) throw ApiError.badRequest('Voucher expired');
            if (voucher.remainingUsage <= 0) throw ApiError.badRequest('Voucher usage limit reached');
            if (voucher.discountAmount) discount = voucher.discountAmount;
            else if (voucher.discountPercent) discount = subtotal * (voucher.discountPercent / 100);
        } else if (promo) {
            if (promo.expiryDate < new Date()) throw ApiError.badRequest('Promo expired');
            if (promo.discountAmount) discount = promo.discountAmount;
            else if (promo.discountPercent) discount = subtotal * (promo.discountPercent / 100);
        } else {
            throw ApiError.badRequest('Invalid discount code');
        }
    }
    if (discount > subtotal) discount = subtotal;

    const deliveryFee = DELIVERY_FEES[deliveryMethod];
    const discountedSubtotal = subtotal - discount;
    const tax = discountedSubtotal * TAX_RATE;
    const total = discountedSubtotal + tax + deliveryFee;

    return {
        subtotal,
        discount,
        deliveryFee,
        tax,
        total
    };
};

const createOrder = async (buyerId, addressId, deliveryMethod, discountCode) => {
    return await prisma.$transaction(async (tx) => {
        // 1. Get Cart
        const cart = await tx.cart.findUnique({
            where: { userId: buyerId },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });

        if (!cart || cart.items.length === 0) {
            throw ApiError.badRequest('Cart is empty');
        }

        // 2. Verify Address
        const address = await tx.address.findUnique({
            where: { id: addressId }
        });

        if (!address || address.userId !== buyerId) {
            throw ApiError.badRequest('Invalid address');
        }

        // 3. Verify Stock & Calculate Subtotal
        let subtotal = 0;
        for (const item of cart.items) {
            if (item.product.stock < item.quantity) {
                throw ApiError.badRequest(`Insufficient stock for product ${item.product.name}`);
            }
            subtotal += item.product.price * item.quantity;
        }

        let discount = 0;
        let voucherId = null;
        let promoId = null;

        if (discountCode) {
            const voucher = await tx.voucher.findUnique({ where: { code: discountCode } });
            const promo = await tx.promo.findUnique({ where: { code: discountCode } });

            if (voucher) {
                if (voucher.expiryDate < new Date()) throw ApiError.badRequest('Voucher expired');
                if (voucher.remainingUsage <= 0) throw ApiError.badRequest('Voucher usage limit reached');
                voucherId = voucher.id;
                if (voucher.discountAmount) discount = voucher.discountAmount;
                else if (voucher.discountPercent) discount = subtotal * (voucher.discountPercent / 100);
            } else if (promo) {
                if (promo.expiryDate < new Date()) throw ApiError.badRequest('Promo expired');
                promoId = promo.id;
                if (promo.discountAmount) discount = promo.discountAmount;
                else if (promo.discountPercent) discount = subtotal * (promo.discountPercent / 100);
            } else {
                throw ApiError.badRequest('Invalid discount code');
            }
        }
        if (discount > subtotal) discount = subtotal;

        const deliveryFee = DELIVERY_FEES[deliveryMethod];
        const discountedSubtotal = subtotal - discount;
        const tax = discountedSubtotal * TAX_RATE;
        const total = discountedSubtotal + tax + deliveryFee;

        // 4. Check Wallet
        const wallet = await tx.wallet.findUnique({
            where: { userId: buyerId }
        });

        if (!wallet || wallet.balance < total) {
            throw ApiError.badRequest('Insufficient wallet balance');
        }

        // 5. Deduct Wallet
        await tx.wallet.update({
            where: { id: wallet.id },
            data: { balance: { decrement: total } }
        });

        await tx.walletTransaction.create({
            data: {
                walletId: wallet.id,
                amount: -total,
                type: 'PAYMENT',
                description: `Payment for Order`
            }
        });

        // 6. Deduct Stock Safely (Race Condition Protection)
        for (const item of cart.items) {
            const updatedProduct = await tx.product.updateMany({
                where: { 
                    id: item.productId,
                    stock: { gte: item.quantity }
                },
                data: { stock: { decrement: item.quantity } }
            });

            if (updatedProduct.count === 0) {
                throw ApiError.badRequest(`Stok produk ${item.product.name} tidak mencukupi atau habis saat checkout.`);
            }
        }

        // 7. Deduct Voucher Usage
        if (voucherId) {
            await tx.voucher.update({
                where: { id: voucherId },
                data: { remainingUsage: { decrement: 1 } }
            });
        }

        // 8. Create Order
        const order = await tx.order.create({
            data: {
                buyerId,
                storeId: cart.storeId,
                addressId,
                deliveryMethod,
                deliveryFee,
                subtotal,
                discount,
                tax,
                total,
                voucherId,
                promoId,
                status: 'PACKING',
                items: {
                    create: cart.items.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.product.price
                    }))
                },
                statusHistory: {
                    create: {
                        status: 'PACKING'
                    }
                }
            },
            include: {
                items: true,
                statusHistory: true
            }
        });

        // 9. Clear Cart
        await tx.cartItem.deleteMany({
            where: { cartId: cart.id }
        });
        await tx.cart.update({
            where: { id: cart.id },
            data: { storeId: null }
        });

        return order;
    });
};

const getBuyerOrders = async (buyerId) => {
    return await prisma.order.findMany({
        where: { buyerId },
        include: {
            store: { select: { id: true, name: true } },
            items: {
                include: { product: { select: { name: true, imageUrl: true } } }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
};

const getBuyerOrderById = async (buyerId, orderId) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            store: { select: { id: true, name: true } },
            address: true,
            items: {
                include: { product: { select: { name: true, imageUrl: true } } }
            },
            statusHistory: { orderBy: { createdAt: 'desc' } }
        }
    });

    if (!order || order.buyerId !== buyerId) {
        throw ApiError.notFound('Order not found');
    }

    return order;
};

const getSellerOrders = async (sellerId) => {
    const store = await prisma.store.findUnique({ where: { userId: sellerId } });
    if (!store) {
        throw ApiError.notFound('Store not found');
    }

    return await prisma.order.findMany({
        where: { storeId: store.id },
        include: {
            buyer: { select: { id: true, name: true, email: true } },
            items: {
                include: { product: { select: { name: true, imageUrl: true } } }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
};

const getSellerOrderById = async (sellerId, orderId) => {
    const store = await prisma.store.findUnique({ where: { userId: sellerId } });
    if (!store) {
        throw ApiError.notFound('Store not found');
    }

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            buyer: { select: { id: true, name: true, email: true } },
            address: true,
            items: {
                include: { product: { select: { name: true, imageUrl: true } } }
            },
            statusHistory: { orderBy: { createdAt: 'desc' } }
        }
    });

    if (!order || order.storeId !== store.id) {
        throw ApiError.notFound('Order not found');
    }

    return order;
};

module.exports = {
    createOrder,
    getBuyerOrders,
    getBuyerOrderById,
    getSellerOrders,
    getSellerOrderById,
    getCheckoutSummary
};
