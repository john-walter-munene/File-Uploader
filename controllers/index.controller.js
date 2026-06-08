const db = require("../db/queries");

// render app entry point
const getIndex = async (request, response, next) => {
    try {

        // guest landing page
        if (!request.user) {
            return response.render("index", {
                folder: null,
                rootFolder: null,
                files: [],
                folders: [],
                path: []
            });
        }

        // get user root folder or redirect to login
        const rootFolder = await db.getRootFolder(request.user.id);
        if (!rootFolder) return response.redirect("/login");

        // redirect into root folder
        return response.redirect(`/folders/${rootFolder.id}`);

    } catch (err) {
        next(err);
    }
};

module.exports = { getIndex };