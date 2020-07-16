const express = require("express");
const fs = require("fs-extra");
const path = require("path");
const uniqid = require("uniqid");
const multer = require("multer");

const router = express.Router();
const upload = multer();

const { Op } = require("sequelize");
const Project = require("../../model/projects");

const reviewsFilePath = path.join(__dirname, "reviews.json");
const projectsImagePath = path.join(__dirname, "../../public/img/projects");

const getReviews = () => {
  const reviewsAsBuffer = fs.readFileSync(reviewsFilePath);
  const reviews = JSON.parse(reviewsAsBuffer.toString());
  return reviews;
};

router.get("/", async (req, res, next) => {
  try {
    const projects = await Project.findAll();
    res.send(projects);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const project = await Project.findOne({
      where: {
        projectid: req.params.id,
      },
    });

    if (project) res.send(project);
    else res.status(404).send("Not found");
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
    const project = await Project.create({ projectid: uniqid(), ...req.body });
    res.send(project);
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
    const project = await Project.update(
      {
        ...req.body,
      },
      {
        where: { projectid: req.params.id },
      }
    );

    if (project[0] === 1) res.send("OK");
    else res.status(404).send("Not found");
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const result = await Project.destroy({
      where: {
        projectid: req.params.id,
      },
    });

    if (result === 1) res.send("DELETED");
    else res.status(404).send("Not Found");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
