const multer = require("multer");
const supabase = require("../lib/supabase");

// Maximum file size (5 megabytes)
const maximumFileSize =
    5 * 1024 * 1024;

// Allowed file types
const allowedFileTypes = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

// Memory storage instead of disk
const storageConfiguration =
    multer.memoryStorage();

// File filter
function fileFilter(req, file, cb) {

    if (!allowedFileTypes.includes(file.mimetype)) {
        return cb(new Error("Unsupported file type provided"), false);
    }

    cb(null, true);
}

// Multer instance
const upload = multer({ 
    storage: storageConfiguration,
    fileFilter,
    limits: { fileSize: maximumFileSize }
});

// Upload file to Supabase
async function uploadFileToStorage(file, userId, folderId = "root") {

    // Create unique filename
    const uniqueFileName = `${Date.now()}-${file.originalname}`;

    // Organize storage path
    const storagePath = `${userId}/${folderId}/${uniqueFileName}`;

    const { data, error } = await supabase.storage.from("user-files")
        .upload(storagePath, file.buffer, { contentType: file.mimetype });

    if (error) throw new Error(error.message);

    return data.path;
}

// Delete single file
async function deleteFileFromStorage(filePath) {

    try {

        if (!filePath) return;

        const { error } = await supabase.storage.from("user-files").remove([filePath]);

        if (error) throw new Error(error.message);

    } catch (err) {
        console.error("Failed to delete file:", err.message);
    }
}

// Delete many files
async function deleteFilesByPaths(filePaths = []) {

    try {

        if (!filePaths.length) return;

        const { error } = await supabase.storage.from("user-files").remove(filePaths);

        if (error) throw new Error(error.message);

    } catch (err) {
        console.error("Failed deleting files:", err.message);
    }
}

module.exports = {
    upload,
    uploadFileToStorage,
    deleteFileFromStorage,
    deleteFilesByPaths
};