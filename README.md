# Project topic: Book/Movie Library
# Project name: CineShelf
## Description: 
An application designed to help users organize, track, and explore movies. Users can add, search, and categorize their favorite titles, making it easier to manage personal collections and discover new content
## Team Members
- Akbope Bakytkeldy  
- Danelya Bekzhan  
- Oryngul Maratova
- Aigerim Kazbek
- Group: SE-2426
## Planned Features
- Add, edit, and delete movies in the library  
- Search for titles by name, author/director, or genre  
- Sort and filter items based on categories, ratings, or release year  
- User-friendly interface for easy navigation  
- Favorite or bookmark items for quick access 
- Recommendations based on user preferences
## Routing Table

| Method | Route | Description |
| :--- | :--- | :--- |
| **GET** | `/` | Home page with project introduction. |
| **GET** | `/movies` | Displays the full library of movies. |
| **GET** | `/movie/:id` | Dynamic route for specific movie details. |
| **GET** | `/about` | Information about the team and project goals. |
| **GET** | `/contact` | Page containing the contact form. |
| **POST** | `/contact` | Handles form submission and data processing. |
| **GET** | `/favorites` | Displays movies bookmarked by the user. |
| **GET** | `/profile` | User account and membership overview. |
| **GET** | `/message` | Success page shown after a form is submitted. |
| **ANY** | `*` | Custom 404 Error Page for undefined routes. |
## Contact Form & Backend Logic
- Form Details
- The contact form is built to capture user feedback and includes:
- Name: input type="text"
- Email: input type="email"
- Message: textarea
## Project Structure
- server.js – Main entry point and Express configuration.
- views/ – Contains all HTML pages (Home, About, Contact, Movies, etc.).
- public/ – Contains static assets like style.css and the 404.html page.
- messages.json – Local database for storing contact form submissions.
