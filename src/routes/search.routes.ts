import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as searchController from '../controllers/search.controller';

const router = Router();

router.use(authMiddleware);

/**
 * GET /api/search?q=...&mode=keyword|semantic|hybrid&limit=20
 * Returns { results: { document_id, document_title, snippet }[] }
 */
router.get('/', searchController.search);

export default router;
