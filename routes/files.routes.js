const { Router } = require("express");
const fileController = require("../controllers/file.controller");

const fileRouter = Router();

// upload form
fileRouter.get("/upload/:folderId", fileController.getUploadForm);
fileRouter.post("/upload/:folderId", fileController.uploadFile);

// file details
fileRouter.get("/:id", fileController.readFile);

// edit file
fileRouter.get("/:id/edit", fileController.getEditFileForm);
fileRouter.post("/:id/edit", fileController.updateFile);

// delete file
fileRouter.post("/:id/delete", fileController.deleteFile);

// download file
fileRouter.get("/:id/download", fileController.downloadFile);

module.exports = fileRouter;