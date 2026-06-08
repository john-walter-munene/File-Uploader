const { Router } = require("express");
const folderController = require("../controllers/folder.controller");

const folderRouter = Router();

folderRouter.get("/:id", folderController.readFolder);

// create flow
folderRouter.get("/:id/new", folderController.getCreateFolderForm);
folderRouter.post("/:id", folderController.postCreateFolder);

// edit flow
folderRouter.get("/:id/edit", folderController.getEditFolderForm);
folderRouter.post("/:id/edit", folderController.postEditFolder);

// delete
folderRouter.post("/:id/delete", folderController.deleteFolder);

module.exports = folderRouter;