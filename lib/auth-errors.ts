// Map Supabase auth errors to short, human messages.
export function friendlyAuthError(message: string | undefined) {
  if (!message) return "Something went wrong. Try again.";
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "Wrong email or password.";
  if (m.includes("email not confirmed")) return "Confirm your email first. Check your inbox.";
  if (m.includes("already registered") || m.includes("already been registered")) return "Email already in use. Log in instead.";
  if (m.includes("password") && m.includes("characters")) return "Password must be at least 6 characters.";
  if (m.includes("database error")) return "Couldn't create your account. Check the property link and try again.";
  if (m.includes("rate limit")) return "Too many attempts. Wait a minute.";
  return message;
}
