const express = require("express");
const router = express.Router();
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject
} = require("../controllers/projectController");
const authMiddleware = require("../middleware/auth");

router.use(authMiddleware);

router.post("/create", createProject);
router.post("/all", getProjects);
router.post("/get", getProject);
router.post("/update", updateProject);
router.post("/delete", deleteProject);

module.exports = router;
