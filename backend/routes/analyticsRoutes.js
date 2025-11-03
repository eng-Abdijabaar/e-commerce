import express from 'express';
import { adminRout, protectRout } from '../middleware/authMidleware.js';
import { getAnalytics, getDailySalesData } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/', protectRout, adminRout, async (req, res) => {
    try {
        const analyticsData = await getAnalytics();

        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

        const dailySalesData = await getDailySalesData(startDate, endDate);

        res.status(200).json({ analyticsData, dailySalesData });
    } catch (error) {
        console.error('Error fetching analytics data route:', error.message);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
})

export default router;