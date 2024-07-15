const path = require("path");
const crypto = require("crypto");

const express = require("express");
const bodyParser = require("body-parser");

const db = require("./db");

const app = express();

// MIDDLEWARES

const publicRoot = path.join(__dirname, "../frontend");
app.use(express.static(publicRoot));

app.use(bodyParser.urlencoded({ extended: true }));

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
      throw err;
    }

    res.json(result);
  });
});

app.get("/movie/details", (req, res) => {
  const sqlGetProd =
    "select m_id, title, release_yr as year, plot_outline as plot, length, name as production from movie natural join production_company";
  db.query(sqlGetProd, (err, result) => {
    if (err) {
      throw err;
    }

    res.json(result);
  });
});

app.get("/director/details", (req, res) => {
  const sqlGetDirector = "select * from director";
  db.query(sqlGetDirector, (err, result) => {
    if (err) {
      throw err;
    }

    res.json(result);
  });
});

app.get("/actor/details", (req, res) => {
  const sqlGetActor = "select * from only_actor";
  db.query(sqlGetActor, (err, result) => {
    if (err) {
      throw err;
    }

    res.json(result);
  });
});

// GET MISCELLANEOUS DATA

app.get("/genre/:id", (req, res) => {
  const sqlGetGenre = "select genre from genre where m_id=?";
  db.query(sqlGetGenre, [req.params.id], (err, result) => {
    if (err) {
      throw err;
    }
    res.json(result);
  });
});

app.get("/directs/:id", (req, res) => {
  const sqlGetDirected =
    "select title from directs natural join movie where d_id=?";
  db.query(sqlGetDirected, [req.params.id], (err, result) => {
    if (err) {
      throw err;
    }
    res.json(result);
  });
});

app.get("/appearance/:id", (req, res) => {
  const sqlGetAppearance =
    "select title, role from appears natural join movie where act_id=?";
  db.query(sqlGetAppearance, [req.params.id], (err, result) => {
    if (err) {
      throw err;
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
      return db.rollback(() => {
        return res.redirect("/pages/error/400.html");
      });
    }

    const sqlInsertProd = "insert into production_company values (?,?,?,?,?)";
    db.query(sqlInsertProd, [id, name, city, state, country], (err, result) => {
      if (err) {
        db.rollback(() => {
          return res.redirect("/pages/error/400.html");
        });
      }
    });
  });

  res.redirect("/production");
});

app.post("/movie", (req, res) => {
  res.redirect("/movie");
});

// DELETE DATA

app.get("/production/delete/:id", (req, res) => {
  const id = req.params.id;

  db.beginTransaction(err => {
    if (err) {
      db.rollback(() => {
        return res.redirect("/pages/error/400.html");
      });
    }

    const sqlDeleteProd = "delete from production_company where p_id=?";
    db.query(sqlDeleteProd, [id], (err, result) => {
      if (err) {
        db.rollback(() => {
          return res.redirect("/pages/error/400.html");
        });
      }
    });
  });

  res.redirect("/production");
});

// START SERVER

const port = 5000;
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
