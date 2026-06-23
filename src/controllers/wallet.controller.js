const walletService = require('../services/wallet.service');

const getWalletDetails = async (req, res, next) => {
    try {
        const wallet = await walletService.getWalletDetails(req.user.id);
        res.status(200).json({
            success: true,
            data: wallet
        });
    } catch (error) {
        next(error);
    }
};

const topUp = async (req, res, next) => {
    try {
        const { amount } = req.body;
        const result = await walletService.topUp(req.user.id, amount);
        res.status(200).json({
            success: true,
            message: 'Wallet topped up successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getWalletDetails,
    topUp
};
