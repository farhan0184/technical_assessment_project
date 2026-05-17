import { Router } from 'express';
import { getSurahs, getSurahByNumber, searchTranslation } from '../controllers/surahController';

const router = Router();

router.get('/surahs', getSurahs);
router.get('/surahs/search', searchTranslation);
router.get('/surahs/:id', getSurahByNumber);

export default router;
