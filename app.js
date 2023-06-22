const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;
const initializeServerAndDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Started ...");
    });
  } catch (error) {
    console.log(`Server get An Error ${error}`);
    process.exit(1);
  }
};

initializeServerAndDb();

//Get All Movie Name API.>>>

app.get("/movies/", async (request, response) => {
  const allMovieListQuery = `
        SELECT *
        FROM movie;
    `;
  const convertToDbObjectToList = (eachObj) => {
    return {
      movieName: eachObj.movie_name,
    };
  };
  const dbObject = await db.all(allMovieListQuery);
  response.send(dbObject.map((eachObj) => convertToDbObjectToList(eachObj)));
});

// Create A New Movie API.>>>

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;

  const { directorId, movieName, leadActor } = movieDetails;

  const addMovieQuery = `
        INSERT INTO 
            movie (director_id,
                    movie_name,
                    lead_actor)
        VALUES (
            '${directorId}',
            '${movieName}',
            '${leadActor}'
        );
    `;
  const movieAdded = await db.run(addMovieQuery);
  console.log(movieAdded);
});
