import { Router } from 'express';
import contractsRouter from './contractsRouter';

const router = Router({ caseSensitive: false });

router.use(contractsRouter);

export default router;
