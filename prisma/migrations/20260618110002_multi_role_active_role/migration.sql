-- Step 1: Create user_roles table
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- Step 2: Create indexes and constraints for user_roles
CREATE INDEX "user_roles_userId_idx" ON "user_roles"("userId");
CREATE UNIQUE INDEX "user_roles_userId_role_key" ON "user_roles"("userId", "role");

-- Step 3: Add foreign key
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 4: Migrate existing role data to user_roles table
INSERT INTO "user_roles" ("id", "userId", "role", "createdAt")
SELECT
    gen_random_uuid()::text,
    "id",
    CASE
        WHEN "role" = 'USER' THEN 'BUYER'::"Role"
        ELSE "role"
    END,
    NOW()
FROM "users"
WHERE "role" != 'SUPER_ADMIN';

-- Step 5: Add activeRole column (nullable)
ALTER TABLE "users" ADD COLUMN "activeRole" "Role";

-- Step 6: Set activeRole for single-role users
UPDATE "users" SET "activeRole" = (
    SELECT ur."role" FROM "user_roles" ur WHERE ur."userId" = "users"."id" LIMIT 1
) WHERE "id" IN (
    SELECT "userId" FROM "user_roles" GROUP BY "userId" HAVING COUNT(*) = 1
);

-- Step 7: Drop old role column
ALTER TABLE "users" DROP COLUMN "role";
