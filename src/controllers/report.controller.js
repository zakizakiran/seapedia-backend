const reportService = require('../services/report.service');

const getBuyerSpendingReport = async (req, res, next) => {
    try {
        const result = await reportService.getBuyerSpendingReport(req.user.id);

        res.status(200).json({
            status: 'success',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getSellerIncomeReport = async (req, res, next) => {
    try {
        const result = await reportService.getSellerIncomeReport(req.user.id);

        res.status(200).json({
            status: 'success',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getBuyerSpendingReport,
    getSellerIncomeReport,
};
