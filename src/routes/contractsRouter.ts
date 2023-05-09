
import { Request, Response, Router } from 'express';
import { contractService } from '../services';

const router = Router({ caseSensitive: false });

router.get(
  '/profiles',
  async (req: Request, res: Response) => {
    return res.send(await contractService.getAll());
  }
);

export default router;
