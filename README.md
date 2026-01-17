# CineShelf – MongoDB Backend API

## Description
CineShelf is a movie library backend built with Node.js, Express, and MongoDB (native driver).

## Technologies
- Node.js
- Express.js
- MongoDB (native driver)

## Database
Database: cineshelf_db  
Collection: movies (auto-created on first insert)

Fields:
- title (string)
- genre (string)
- year (number)
- description (string)

## API Endpoints

GET /api/movies  
GET /api/movies/:id  
POST /api/movies  
PUT /api/movies/:id  
DELETE /api/movies/:id  

Supports:
- Filtering: ?genre=Sci-Fi&year=2010
- Sorting: ?sortBy=year or ?sortBy=-year
- Projection: ?fields=title,year

## Status Codes
200 OK  
201 Created  
400 Bad Request  
404 Not Found  
500 Server Error  

## Run
npm install  
node app.js
