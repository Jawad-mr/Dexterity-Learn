import express from 'express';
import { getBooks, getBookBySlug, getBookPage } from '../controllers/bookController.js';

const router = express.Router();

router.get('/', getBooks);
router.get('/:slug', getBookBySlug);
router.get('/:slug/pages/:pageNumber', getBookPage);

export default router;
