import { Router } from 'express';
import contractsRouter from './contractsRouter';
import jobsRouter from './jobsRouter';

const router = Router({ caseSensitive: false });

router.use(contractsRouter);
router.use(jobsRouter);

export default router;
