# Anime Story Web

A simple browser-based story website with an **Admin Panel**, **Chapter System**, and **User Features**.  
All data is stored locally in your browser using `localStorage`.

---

## Features

### ✅ User Side
- View stories with multiple chapters
- Chapter navigation (Next / Previous)
- Rating system (1–5 stars)
- Comment system
- Theme support (Light / Dark)
- Custom italic system:  
  Use `*text*` to display *italic text*

---

### ✅ Admin Panel
- Secure login system
- Create, edit, and delete stories
- Add unlimited chapters to each story
- Reorder chapters (move up/down)
- Edit chapter title and content
- Export and import stories as JSON

---

## Default Admin Login

```
Username: ROHAN
Password: 1234567890
```

---

## How to Use

### 1. Open Admin Panel
Open:
```
admin.html
```

Login using the default credentials.

---

### 2. Create a Story
- Enter title and tags
- Write chapter content
- Click **Add Story**

---

### 3. Add Chapters
- Select a story by clicking **Edit**
- Use the **Chapters** section to add new chapters
- Use:
  - **Edit** → Modify chapter
  - **↑ / ↓** → Reorder chapters
  - **Delete** → Remove chapters

---

### 4. Read Stories
Open:
```
story.html?id=STORY_ID&ch=0
```

Or simply open:
```
story.html
```
to load the first story.

---

## Custom Text Formatting

You can use:

```
*italic text*
```

Example:
```
This is *important* text
```

Will display as:
*important* text

---

## File Structure

```
/project-folder
│
├── admin.html
├── profile.html
├── story.html
├── styles.css
├── stories.js
├── script.js
├── script_admin.js
└── README.md
```

---

## Storage Info

This project uses:

- `localStorage` → stores stories, users, chapters, theme
- `sessionStorage` → stores login sessions

No server or database is required.

---

## Notes

- Works fully offline after first load
- Best used in modern browsers (Chrome, Edge, Firefox)
- No frameworks required

---

## License

Free to use and modify for personal projects.
