# Project Name: CineShelf

## Description
CineShelf is a demo movie library project built with Node.js and Express.js.
The goal is to demonstrate server-side routing, middleware, parameters handling,
and form processing without using a real database.

## Technologies
- Node.js
- Express.js
- HTML / CSS

## Project Structure
- server.js – Express server and routes
- views/ – HTML pages
- public/ – CSS and static files
- messages.json – Saved contact form data

## Routes

| Method | Route | Description |
|------|-------|-------------|
| GET | / | Home page |
| GET | /about | Project and team info |
| GET | /movies | Movie list |
| GET | /item/:id | Dynamic item page (placeholder) |
| GET | /search?q= | Search using query parameter |
| GET | /favorites | Favorites page |
| GET | /profile | User profile |
| POST | /contact | Saves contact form data |
| GET | /api/info | Project info in JSON |
| ANY | * | 404 page |

## Middleware
- express.urlencoded()
- Custom logger (HTTP method + URL)

## Validation
Server-side validation is implemented for:
- Missing query parameters
- Empty contact form fields

## Team Members (SE-2426)
- Danelya Bekzhan
- Oryngul Maratova
- Aigerim Kazbek
