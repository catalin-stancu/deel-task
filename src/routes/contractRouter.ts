
import { Request, Response, Router } from 'express';
import { getProfile } from '../middleware/getProfile';
import { contractService } from '../services';

const router = Router({ caseSensitive: false });

router.get('/contracts',
  getProfile,
  async (req: Request, res: Response) => {
    return res.send(await contractService.getAllForUser(req.profile.id));
  }
);

router.get('/contracts/:contractId',
  getProfile,
  async (req: Request, res: Response) => {
    const { contractId } = req.params;
    return res.send(await contractService.getOneForUser(Number(contractId), req.profile.id));
  }
);

export default router;
