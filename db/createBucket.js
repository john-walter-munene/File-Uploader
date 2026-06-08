require("dotenv").config();

const supabase = require("../lib/supabase");

async function createBucket() {

    const { data, error } =
        await supabase.storage.createBucket(
            "user-files",
            {
                public: false,
                fileSizeLimit: 5242880, // 5MB
                allowedMimeTypes: [
                    "application/pdf",
                    "image/png",
                    "image/jpeg",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                ]
            }
        );

    if (error) {
        console.error("Bucket creation failed:");
        console.error(error.message);
        process.exit(1);
    }

    console.log("Bucket created:", data);
}

createBucket();