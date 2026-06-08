const db = require("../db/queries");
const fileHandler = require("../middleware/fileHandler");
const { getFolderPath } = require("../lib/folderPathBuilder");

// render selected folder
const readFolder = async (req, res, next) => {
    try {
        const folderId = Number(req.params.id);
        const userId = req.user.id;

        const folder = await db.readFolder(folderId, userId);

        if (!folder) return res.status(404).render("404");

        const rootFolder = await db.getRootFolder(userId);
        const path = await getFolderPath(folderId, userId);

        return res.render("index", {
            folder,
            rootFolder,
            folders: folder.children || [],
            files: folder.files || [],
            path: path || []
        });

    } catch (err) {
        next(err);
    }
};


// render create folder form
const getCreateFolderForm = async (req, res, next) => {
    try {
        const parentFolderId = Number(req.params.id);
        const userId = req.user.id;

        const parentFolder = await db.readFolder(parentFolderId, userId);
        if (!parentFolder) return res.status(404).render("404");

        return res.render("new", {
            parentFolder,
            folder: null
        });

    } catch (err) {
        next(err);
    }
};


// handle create folder
const postCreateFolder = async (req, res, next) => {
    try {
        const parentId = Number(req.params.id);
        const userId = req.user.id;

        const name = req.body.name?.trim();

        if (!name) {
            const parentFolder = await db.readFolder(parentId, userId);

            return res.status(400).render("new", {
                parentFolder,
                folder: null,
                error: "Folder name is required"
            });
        }

        await db.createFolder({ name, userId, parentId});
        return res.redirect(`/folders/${parentId}`);

    } catch (err) {
        next(err);
    }
};


// render edit folder form
const getEditFolderForm = async (req, res, next) => {
    try {
        const folderId = Number(req.params.id);
        const userId = req.user.id;

        const folder = await db.readFolder(folderId, userId);

        if (!folder) return res.status(404).render("404");

        let parentFolder = null;

        if (folder.parent_id) parentFolder = await db.readFolder(folder.parent_id, userId);

        return res.render("new", {
            folder,
            parentFolder: parentFolder || null
        });

    } catch (err) {
        next(err);
    }
};


// handle update folder
const postEditFolder = async (req, res, next) => {
    try {
        const folderId = Number(req.params.id);
        const userId = req.user.id;

        const name = req.body.name?.trim();
        const folder = await db.readFolder(folderId, userId);

        if (!folder) return res.status(404).render("404");

        if (!name) {
            const parentFolder = folder.parent_id ? await db.readFolder(folder.parent_id, userId): null;

            return res.status(400).render("new", {
                folder,
                parentFolder,
                error: "Folder name cannot be empty"
            });
        }

        await db.updateFolder(folderId, userId, { name });

        if (folder.parent_id) return res.redirect(`/folders/${folder.parent_id}`);
        return res.redirect(`/`);
    } catch (err) {
        next(err);
    }
};


// delete folder
const deleteFolder = async (req, res, next) => {
    try {
        const folderId = Number(req.params.id);
        const userId = req.user.id;

        const folder = await db.readFolder(folderId, userId);
        if (!folder) return res.status(404).render("404");

        // get all files recursively
        const allFiles = await db.getAllFilesInFolderTree(folderId, userId);

        // delete files from storage
        const filePaths = allFiles.map(file => file.path).filter(Boolean);
        await fileHandler.deleteFilesByPaths(filePaths);

        // Delete folder (DB cascade handles structure)
        await db.deleteFolder(folderId, userId);

        // Redirect to parent folder (or main as fallback)
        if (folder.parent_id) return res.redirect(`/folders/${folder.parent_id}`);
        return res.redirect(`/`);

    } catch (err) {
        next(err);
    }
};

module.exports = {
    readFolder,
    getCreateFolderForm,
    postCreateFolder,
    getEditFolderForm,
    postEditFolder,
    deleteFolder
};