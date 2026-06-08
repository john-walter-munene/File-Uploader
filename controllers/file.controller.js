const db = require("../db/queries");
const fileHandler = require("../middleware/fileHandler");

// Render upload form for a specific folder
const getUploadForm = async (request, response, next) => {
    try {
        const folderId = Number(request.params.folderId);
        const userId = request.user.id;

        const folder = await db.readFolder(folderId, userId);
        if (!folder) return response.status(404).render("404");

        return response.render("upload", { folder: folder, error: null });
    } catch (error) {
        next(error);
    }
};

// Handle file upload into a specific folder
const uploadFile = [
    fileHandler.upload.single("document"),

    async (request, response, next) => {
        try {
            const folderId = Number(request.params.folderId);
            const userId = request.user.id;

            const folder = await db.readFolder(folderId, userId);
            if (!folder) return response.status(404).render("404");

            const uploadedFile = request.file;

            if (!uploadedFile) {
                return response.status(400).render("upload", {
                    folder,
                    error: "No file was selected for upload"
                });
            }

            // upload to Supabase Storage
            const storagePath = await fileHandler.uploadFileToStorage(uploadedFile, userId, folderId);

            // store ONLY metadata and Supabase path
            await db.createFile({
                name: uploadedFile.originalname,
                path: storagePath,
                mimetype: uploadedFile.mimetype,
                size: uploadedFile.size,
                userId,
                folderId
            });

            return response.redirect(`/folders/${folderId}`);
        } catch (error) {
            next(error);
        }
    }
];

// read single file details
const readFile = async (req, res, next) => {
    try {

        const fileId = Number(req.params.id);
        const userId = req.user.id;

        const file = await db.getFileById(fileId, userId);
        if (!file) return res.status(404).render("404");

        // get parent folder for navigation
        let parentFolder = null;
        if (file.folder_id) parentFolder = await db.readFolder(file.folder_id, userId);

        return res.render("file", { file, parentFolder });
    } catch (err) {
        next(err);
    }
};


// get edit file form
const getEditFileForm = async (req, res, next) => {
    try {

        const fileId = Number(req.params.id);
        const userId = req.user.id;

        // validate ownership
        const file = await db.getFileById(fileId, userId);
        if (!file) return res.status(404).render("404");

        // fetch parent folder if exists
        let parentFolder = null;
        if (file.folder_id) parentFolder = await db.readFolder(file.folder_id, userId);

        return res.render("edit-file", { file, parentFolder });
    } catch (err) {
        next(err);
    }
};


// update file
const updateFile = async (req, res, next) => {
    try {

        const fileId = Number(req.params.id);
        const userId = req.user.id;

        const file = await db.getFileById(fileId, userId);
        if (!file) return res.status(404).render("404");
        
        const { name } = req.body;
        await db.updateFile(fileId, userId, { name });

        return res.redirect(`/files/${fileId}`);
    } catch (err) {
        next(err);
    }
};


// delete file: supabase file and db table
const deleteFile = async (req, res, next) => {
    try {
        const fileId = Number(req.params.id);
        const userId = req.user.id;

        const file = await db.getFileById(fileId, userId);
        if (!file) return res.status(404).render("404");

        // delete from Supabase storage, and the db record
        await fileHandler.deleteFileFromStorage(file.path);
        await db.deleteFile(fileId, userId);

        const redirectFolder = file.folder_id ? `/folders/${file.folder_id}` : "/";

        return res.redirect(redirectFolder);
    } catch (err) {
        next(err);
    }
};

// stream/download file to user
const downloadFile = async (req, res, next) => {
    try {
        const fileId = Number(req.params.id);
        const userId = req.user.id;

        const file = await db.getFileById(fileId, userId);
        if (!file) return res.status(404).render("404");

        const { data, error } = await supabase.storage.from("user-files").download(file.path);
        if (error) throw new Error(error.message);

        const buffer = Buffer.from(await data.arrayBuffer());

        res.setHeader("Content-Disposition", `attachment; filename="${file.name}"`);
        res.setHeader("Content-Type", file.mimetype);

        return res.send(buffer);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getUploadForm,
    uploadFile,
    readFile,
    getEditFileForm,
    updateFile,
    deleteFile,
    downloadFile
};