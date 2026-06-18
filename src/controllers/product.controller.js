const productService = require('../services/product.service');

const getProducts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const { search, storeId } = req.query;

        const result = await productService.getProducts({ page, limit, search, storeId });

        res.status(200).json({
            status: 'success',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getProductById = async (req, res, next) => {
    try {
        const product = await productService.getProductById(req.params.id);

        res.status(200).json({
            status: 'success',
            data: { product },
        });
    } catch (error) {
        next(error);
    }
};

const getMyProducts = async (req, res, next) => {
    try {
        const { page, limit, search } = req.query;

        const result = await productService.getMyProducts(req.user.id, {
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 12,
            search,
        });

        res.status(200).json({
            status: 'success',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const createProduct = async (req, res, next) => {
    try {
        const product = await productService.createProduct(req.user.id, req.body);

        res.status(201).json({
            status: 'success',
            message: 'Product created successfully',
            data: {
                product,
            },
        });
    } catch (error) {
        next(error);
    }
};

const updateProduct = async (req, res, next) => {
    try {
        const product = await productService.updateProduct(req.user.id, req.params.id, req.body);

        res.status(200).json({
            status: 'success',
            message: 'Product updated successfully',
            data: {
                product,
            },
        });
    } catch (error) {
        next(error);
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        await productService.deleteProduct(req.user.id, req.params.id);

        res.status(200).json({
            status: 'success',
            message: 'Product deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProducts,
    getProductById,
    getMyProducts,
    createProduct,
    updateProduct,
    deleteProduct,
};
