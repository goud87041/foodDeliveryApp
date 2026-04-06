import crypto from "crypto";

/** Random hex token for password reset links */
export function createResetToken() {
  return crypto.randomBytes(32).toString("hex");
}
