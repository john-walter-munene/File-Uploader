require("dotenv").config();
const webSocket = require("ws");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
        realtime: { transport: webSocket },
    }
);

module.exports = supabase;