// IMPORT MODULES

const path = require("path");
const crypto = require("crypto");

const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");

const db = require("./db");

const app = express();

// MIDDLEWARES

const publicRoot = path.join(__dirname, "../frontend");
app.use(express.static(publicRoot));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer().none());

// VIEW PAGES

app.get("/", (req, res) => {
  res.sendFile("index.html");
});

app.get("/production", (req, res) => {
  res.sendFile("pages/view/production.html", {
    root: publicRoot,
  });
});

app.get("/movie", (req, res) => {
  res.sendFile("pages/view/movie.html", {
    root: publicRoot,
  });
});

app.get("/director", (req, res) => {
  res.sendFile("pages/view/director.html", {
    root: publicRoot,
  });
});

app.get("/actor", (req, res) => {
  res.sendFile("pages/view/actor.html", {
    root: publicRoot,
  });
});

// FORMS PAGES

app.get("/production/insert", (req, res) => {
  res.sendFile("pages/forms/production.html", {
    root: publicRoot,
  });
});

app.get("/movie/insert", (req, res) => {
  res.sendFile("pages/forms/movie.html", {
    root: publicRoot,
  });
});

app.get("/director/insert", (req, res) => {
  res.sendFile("pages/forms/director.html", {
    root: publicRoot,
  });
});

app.get("/actor/insert", (req, res) => {
  res.sendFile("pages/forms/actor.html", {
    root: publicRoot,
  });
});

// GET DATA

app.get("/production/details", (req, res) => {
  const sqlGetProd = "select * from production_company";
  db.query(sqlGetProd, (err, result) => {
    if (err) {
      return res.sendStatus(400);
    }

    res.json(result);
  });
});

app.get("/movie/details", (req, res) => {
  const sqlGetMovie =
    "select m_id, title, release_yr as year, plot_outline as plot, length, name as production from movie m join production_company p on m.p_id=p.p_id";
  db.query(sqlGetMovie, (err, result) => {
    if (err) {
      return res.sendStatus(400);
    }

    res.json(result);
  });
});

app.get("/director/details", (req, res) => {
  const sqlGetDirector = "select * from director";
  db.query(sqlGetDirector, (err, result) => {
    if (err) {
      return res.sendStatus(400);
    }

    res.json(result);
  });
});

app.get("/actor/details", (req, res) => {
  const sqlGetActor = "select * from only_actor";
  db.query(sqlGetActor, (err, result) => {
    if (err) {
      return res.sendStatus(400);
    }

    res.json(result);
  });
});

// GET MISCELLANEOUS DATA

app.get("/genre/:id", (req, res) => {
  const sqlGetGenre = "select genre from genre where m_id=?";
  db.query(sqlGetGenre, [req.params.id], (err, result) => {
    if (err) {
      return res.sendStatus(400);
    }
    res.json(result);
  });
});

app.get("/directs/:id", (req, res) => {
  const sqlGetDirected =
    "select title from directs natural join movie where d_id=?";
  db.query(sqlGetDirected, [req.params.id], (err, result) => {
    if (err) {
      return res.sendStatus(400);
    }
    res.json(result);
  });
});

app.get("/appearance/:id", (req, res) => {
  const sqlGetAppearance =
    "select title, role from appears join movie on appears.m_id=movie.m_id where act_id=?";
  db.query(sqlGetAppearance, [req.params.id], (err, result) => {
    if (err) {
      return res.sendStatus(400);
    }
    res.json(result);
  });
});

app.get("/movie/details/name", (req, res) => {
  const sqlGetMovie = "select m_id, title from movie";
  db.query(sqlGetMovie, (err, result) => {
    if (err) {
      return res.sendStatus(400);
    }

    res.json(result);
  });
});

// INSERT DATA

app.post("/production", (req, res) => {
  const { name, city, state, country } = req.body;
  const id = crypto.randomUUID();

  db.beginTransaction(err => {
    if (err) {
      db.rollback(() => {
        return res.sendStatus(400);
      });
    }

    const sqlInsertProd = "insert into production_company values (?,?,?,?,?)";
    db.query(sqlInsertProd, [id, name, city, state, country], (err, result) => {
      if (err) {
        db.rollback(() => {
          return res.sendStatus(400);
        });
      }

      db.commit(err => {
        if (err) {
          db.rollback(() => {
            return res.sendStatus(400);
          });
        }
      });
    });
  });

  res.sendStatus(201);
});

app.post("/movie", (req, res) => {
  const { title, year, plot, length, production, genre } = req.body;
  const genres = [].concat(genre);

  db.beginTransaction(err => {
    if (err) {
      db.rollback(() => {
        return res.sendStatus(400);
      });
    }

    const mId = crypto.randomUUID();
    const sqlInsertMovie = "insert into movie values(?,?,?,?,?,?)";
    db.query(
      sqlInsertMovie,
      [mId, title, year, plot, length, production],
      (err, result) => {
        if (err) {
          db.rollback(() => {
            return res.sendStatus(400);
          });
        }

        const sqlInsertGenre = "insert into genre values(?,?)";
        genres.forEach(genre => {
          db.query(sqlInsertGenre, [mId, genre], (err, result) => {
            if (err) {
              db.rollback(() => {
                return res.sendStatus(400);
              });
            }
          });
        });

        db.commit(err => {
          if (err) {
            db.rollback(() => {
              return res.sendStatus(400);
            });
          }
        });
      }
    );
  });

  res.sendStatus(201);
});

app.post("/director", (req, res) => {
  const { fname, lname, dob, gender, direct, movie, role, quoteMovie, quote } =
    req.body;

  const directed = [].concat(direct);
  const movies = [].concat(movie);
  const roles = [].concat(role);
  const quoteMovies = [].concat(quoteMovie);
  const quotes = [].concat(quote);

  console.log(directed);

  db.beginTransaction(err => {
    if (err) {
      db.rollback(() => {
        return res.sendStatus(400);
      });
    }

    let actId = null;
    if (movie) {
      actId = crypto.randomUUID();
      const sqlInsertAct = "insert into actor values(?)";
      db.query(sqlInsertAct, [actId], (err, result) => {
        if (err) {
          db.rollback(() => {
            return res.sendStatus(400);
          });
        }
      });
    }

    const dId = crypto.randomUUID();
    const sqlInsertDirector = "insert into director values(?,?,?,?,?,?)";
    db.query(
      sqlInsertDirector,
      [dId, fname, lname, dob, gender, actId],
      (err, result) => {
        if (err) {
          db.rollback(() => {
            return res.sendStatus(400);
          });
        }

        const sqlInsertDirected = "insert into directs values(?,?)";
        directed.forEach(movie => {
          db.query(sqlInsertDirected, [movie, dId], (err, result) => {
            if (err) {
              db.rollback(() => {
                return res.sendStatus(400);
              });
            }
          });
        });

        if (movie) {
          const sqlInsertAppear = "insert into appears values(?,?,?)";
          for (let i = 0; i < movies.length; i++) {
            const mId = movies[i];
            const movieRole = roles[i];

            db.query(
              sqlInsertAppear,
              [actId, mId, movieRole],
              (err, result) => {
                if (err) {
                  db.rollback(() => {
                    return res.sendStatus(400);
                  });
                }
              }
            );
          }

          const sqlInsertQuotes = "insert into speaks_quote values(?,?,?)";
          for (let i = 0; i < quoteMovies.length; i++) {
            const mId = quoteMovies[i];
            const movieQuote = quotes[i];

            db.query(
              sqlInsertQuotes,
              [mId, actId, movieQuote],
              (err, result) => {
                if (err) {
                  db.rollback(() => {
                    return res.sendStatus(400);
                  });
                }
              }
            );
          }
        }

        db.commit(err => {
          if (err) {
            db.rollback(() => {
              return res.sendStatus(400);
            });
          }
        });
      }
    );
  });

  res.sendStatus(201);
});

app.post("/actor", (req, res) => {
  const { fname, lname, dob, gender, movie, role, quoteMovie, quote } =
    req.body;

  const movies = [].concat(movie);
  const roles = [].concat(role);
  const quoteMovies = [].concat(quoteMovie);
  const quotes = [].concat(quote);

  db.beginTransaction(err => {
    if (err) {
      db.rollback(() => {
        return res.sendStatus(400);
      });
    }

    const actId = crypto.randomUUID();
    const sqlInsertAct = "insert into actor values(?)";
    db.query(sqlInsertAct, [actId], (err, result) => {
      if (err) {
        db.rollback(() => {
          return res.sendStatus(400);
        });
      }

      const aId = crypto.randomUUID();
      const sqlInsertActor = "insert into only_actor values(?,?,?,?,?,?)";
      db.query(
        sqlInsertActor,
        [aId, fname, lname, dob, gender, actId],
        (err, result) => {
          if (err) {
            db.rollback(() => {
              return res.sendStatus(400);
            });
          }

          const sqlInsertAppear = "insert into appears values(?,?,?)";
          for (let i = 0; i < movies.length; i++) {
            const mId = movies[i];
            const movieRole = roles[i];

            db.query(
              sqlInsertAppear,
              [actId, mId, movieRole],
              (err, result) => {
                if (err) {
                  db.rollback(() => {
                    return res.sendStatus(400);
                  });
                }
              }
            );
          }

          const sqlInsertQuotes = "insert into speaks_quote values(?,?,?)";
          for (let i = 0; i < quoteMovies.length; i++) {
            const mId = quoteMovies[i];
            const movieQuote = quotes[i];

            db.query(
              sqlInsertQuotes,
              [mId, actId, movieQuote],
              (err, result) => {
                if (err) {
                  db.rollback(() => {
                    return res.sendStatus(400);
                  });
                }
              }
            );
          }

          db.commit(err => {
            if (err) {
              db.rollback(() => {
                return res.sendStatus(400);
              });
            }
          });
        }
      );
    });
  });

  res.sendStatus(201);
});

// DELETE DATA

app.delete("/production/:id", (req, res) => {
  const id = req.params.id;

  db.beginTransaction(err => {
    if (err) {
      db.rollback(() => {
        return res.sendStatus(400);
      });
    }

    const sqlDeleteProd = "delete from production_company where p_id=?";
    db.query(sqlDeleteProd, [id], (err, result) => {
      if (err) {
        db.rollback(() => {
          return res.sendStatus(400);
        });
      }

      db.commit(err => {
        if (err) {
          db.rollback(() => {
            return res.sendStatus(400);
          });
        }
      });
    });
  });

  res.sendStatus(204);
});

app.delete("/movie/:id", (req, res) => {
  const id = req.params.id;

  db.beginTransaction(err => {
    if (err) {
      db.rollback(() => {
        return res.sendStatus(400);
      });
    }

    const sqlDeleteMovie = "delete from movie where m_id=?";
    db.query(sqlDeleteMovie, [id], (err, result) => {
      if (err) {
        db.rollback(() => {
          return res.sendStatus(400);
        });
      }

      db.commit(err => {
        if (err) {
          db.rollback(() => {
            return res.sendStatus(400);
          });
        }
      });
    });
  });

  res.sendStatus(204);
});

app.delete("/actor/:id", (req, res) => {
  const id = req.params.id;

  db.beginTransaction(err => {
    if (err) {
      db.rollback(() => {
        return res.sendStatus(400);
      });
    }

    const sqlDeleteActor = "delete from actor where act_id=?";
    db.query(sqlDeleteActor, [id], (err, result) => {
      if (err) {
        db.rollback(() => {
          return res.sendStatus(400);
        });
      }

      db.commit(err => {
        if (err) {
          db.rollback(() => {
            return res.sendStatus(400);
          });
        }
      });
    });
  });

  res.sendStatus(204);
});

// ERROR ROUTE
app.get("/error", (req, res) => {
  res.sendFile("pages/error/400.html", {
    root: publicRoot,
  });
});

// START SERVER

const port = 5000;
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
