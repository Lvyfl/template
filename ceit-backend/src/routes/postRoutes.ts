import { Router } from 'express';
import { createPost, getPosts, updatePost, deletePost, getPublicPosts } from '../controllers/postController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Public route - no authentication required
router.get('/public', getPublicPosts);

// Protected routes
router.use(authenticateToken);

router.post('/', createPost);
router.get('/', getPosts);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);

export default router;
