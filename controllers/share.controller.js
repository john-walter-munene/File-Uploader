const supabase = require("../lib/supabase");
const { randomUUID } = require("crypto");
const db = require("../db/queries");
const { getFolderPath } = require("../lib/folderPathBuilder");
const prisma = require("../lib/prisma");

const createShareLink = async (req, res, next) => {
    try {
        const folderId = Number(req.params.id);
        const userId = req.user.id;

        const folder = await db.readFolder(folderId, userId);
        if (!folder) return res.status(404).render("404");

        let days = parseInt(req.body.duration);
        if (!days || days < 1) days = 1;

        const token = randomUUID();

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + days);

        await db.createShare({ token, folderId, expiresAt });

        const fullLink = `${req.protocol}://${req.get("host")}/share/${token}`;

        return res.render("shared-link", { fullLink, folderId });
    } catch (err) {
        next(err);
    }
};

const getSharedFolder = async (req, res, next) => {
    try {
        const token = req.params.token;

        const share = await db.getShareByToken(token);
        if (!share) return res.status(404).render("404");

        if (new Date() > share.expires_at) {
            await db.deleteExpiredShares();
            return res.status(403).send("Link expired");
        }

        const rootFolderId = share.folder_id;

        // current navigation target
        const folderId = req.query.folder ? Number(req.query.folder): rootFolderId;

        // Get allowed folders
        const allowedIds = await db.getAllFolderIds(rootFolderId, share.folder.user_id);

        if (!allowedIds.includes(folderId)) return res.status(404).render("404");

        // safe folder read (public shared view)
        const folder = await db.getSharedFolderById(folderId);
        if (!folder) return res.status(404).render("404");

        // breadcrumb path (still scoped to owner tree, safe)
        const path = await getFolderPath(folderId, share.folder.user_id);

        return res.render("shared", {
            folder,
            folders: folder.children || [],
            files: folder.files || [],
            path,
            rootFolderId,
            shareToken: token,
            sharedView: true
        });

    } catch (err) {
        next(err);
    }
};

const downloadSharedFile = async (req, res, next) => {
    try {
        const token = req.params.token;
        const fileId = Number(req.params.fileId);

        const share = await db.getShareByToken(token);
        if (!share) return res.status(404).render("404");

        if (new Date() > share.expires_at) {
            await db.deleteExpiredShares();
            return res.status(403).send("Link expired");
        }

        const rootFolderId = share.folder_id;

        // ensure file is inside shared tree
        const allowedFolderIds = await db.getAllFolderIds(rootFolderId, share.folder.user_id);

        // get file (NO user auth version needed)
        const file = await prisma.file.findUnique({ where: { id: fileId }});
        if (!file) return res.status(404).render("404");

        if (!allowedFolderIds.includes(file.folder_id)) {
            return res.status(403).send("Access denied");
        }

        const { data, error } = await supabase.storage .from("user-files").download(file.path);
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
    createShareLink,
    getSharedFolder,
    downloadSharedFile
};