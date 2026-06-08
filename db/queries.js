const prisma = require("../lib/prisma");

// FOLDERS
// create folder
const createFolder = async ({ name, userId, parentId }) => {
    return prisma.folder.create({
        data: {
            name,
            user_id: userId,
            parent_id: parentId || null
        }
    });
};


// get root folder
const getRootFolder = async (userId) => {
    return prisma.folder.findFirst({
        where: {
            user_id: userId,
            parent_id: null
        },
        orderBy: {
            id: "asc"
        }
    });
};


// read folder (safe scoped)
const readFolder = async (folderId, userId) => {
    return prisma.folder.findFirst({
        where: {
            id: folderId,
            user_id: userId
        },
        include: {
            children: true,
            files: true
        }
    });
};


// update folder
const updateFolder = async (folderId, userId, data) => {
    const { name } = data;

    return prisma.folder.updateMany({
        where: {
            id: folderId,
            user_id: userId
        },
        data: { name }
    });
};


// delete folder
const deleteFolder = async (folderId, userId) => {
    return prisma.folder.deleteMany({
        where: {
            id: folderId,
            user_id: userId
        }
    });
};

// FILES
// create file
const createFile = async (data) => {
    const { name, path, mimetype, size, userId, folderId } = data;

    return prisma.file.create({
        data: {
            name,
            path,
            mimetype,
            size,
            user_id: userId,
            folder_id: folderId
        }
    });
};


// get files in folder
const getFilesInFolder = async (folderId, userId) => {
    return prisma.file.findMany({
        where: {
            folder_id: folderId,
            user_id: userId
        },
        orderBy: {
            created_at: "desc"
        }
    });
};


// get file by id
const getFileById = async (fileId, userId) => {
    return prisma.file.findFirst({
        where: {
            id: fileId,
            user_id: userId
        }
    });
};


// update file
const updateFile = async (fileId, userId, data) => {
    const { name, folderId } = data;

    return prisma.file.updateMany({
        where: {
            id: fileId,
            user_id: userId
        },
        data: {
            ...(name !== undefined && { name }),
            ...(folderId !== undefined && { folder_id: folderId })
        }
    });
};


// delete file
const deleteFile = async (fileId, userId) => {
    return prisma.file.deleteMany({
        where: {
            id: fileId,
            user_id: userId
        }
    });
};

// AUT

// create user
const createUser = async (data) => {
    const { email, firstName, lastName, passwordHash } = data;

    return prisma.user.create({
        data: {
            email,
            first_name: firstName,
            last_name: lastName,
            password_hash: passwordHash,
        },
    });
};


// user email lookup
const getUserEmail = async (email) => {
    const user = await prisma.user.findUnique({
        where: { email }
    });

    return user ? user.email : null;
};


// create user and root folder
const createUserWithRootFolder = async (data) => {
    const user = await createUser(data);

    const rootFolder = await createFolder({
        name: user.first_name,
        userId: user.id,
        parentId: null
    });

    return { user, rootFolder };
};

// TREE TRAVERSAL 
// get direct children folders
const getChildFolders = async (parentId, userId) => {
    return prisma.folder.findMany({
        where: {
            parent_id: parentId,
            user_id: userId
        }
    });
};


// recursively collect folder IDs
const getAllFolderIds = async (folderId, userId) => {

    const folderIds = [];

    async function walk(id) {
        folderIds.push(id);

        const children = await getChildFolders(id, userId);

        for (const child of children) await walk(child.id);
    }

    await walk(folderId);

    return folderIds;
};


// get ALL files in folder tree
const getAllFilesInFolderTree = async (folderId, userId) => {

    const folderIds = await getAllFolderIds(folderId, userId);

    return prisma.file.findMany({
        where: {
            folder_id: { in: folderIds },
            user_id: userId
        }
    });
};

// SHARE LINKS

const createShare = async ({ token, folderId, expiresAt }) => {
    return prisma.share.create({
        data: {
            token,
            folder_id: folderId,
            expires_at: expiresAt
        }
    });
};

const getShareByToken = async (token) => {
    return prisma.share.findUnique({
        where: { token },
        include: {
            folder: true
        }
    });
};

const deleteExpiredShares = async () => {
    return prisma.share.deleteMany({
        where: {
            expires_at: {
                lt: new Date()
            }
        }
    });
};

// SAFE PUBLIC READ (NO USER SCOPING)
const getSharedFolderById = async (folderId) => {
    return prisma.folder.findUnique({
        where: { id: Number(folderId) },
        include: {
            children: true,
            files: true
        }
    });
};

module.exports = {
    // auth
    getUserEmail,
    createUserWithRootFolder,

    // folders
    createFolder,
    getRootFolder,
    readFolder,
    updateFolder,
    deleteFolder,

    // files
    createFile,
    getFilesInFolder,
    getFileById,
    updateFile,
    deleteFile,

    // tree system
    getChildFolders,
    getAllFolderIds,
    getAllFilesInFolderTree,

    // Share Links
    createShare, 
    getShareByToken,
    deleteExpiredShares,
    getSharedFolderById,
};