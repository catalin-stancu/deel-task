
import { Request, Response, Router } from 'express';
import { getProfile } from '../middleware/getProfile';
import { jobService } from '../services';

const router = Router({ caseSensitive: false });

router.get('/jobs/unpaid',
  getProfile,
  async (req: Request, res: Response) => {
    return res.send(await jobService.getAllUnpaidForUser(req.profile.id));
  }
);

router.post('/jobs/:jobId/pay',
  getProfile,
  async (req: Request, res: Response) => {
    const { jobId } = req.params;
    return res.send(await jobService.payJob(Number(jobId), req.profile.id));
  }
);

export default router;
