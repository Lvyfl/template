"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicPosts = exports.deletePost = exports.getPosts = exports.createPost = void 0;
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const createPost = async (req, res) => {
    try {
        const { caption, imageUrl } = req.body;
        const { userId, departmentId } = req.user;
        const [newPost] = await db_1.db.insert(schema_1.posts).values({
            caption,
            imageUrl,
            adminId: userId,
            departmentId: departmentId,
        }).returning();
        res.status(201).json(newPost);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createPost = createPost;
const getPosts = async (req, res) => {
    try {
        const { departmentId } = req.user;
        const departmentPosts = await db_1.db.select()
            .from(schema_1.posts)
            .where((0, drizzle_orm_1.eq)(schema_1.posts.departmentId, departmentId))
            .orderBy(schema_1.posts.createdAt);
        res.json(departmentPosts);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getPosts = getPosts;
const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { departmentId } = req.user;
        // Ensure the post belongs to the admin's department
        const [post] = await db_1.db.select().from(schema_1.posts).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.posts.id, id), (0, drizzle_orm_1.eq)(schema_1.posts.departmentId, departmentId)));
        if (!post) {
            return res.status(404).json({ error: 'Post not found or unauthorized' });
        }
        await db_1.db.delete(schema_1.posts).where((0, drizzle_orm_1.eq)(schema_1.posts.id, id));
        res.json({ message: 'Post deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deletePost = deletePost;
// Public endpoint - no authentication required
const getPublicPosts = async (req, res) => {
    try {
        const { departmentId } = req.query;
        let query = db_1.db
            .select({
            id: schema_1.posts.id,
            caption: schema_1.posts.caption,
            imageUrl: schema_1.posts.imageUrl,
            createdAt: schema_1.posts.createdAt,
            adminName: schema_1.users.name,
            departmentName: schema_1.departments.name,
        })
            .from(schema_1.posts)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.posts.adminId, schema_1.users.id))
            .leftJoin(schema_1.departments, (0, drizzle_orm_1.eq)(schema_1.posts.departmentId, schema_1.departments.id))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.posts.createdAt));
        if (departmentId && typeof departmentId === 'string') {
            const allPosts = await query.where((0, drizzle_orm_1.eq)(schema_1.posts.departmentId, departmentId));
            return res.json(allPosts);
        }
        const allPosts = await query;
        res.json(allPosts);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getPublicPosts = getPublicPosts;
