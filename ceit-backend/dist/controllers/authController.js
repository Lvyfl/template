"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const register = async (req, res) => {
    try {
        const { name, email, password, departmentName } = req.body;
        // Find department by department name
        const [department] = await db_1.db.select().from(schema_1.departments).where((0, drizzle_orm_1.eq)(schema_1.departments.name, departmentName));
        if (!department) {
            return res.status(400).json({ error: 'Invalid department' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const [newUser] = await db_1.db.insert(schema_1.users).values({
            name,
            email,
            password: hashedPassword,
            departmentId: department.id,
        }).returning();
        res.status(201).json({ message: 'Admin registered successfully', user: { id: newUser.id, name: newUser.name, email: newUser.email, departmentId: newUser.departmentId } });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const [user] = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email));
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, departmentId: user.departmentId, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, name: user.name, departmentId: user.departmentId } });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.login = login;
