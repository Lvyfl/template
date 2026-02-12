import { Router } from 'express';
import { createPost, getPosts, updatePost, deletePost, getPublicPosts, getPostById } from '../controllers/postController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Public route - no authentication required
router.get('/public', getPublicPosts);
router.get('/public/:id', getPostById);

// Protected routes
router.use(authenticateToken);

router.post('/', createPost);
router.get('/', getPosts);
router.get('/:id', getPostById);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);

export default router;
