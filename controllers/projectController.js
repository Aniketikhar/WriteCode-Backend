const projectModel = require("../models/projectModel");
const userModel = require("../models/userModel");

const createProject = async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.user ? req.user.userId : req.body.userId;

    if (!title) {
      return res.status(400).json({ success: false, message: "Project title is required" });
    }
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found!" });
    }

    const project = await projectModel.create({
      title: title,
      createdBy: userId
    });

    return res.status(201).json({ success: true, message: "Project created successfully", projectId: project._id });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error during project creation", error: error.message });
  }
};

const getProjects = async (req, res) => {
  try {
    const userId = req.user ? req.user.userId : req.body.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const projects = await projectModel.find({ createdBy: userId });
    return res.status(200).json({ success: true, message: "Projects fetched successfully", projects });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error fetching projects", error: error.message });
  }
};

const getProject = async (req, res) => {
  try {
    const { projId } = req.body;
    const userId = req.user ? req.user.userId : req.body.userId;

    if (!projId) {
      return res.status(400).json({ success: false, message: "Project ID is required" });
    }

    const project = await projectModel.findOne({ _id: projId, createdBy: userId });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found or unauthorized" });
    }

    return res.status(200).json({ success: true, message: "Project fetched successfully", project });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error fetching project", error: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const { projId, htmlCode, cssCode, jsCode } = req.body;
    const userId = req.user ? req.user.userId : req.body.userId;

    if (!projId) {
      return res.status(400).json({ success: false, message: "Project ID is required" });
    }

    const project = await projectModel.findOneAndUpdate(
      { _id: projId, createdBy: userId },
      { htmlCode, cssCode, jsCode },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found or unauthorized" });
    }

    return res.status(200).json({ success: true, message: "Project updated successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error updating project", error: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const projId = req.body.progId || req.body.projId;
    const userId = req.user ? req.user.userId : req.body.userId;

    if (!projId) {
      return res.status(400).json({ success: false, message: "Project ID is required" });
    }

    const project = await projectModel.findOneAndDelete({ _id: projId, createdBy: userId });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found or unauthorized" });
    }

    return res.status(200).json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error deleting project", error: error.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject
};
