const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();

app.use(express.json());

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
        SELECT movie_name
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
            movie (director_id,movie_name,lead_actor)
        VALUES (
            '${directorId}',
            '${movieName}',
            '${leadActor}'
        );
    `;
  const movieAdded = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

// Get a Movie Details API.>>>

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const idBasedMovieQuery = `
        SELECT *
        FROM movie
        WHERE movie_id = ${movieId};
    `;

  const dbResponse = await db.get(idBasedMovieQuery);
  response.send({
    movieId: dbResponse.movie_id,
    directorId: dbResponse.director_id,
    movieName: dbResponse.movie_name,
    leadActor: dbResponse.lead_actor,
  });
});

// Update Movie Details API.>>>

app.put("/movies/:movieId/", (request, response) => {
  const movieDetails = request.body;
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = movieDetails;

  const updateMovieQuery = `
        UPDATE movie
        SET
           director_id = ${directorId},
           movie_name = '${movieName}',
           lead_actor = '${leadActor}'

        WHERE movie_id = ${movieId};
    `;

  const dbResponse = db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//Delete A Movie Details API.>>>

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
        DELETE 
        FROM movie
        WHERE movie_id = ${movieId};
    `;
  const dbResponse = await db.run(deleteQuery);
  response.send("Movie Removed");
});

// List of Director API.>>>

app.get("/directors/", async (request, response) => {
  const directorsQuery = `
        SELECT 
            *
        FROM director;
    `;
  const dbObject = await db.all(directorsQuery);
  const convertToDbObjectToList = (eachDirector) => {
    return {
      directorId: eachDirector.director_id,
      directorName: eachDirector.director_name,
    };
  };
  response.send(
    dbObject.map((eachDirector) => convertToDbObjectToList(eachDirector))
  );
});

//Specific Direction movies API.>>>

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;

  const Query = `
        SELECT *
        FROM movie
        WHERE director_id = ${directorId};
    `;

  const dbResponse = await db.all(Query);
  response.send(
    dbResponse.map((eachDirector) => ({ movieName: eachDirector.movie_name }))
  );
});

module.exports = app;
