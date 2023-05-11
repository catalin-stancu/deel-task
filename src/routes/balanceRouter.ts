
import { Request, Response, Router } from 'express';
import { getProfile } from '../middleware/getProfile';
import { balanceService } from '../services';
import validate from '../middleware/validations';
import { balanceDepositSchema } from '../validations/balance';

const router = Router({ caseSensitive: false });

// Not very clear if the logged in user is the one who deposits money into another user's balance.
// Is he transfering money from his own balance, or some external money?
// For simplicity I'm going to assume we're talking about the second case.
// In order for this API to accept the deposit, the version provided in the If-Match header
// Must be the exact current version of the profile you are trying to update
router.post('/balances/deposit/:userId',
  getProfile,
  validate(balanceDepositSchema),
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { amount } = req.body;
    const version = Number(req.get('if-match'));
    return res.send(await balanceService.depositMoney({ amount, version }, Number(userId), req.profile.id));
  }
);

export default router;
