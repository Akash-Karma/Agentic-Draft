import * as dotenv from "dotenv";
dotenv.config();

import { prisma } from "./src/lib/prisma";

async function main() {
  const user = await prisma.user.create({
    data: { email: "test@example.com" }
  });
  console.log("Created user:", user);
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});