const express = require("express");
const fs = require("fs-extra");
const path = require("path");
const uniqid = require("uniqid");
const multer = require("multer");
const q2m = require("query-to-mongo");

const { Op, QueryTypes, Sequelize } = require("sequelize");
const Student = require("../../model/students");
const Project = require("../../model/projects");

const sequelize = require("../../db");

const router = express.Router();

const upload = multer();

const usersImagePath = path.join(__dirname, "../../public/img/users");

router.get("/", async (req, res, next) => {
  try {
    const students = await Student.findAll({
      include: Project,
    });
    res.send(students);
  } catch (error) {
    next(error);
  }
});

router.get("/:id/projects", async (req, res, next) => {
  try {
    const projects = await db.query(
      `SELECT * FROM projects
    WHERE studentid = '${req.params.id}'`
    );
    res.send(projects.rows);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const student = await db.query(
      "SELECT * FROM students WHERE studentid = $1",
      [req.params.id]
    );
    if (student.rowCount === 0) return res.status(404).send("Not Found!");
    res.status(200).send(student.rows[0]);
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
    const addStudent = await db.query(
      `INSERT INTO students (studentid,name,surname,email,birthday)
      Values ($1,$2,$3,$4,$5)
      RETURNING *
      `,
      [
        uniqid(),
        req.body.name,
        req.body.surname,
        req.body.email,
        req.body.birthday,
      ]
    );
    res.status(201).send(addStudent.rows[0]);
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
    const checkEmail = await db.query(
      `SELECT * FROM students WHERE email ='${req.body.email}' AND studentid != '${req.body.studentid}'`
    );
    if (checkEmail.rowCount === 0) {
      res.status(200).send(true);
    } else {
      res.status(400).send(false);
    }
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    let params = [];
    let query = "UPDATE students SET";
    for (bodyElement in req.body) {
      query += `${params.length > 0 ? "," : ""} "${bodyElement}"= $${
        params.length + 1
      }`;
      params.push(req.body[bodyElement]);
    }
    params.push(req.params.id);
    query += ` WHERE studentid = $${params.length}
    RETURNING *
    `;
    const editStudent = await db.query(query, params);
    if (editStudent.rowCount === 0) {
      res.status(404).send("Not Found");
    } else {
      res.status(200).send(editStudent.rows[0].StudentID);
    }
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const deletedStudent = await db.query(
      `DELETE FROM students WHERE studentid = '${req.params.id}'`
    );
    if (deletedStudent.rowCount === 0) {
      res.status(404).send("Not Found");
    } else {
      res.status(200).send("Deleted");
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
