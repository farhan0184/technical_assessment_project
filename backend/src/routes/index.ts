import { Router } from 'express';
import { getSurahs, getSurahByNumber } from '../controllers/surahController';

const router = Router();

router.get('/surahs', getSurahs);
router.get('/surahs/:id', getSurahByNumber);

export default router;
