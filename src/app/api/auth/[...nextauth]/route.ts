import { handlers } from "@/lib/auth";

// Auth.js handles both verbs internally — this file just wires them up.
export const { GET, POST } = handlers;