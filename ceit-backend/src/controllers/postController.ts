import { Request, Response } from 'express';
import { db } from '../db';
import { posts, users, departments } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';

export const createPost = async (req: any, res: Response) => {
  try {
    const { caption, imageUrl } = req.body;
    const { userId, departmentId } = req.user;

    const [newPost] = await db.insert(posts).values({
      caption,
      imageUrl,
      adminId: userId,
      departmentId: departmentId,
    }).returning();

    res.status(201).json(newPost);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPosts = async (req: any, res: Response) => {
  try {
    const { departmentId } = req.user;

    const departmentPosts = await db.select()
      .from(posts)
      .where(eq(posts.departmentId, departmentId))
      .orderBy(posts.createdAt);

    res.json(departmentPosts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePost = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { caption, imageUrl } = req.body;
    const { userId, departmentId } = req.user;

    // Ensure the post belongs to the admin who created it
    const [post] = await db.select().from(posts).where(and(
      eq(posts.id, id),
      eq(posts.adminId, userId),
      eq(posts.departmentId, departmentId)
    ));
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found or unauthorized' });
    }

    const [updatedPost] = await db.update(posts)
      .set({ caption, imageUrl })
      .where(eq(posts.id, id))
      .returning();

    res.json(updatedPost);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deletePost = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { departmentId } = req.user;

    // Ensure the post belongs to the admin's department
    const [post] = await db.select().from(posts).where(and(eq(posts.id, id), eq(posts.departmentId, departmentId)));
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found or unauthorized' });
    }

    await db.delete(posts).where(eq(posts.id, id));

    res.json({ message: 'Post deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Public endpoint - no authentication required
export const getPublicPosts = async (req: Request, res: Response) => {
  try {
    const { departmentId } = req.query;

    let query = db
      .select({
        id: posts.id,
        caption: posts.caption,
        imageUrl: posts.imageUrl,
        createdAt: posts.createdAt,
        adminName: users.name,
        departmentName: departments.name,
      })
      .from(posts)
      .leftJoin(users, eq(posts.adminId, users.id))
      .leftJoin(departments, eq(posts.departmentId, departments.id))
      .orderBy(desc(posts.createdAt));

    if (departmentId && typeof departmentId === 'string') {
      const allPosts = await query.where(eq(posts.departmentId, departmentId));
      return res.json(allPosts);
    }

    const allPosts = await query;
    res.json(allPosts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
