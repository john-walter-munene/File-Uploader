const prisma = require("./prisma");

const getFolderPath = async (folderId, userId) => {

    const path = [];

    let current = await prisma.folder.findFirst({ where: { id: folderId, user_id: userId } });
    if (!current) return null;

    // Build up the tree
    while (current) {
        path.push({ id: current.id, name: current.name });

        if (!current.parent_id) break;
        current = await prisma.folder.findFirst({
            where: {
                id: current.parent_id,
                user_id: userId
            }
        });
    }

    // reverse to get root (current)
    return path.reverse();
};

module.exports = { getFolderPath };