
import { Request, Response, Router } from 'express';
import { getProfile } from '../middleware/getProfile';
import validate from '../middleware/validations';
import { jobService } from '../services';
import { bestProfessionSchema } from '../validations/admin';

const router = Router({ caseSensitive: false });

// I have answered this question in two ways.
// In the first one I'm using the aggregate functions of sequelize, to a certain extent that I could use them
// The second one is using a raw sql query to compute everything at the DB level, for performance
// and maybe for understanding easier, instead of reading more code
router.get('/admin/best-profession',
  getProfile,
  validate(bestProfessionSchema),
  async (req: Request, res: Response) => {
    const { start, end } = req.query;
    const bestProfessionSequelize = await jobService.getBestProfession(start as string, end as string);
    const bestProfessionRawQuery = await jobService.getBestProfessionWithRawQuery(start as string, end as string);
    return res.send({
      bestProfessionSequelize,
      bestProfessionRawQuery
    });
  }
);

export default router;
