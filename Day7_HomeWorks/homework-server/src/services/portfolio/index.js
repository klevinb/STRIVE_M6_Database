const express = require("express");
const fs = require("fs-extra");
const path = require("path");
const uniqid = require("uniqid");
const multer = require("multer");
const q2m = require("query-to-mongo");
const db = require("../../db");

const router = express.Router();
const upload = multer();

const reviewsFilePath = path.join(__dirname, "reviews.json");
const projectsImagePath = path.join(__dirname, "../../public/img/projects");

const getReviews = () => {
  const reviewsAsBuffer = fs.readFileSync(reviewsFilePath);
  const reviews = JSON.parse(reviewsAsBuffer.toString());
  return reviews;
};

router.get("/", async (req, res, next) => {
  try {
    const query = "SELECT * FROM projects";
    const projects = await db.query(query);
    res.send(projects.rows);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const project = await db.query(
      "SELECT * FROM projects WHERE projectid = $1",
      [req.params.id]
    );
    if (project.rowCount === 0) return res.status(404).send("Not Found!");
    res.status(200).send(project.rows[0]);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/:id/getPhoto", (req, res, next) => {
  try {
    if (fs.existsSync(path.join(projectsImagePath, `${req.params.id}.png`))) {
      const source = fs.createReadStream(
        path.join(projectsImagePath, `${req.params.id}.png`)
      );
      source.pipe(res);
    } else {
      const error = new Error();
      error.httpStatusCode = 404;
      error.message = "We dont have any image for this project!";
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

router.get("/:id/download", (req, res, next) => {
  console.log();
  if (fs.existsSync(path.join(projectsImagePath, `${req.params.id}.png`))) {
    const source = fs.createReadStream(
      path.join(projectsImagePath, `${req.params.id}.png`)
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${req.params.id}.png`
    );
    source.pipe(res);
  } else {
    const error = new Error();
    error.httpStatusCode = 404;
    error.message = "We dont have any image for this project!";
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const addProject = await db.query(
      `INSERT INTO projects (projectid,name,description,repourl,liveurl,studentid)
      Values ($1,$2,$3,$4,$5,$6)
      RETURNING *
      `,
      [
        uniqid(),
        req.body.name,
        req.body.description,
        req.body.repourl,
        req.body.liveurl,
        req.body.studentid,
      ]
    );
    res.status(201).send(addProject.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.post("/:id/reviews", async (req, res) => {
  const newReview = { ...req.body, projectId: req.params.id, date: new Date() };
  const reviews = getReviews();

  reviews.push(newReview);
  fs.writeFile(reviewsFilePath, JSON.stringify(reviews));
  res.status(201).send(newReview);
});

router.get("/:id/reviews", async (req, res) => {
  const reviews = getReviews();
  const filteredReviews = reviews.filter(
    (review) => review.projectId === req.params.id
  );

  res.status(200).send(filteredReviews);
});

router.post(
  "/:id/uploadPhoto",
  upload.single("project"),
  async (req, res, next) => {
    try {
      if (req.file) {
        await fs.writeFile(
          path.join(projectsImagePath, `${req.params.id}.png`),
          req.file.buffer
        );
        res.status(201).send("OK");
      } else {
        const err = new Error();
        err.httpStatusCode = 404;
        err.message = "Not found";
        next(err);
      }
    } catch (error) {
      next(error);
    }
  }
);

router.put("/:id", async (req, res, next) => {
  try {
    let params = [];
    let query = "UPDATE projects SET";
    for (bodyElement in req.body) {
      query += `${params.length > 0 ? "," : ""} "${bodyElement}"= $${
        params.length + 1
      }`;
      params.push(req.body[bodyElement]);
    }
    params.push(req.params.id);
    query += ` WHERE projectid = $${params.length}
    RETURNING *
    `;
    console.log(query);
    const editProject = await db.query(query, params);
    if (editProject.rowCount === 0) {
      res.status(404).send("Not Found");
    } else {
      res.status(200).send(editProject.rows[0]);
    }
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const deletedStudent = await db.query(
      `DELETE FROM projects WHERE projectid = '${req.params.id}'`
    );
    if (deletedStudent.rowCount === 0) return res.status(404).send("Not Found");
    res.status(200).status("Deleted");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
