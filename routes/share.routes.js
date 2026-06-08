const { Router } = require("express");
const shareController = require("../controllers/share.controller");

const shareRouter = Router();

// Create share link no auth middleware
shareRouter.post("/folder/:id", shareController.createShareLink);

// Open shared folder
shareRouter.get("/:token", shareController.getSharedFolder);

// Download shared files
shareRouter.get("/:token/file/:fileId", shareController.downloadSharedFile);

module.exports = shareRouter;