
import { AuthAudience, UserRole } from "@car-garage/shared";
import { connectDatabase, disconnectDatabase } from "../models/db.js";
import { authService } from "../services/auth.service.js";

const [email, password, firstName = "Platform", lastName = "Admin"] =
  process.argv.slice(2);

if (!email || !password) {
  console.error(
    "Usage: pnpm --filter @car-garage/api create-admin <email> <password> [firstName] [lastName]",
  );
  process.exit(1);
}

await connectDatabase();
try {
  const { user } = await authService.register(
    AuthAudience.ADMIN,
    { email, password, firstName, lastName },
    { roles: [UserRole.PLATFORM_ADMIN] },
  );
  console.log(`Created admin ${user.email} (${user.id})`);
} catch (error) {
  console.error(
    error instanceof Error ? error.message : "Failed to create admin",
  );
  process.exitCode = 1;
} finally {
  await disconnectDatabase();
}
