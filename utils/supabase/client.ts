import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseAnonKey, getSupabaseUrl } from "./config";

export const createClient = () =>
  createBrowserClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
  );
