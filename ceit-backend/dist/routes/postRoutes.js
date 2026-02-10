"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const postController_1 = require("../controllers/postController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Public route - no authentication required
router.get('/public', postController_1.getPublicPosts);
// Protected routes
router.use(authMiddleware_1.authenticateToken);
router.post('/', postController_1.createPost);
router.get('/', postController_1.getPosts);
router.delete('/:id', postController_1.deletePost);
exports.default = router;
