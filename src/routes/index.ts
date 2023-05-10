import { Router } from 'express';
import contractRouter from './contractRouter';
import jobRouter from './jobRouter';
import balanceRouter from './balanceRouter';
import adminRouter from './adminRouter';

const router = Router({ caseSensitive: false });

router.use(contractRouter);
router.use(jobRouter);
router.use(balanceRouter);
router.use(adminRouter);

export default router;
