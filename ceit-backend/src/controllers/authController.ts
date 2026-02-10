import { Request, Response } from 'express';
import { db } from '../db';
import { users, departments } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, departmentName } = req.body;

    // Find department by department name
    const [department] = await db.select().from(departments).where(eq(departments.name, departmentName));
    if (!department) {
      return res.status(400).json({ error: 'Invalid department' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      departmentId: department.id,
    }).returning();

    res.status(201).json({ message: 'Admin registered successfully', user: { id: newUser.id, name: newUser.name, email: newUser.email, departmentId: newUser.departmentId } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, departmentId: user.departmentId, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, name: user.name, departmentId: user.departmentId } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
