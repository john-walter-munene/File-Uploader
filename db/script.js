const prisma = require("../lib/prisma");

// My DB queries go here
async function run() {
  const users = await prisma.user.findMany();
  console.log(users);
}

run();