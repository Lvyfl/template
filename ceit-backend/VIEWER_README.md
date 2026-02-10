# CEIT Posts Viewer

## Overview
A public, read-only webpage that displays all posts uploaded by administrators. No authentication required for viewing.

## Features
- ✅ View all posts from all departments
- 🔍 Filter posts by department
- 🔄 Auto-refresh every 30 seconds
- 📱 Responsive design (mobile-friendly)
- 🎨 Modern, clean UI with gradient background
- ⏰ Relative time display (e.g., "2h ago", "Yesterday")
- 🖼️ Image display support

## Accessing the Viewer

### Option 1: Via the Backend Server
1. Start the backend server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000/viewer.html
   ```

### Option 2: Open HTML Directly
Simply open the `public/viewer.html` file in any web browser. Make sure to update the `API_URL` in the script if your backend is running on a different URL.

## API Endpoint

The viewer uses the public endpoint:
- **GET** `/posts/public` - Fetch all posts (no authentication required)
- **GET** `/posts/public?departmentId=<id>` - Filter by department

## Features Breakdown

### 1. Post Display
Each post card shows:
- Admin name
- Department name
- Post caption/content
- Image (if available)
- Time posted (relative format)

### 2. Department Filter
- Dropdown menu to filter posts by department
- "All Departments" option to show everything
- Automatically populated from available posts

### 3. Auto-Refresh
- Posts refresh automatically every 30 seconds
- Manual refresh button available

### 4. Responsive Design
- Adapts to different screen sizes
- Grid layout on desktop
- Single column on mobile

## Customization

You can customize the viewer by editing `public/viewer.html`:

### Change API URL
```javascript
const API_URL = 'http://your-server:port/posts/public';
```

### Change Auto-Refresh Interval
```javascript
// Change 30000 (30 seconds) to your desired interval in milliseconds
setInterval(loadPosts, 30000);
```

### Customize Colors
Edit the CSS variables in the `<style>` section:
- Background gradient colors
- Card hover effects
- Text colors
- Department badge colors

## Notes
- The viewer is completely public - no login required
- Posts are fetched directly from the database via the API
- Images are loaded from the URLs stored in the database
- Invalid image URLs are automatically hidden
