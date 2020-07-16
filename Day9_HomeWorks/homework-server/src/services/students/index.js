const express = require("express");
const fs = require("fs-extra");
const path = require("path");
const uniqid = require("uniqid");
const multer = require("multer");
const q2m = require("query-to-mongo");

const { Op } = require("sequelize");
const Student = require("../../model/students");
const Project = require("../../model/projects");

const router = express.Router();

const upload = multer();

const usersImagePath = path.join(__dirname, "../../public/img/users");

router.get("/", async (req, res, next) => {
  try {
    const limit = req.query.limit || 10;
    const offset = req.query.offset || 0;
    const order = req.query.order || "asc";

    delete req.query.limit;
    delete req.query.offset;
    delete req.query.order;
    await Student.findAndCountAll({
      where: {
        ...req.query,
      },
      offset: offset,
      limit: limit,
      include: Project,
    }).then((result) => {
      if (result.count === 0) res.status(404).send("not found!");
      else
        res.send({
          nrOfStudents: result.count,
          students: result.rows,
        });
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const student = await Student.findOne({
      where: {
        studentid: req.params.id,
      },
      include: Project,
    });

    if (student) res.send(student);
    else res.status(404).send("Not found");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/:id/getPhoto", (req, res, next) => {
  try {
    if (fs.existsSync(path.join(usersImagePath, `${req.params.id}.png`))) {
      const source = fs.createReadStream(
        path.join(usersImagePath, `${req.params.id}.png`)
      );
      source.pipe(res);
    } else {
      const err = new Error();
      err.httpStatusCode = 404;
      err.message = "Not found!";
      next(err);
    }
  } catch (error) {
    next(error);
  }
});
router.get("/:id/download", (req, res, next) => {
  if (fs.existsSync(path.join(usersImagePath, `${req.params.id}.png`))) {
    const source = fs.createReadStream(
      path.join(usersImagePath, `${req.params.id}.png`)
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${req.params.id}.png`
    );
    source.pipe(res);
  } else {
    const err = new Error();
    err.httpStatusCode = 404;
    err.message = "Not Found";
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const student = await Student.create({ studentid: uniqid(), ...req.body });
    res.send(student);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/:id/uploadPhoto",
  upload.single("profile"),
  async (req, res, next) => {
    try {
      if (req.file) {
        await fs.writeFile(
          path.join(usersImagePath, `${req.params.id}.png`),
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

router.post("/checkEmail", async (req, res, next) => {
  try {
    const checkEmail = await Student.findOne({
      where: {
        [Op.and]: [
          {
            email: {
              [Op.eq]: `${req.body.email}`,
            },
            studentid: {
              [Op.ne]: `${req.body.studentid}`,
            },
          },
        ],
      },
    });

    console.log(checkEmail);
    if (checkEmail === null) res.status(200).send(true);
    else res.status(400).send(false);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const student = await Student.update(
      {
        ...req.body,
      },
      {
        where: { studentid: req.params.id },
      }
    );

    if (student[0] === 1) res.send("OK");
    else res.status(404).send("Not found");
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const result = await Student.destroy({
      where: {
        studentid: req.params.id,
      },
    });

    if (result === 1) res.send("DELETED");
    else res.status(404).send("Not Found");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
