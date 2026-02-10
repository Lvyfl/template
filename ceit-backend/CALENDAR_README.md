# CEIT Events & Announcements Calendar

## Overview
A full-featured calendar system for admins to view, create, and manage events and announcements across all departments.

## Features
✅ **Monthly Calendar View** - Visual calendar displaying all events
✅ **Add Events** - Create new events with detailed information
✅ **Department Filtering** - View events from your department or all departments
✅ **Event Details** - Click on any event to view full details
✅ **Date Selection** - Click any day to add an event for that date
✅ **Responsive Design** - Works on desktop and mobile devices
✅ **Authentication** - Secured with JWT authentication

## Accessing the Calendar

### URL
Navigate to: `http://localhost:3000/calendar.html`

**Note**: You must be logged in as an admin to access the calendar. The page will redirect to the login page if no authentication token is found.

## How to Use

### 1. Viewing Calendar
- The calendar displays the current month
- Today's date is highlighted with a blue border
- Events appear as colored blocks on their respective dates
- Use **Previous/Next** buttons to navigate months
- Click **Today** to return to current month

### 2. Adding Events
**Method 1: Using the Add Button**
1. Click the "➕ Add New Event" button
2. Fill in the event details:
   - **Title** (required)
   - **Description** (optional)
   - **Event Date** (required) - Date and time when event starts
   - **End Date** (optional) - For multi-day events
   - **Location** (optional)
3. Click "Create Event"

**Method 2: Clicking a Date**
1. Click on any calendar day
2. The Add Event form opens with that date pre-selected
3. Fill in remaining details and submit

### 3. Viewing Event Details
- Click on any event block in the calendar
- A modal opens showing full event information:
  - Title
  - Department
  - Created by (admin name)
  - Date and time
  - End date (if applicable)
  - Location (if applicable)
  - Description (if applicable)

### 4. Department Filtering
- By default, you see only events from your department
- Check **"Show all departments"** to view events from all departments
- Click **"🔄 Refresh"** to reload the calendar

## API Endpoints

### Events API
All endpoints require authentication (Bearer token in Authorization header).

#### Create Event
```
POST /events
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Event Title",
  "description": "Event description",
  "eventDate": "2026-02-15T14:00:00.000Z",
  "endDate": "2026-02-15T16:00:00.000Z",
  "location": "Main Hall"
}
```

#### Get Events
```
GET /events?startDate=<ISO_DATE>&endDate=<ISO_DATE>&allDepartments=<boolean>
Authorization: Bearer <token>
```

Parameters:
- `startDate`: Filter events from this date onwards
- `endDate`: Filter events up to this date
- `allDepartments`: true to see all departments, false for only your department

#### Get Single Event
```
GET /events/:id
Authorization: Bearer <token>
```

#### Update Event
```
PUT /events/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Updated Title",
  "description": "Updated description",
  // ... other fields
}
```

#### Delete Event
```
DELETE /events/:id
Authorization: Bearer <token>
```

## Database Schema

The events table includes:
- `id` - UUID primary key
- `departmentId` - Reference to department
- `adminId` - Reference to admin who created the event
- `title` - Event title (required)
- `description` - Event description (optional)
- `eventDate` - Start date and time (required)
- `endDate` - End date and time (optional)
- `location` - Event location (optional)
- `createdAt` - Timestamp of creation

## Migration

To apply the database migration for the events table:

```bash
# Generate migration
npx drizzle-kit generate

# Push to database
npx drizzle-kit push
```

## Customization

### Change API URL
Edit the `API_URL` constant in [calendar.html](public/calendar.html):
```javascript
const API_URL = 'http://your-server:port';
```

### Styling
All styles are embedded in the HTML file. Key CSS variables:
- Calendar colors: `#667eea` (primary), `#764ba2` (secondary)
- Event blocks: gradient background
- Today highlight: blue border

### Calendar Layout
The calendar is a 7-column CSS grid (one for each day of the week).
Adjust `min-height` of `.calendar-day` to change cell height.

## Notes

- Events are stored in the database and associated with the admin who created them
- Admins can only edit/delete events from their own department
- The calendar auto-refreshes when month changes
- Event times are displayed in the user's local timezone
- Authentication token is stored in localStorage
- If session expires, user is redirected to login page

## Future Enhancements

Potential features to add:
- Event editing capability
- Event deletion from the calendar
- Recurring events
- Event reminders/notifications
- Export events to iCal format
- Drag and drop to reschedule events
- Color coding by department
