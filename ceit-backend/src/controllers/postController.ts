import { Request, Response } from 'express';
import { db } from '../db';
import { posts, users, departments } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';

// Helper function to optimize image data for list views
function optimizePostForList(post: any) {
  if (!post.imageUrl || !post.imageUrl.includes('|')) {
    return post;
  }
  
  // For PDF posts with format: pdfBase64|thumbnailBase64
  // Only send thumbnail in list view to reduce payload size
  const [pdfData, thumbnailData] = post.imageUrl.split('|');
  
  // Check if it's a large base64 PDF (starts with data:application/pdf)
  if (pdfData.startsWith('data:application/pdf')) {
    // Replace with placeholder, keep thumbnail
    return {
      ...post,
      imageUrl: `PDF_PLACEHOLDER|${thumbnailData}`,
      hasPdf: true
    };
  }
  
  return post;
}

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
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const departmentPosts = await db.select()
      .from(posts)
      .where(eq(posts.departmentId, departmentId))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    // Optimize posts for list view - strip large PDF data
    const optimizedPosts = departmentPosts.map(optimizePostForList);

    res.json(optimizedPosts);
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

// Get single post with full data (including full PDF base64)
export const getPostById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    
    const [post] = await db
      .select({
        id: posts.id,
        caption: posts.caption,
        imageUrl: posts.imageUrl,
        createdAt: posts.createdAt,
        adminName: users.name,
        departmentName: departments.name,
        departmentId: posts.departmentId,
      })
      .from(posts)
      .leftJoin(users, eq(posts.adminId, users.id))
      .leftJoin(departments, eq(posts.departmentId, departments.id))
      .where(eq(posts.id, id));

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Return full post data without optimization
    res.json(post);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Public endpoint - no authentication required
export const getPublicPosts = async (req: Request, res: Response) => {
  try {
    const { departmentId } = req.query;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    let query = db
      .select({
        id: posts.id,
        caption: posts.caption,
        imageUrl: posts.imageUrl,
        createdAt: posts.createdAt,
        adminName: users.name,
        departmentName: departments.name,
        departmentId: posts.departmentId,
      })
      .from(posts)
      .leftJoin(users, eq(posts.adminId, users.id))
      .leftJoin(departments, eq(posts.departmentId, departments.id))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    if (departmentId && typeof departmentId === 'string') {
      const allPosts = await query.where(eq(posts.departmentId, departmentId));
      const optimized = allPosts.map(optimizePostForList);
      return res.json(optimized);
    }

    const allPosts = await query;
    const optimized = allPosts.map(optimizePostForList);
    res.json(optimized);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
