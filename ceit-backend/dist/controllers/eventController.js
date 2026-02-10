"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEvent = exports.updateEvent = exports.getEventById = exports.getEvents = exports.createEvent = void 0;
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
// Create a new event
const createEvent = async (req, res) => {
    try {
        const { title, description, eventDate, endDate, location } = req.body;
        const { userId, departmentId } = req.user;
        if (!title || !eventDate) {
            return res.status(400).json({ error: 'Title and event date are required' });
        }
        const [newEvent] = await db_1.db.insert(schema_1.events).values({
            title,
            description,
            eventDate: new Date(eventDate),
            endDate: endDate ? new Date(endDate) : null,
            location,
            adminId: userId,
            departmentId: departmentId,
        }).returning();
        res.status(201).json(newEvent);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createEvent = createEvent;
// Get all events (for authenticated admins)
const getEvents = async (req, res) => {
    try {
        const { departmentId } = req.user;
        const { startDate, endDate, allDepartments } = req.query;
        let query = db_1.db
            .select({
            id: schema_1.events.id,
            title: schema_1.events.title,
            description: schema_1.events.description,
            eventDate: schema_1.events.eventDate,
            endDate: schema_1.events.endDate,
            location: schema_1.events.location,
            createdAt: schema_1.events.createdAt,
            adminName: schema_1.users.name,
            departmentName: schema_1.departments.name,
            departmentId: schema_1.events.departmentId,
        })
            .from(schema_1.events)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.events.adminId, schema_1.users.id))
            .leftJoin(schema_1.departments, (0, drizzle_orm_1.eq)(schema_1.events.departmentId, schema_1.departments.id))
            .orderBy(schema_1.events.eventDate);
        // Build where conditions
        const conditions = [];
        // Filter by department unless allDepartments is specified
        if (!allDepartments || allDepartments === 'false') {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.events.departmentId, departmentId));
        }
        // Filter by date range if provided
        if (startDate) {
            conditions.push((0, drizzle_orm_1.gte)(schema_1.events.eventDate, new Date(startDate)));
        }
        if (endDate) {
            conditions.push((0, drizzle_orm_1.lte)(schema_1.events.eventDate, new Date(endDate)));
        }
        if (conditions.length > 0) {
            const allEvents = await query.where((0, drizzle_orm_1.and)(...conditions));
            return res.json(allEvents);
        }
        const allEvents = await query;
        res.json(allEvents);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getEvents = getEvents;
// Get a single event by ID
const getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const [event] = await db_1.db
            .select({
            id: schema_1.events.id,
            title: schema_1.events.title,
            description: schema_1.events.description,
            eventDate: schema_1.events.eventDate,
            endDate: schema_1.events.endDate,
            location: schema_1.events.location,
            createdAt: schema_1.events.createdAt,
            adminName: schema_1.users.name,
            departmentName: schema_1.departments.name,
            departmentId: schema_1.events.departmentId,
        })
            .from(schema_1.events)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.events.adminId, schema_1.users.id))
            .leftJoin(schema_1.departments, (0, drizzle_orm_1.eq)(schema_1.events.departmentId, schema_1.departments.id))
            .where((0, drizzle_orm_1.eq)(schema_1.events.id, id));
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json(event);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getEventById = getEventById;
// Update an event
const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, eventDate, endDate, location } = req.body;
        const { userId, departmentId } = req.user;
        // Ensure the event belongs to the admin's department
        const [existingEvent] = await db_1.db
            .select()
            .from(schema_1.events)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.events.id, id), (0, drizzle_orm_1.eq)(schema_1.events.departmentId, departmentId)));
        if (!existingEvent) {
            return res.status(404).json({ error: 'Event not found or unauthorized' });
        }
        const updateData = {};
        if (title)
            updateData.title = title;
        if (description !== undefined)
            updateData.description = description;
        if (eventDate)
            updateData.eventDate = new Date(eventDate);
        if (endDate !== undefined)
            updateData.endDate = endDate ? new Date(endDate) : null;
        if (location !== undefined)
            updateData.location = location;
        const [updatedEvent] = await db_1.db
            .update(schema_1.events)
            .set(updateData)
            .where((0, drizzle_orm_1.eq)(schema_1.events.id, id))
            .returning();
        res.json(updatedEvent);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateEvent = updateEvent;
// Delete an event
const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { departmentId } = req.user;
        // Ensure the event belongs to the admin's department
        const [event] = await db_1.db
            .select()
            .from(schema_1.events)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.events.id, id), (0, drizzle_orm_1.eq)(schema_1.events.departmentId, departmentId)));
        if (!event) {
            return res.status(404).json({ error: 'Event not found or unauthorized' });
        }
        await db_1.db.delete(schema_1.events).where((0, drizzle_orm_1.eq)(schema_1.events.id, id));
        res.json({ message: 'Event deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteEvent = deleteEvent;
