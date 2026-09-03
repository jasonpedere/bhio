import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function isAllowedOrigin(origin: string) {
  return origin === "https://bhio.link" ||
    origin === "https://www.bhio.link" ||
    origin === "https://solebio.link" ||
    origin === "https://www.solebio.link" ||
    /^https:\/\/(?:bhio|solebio)(?:-[a-z0-9-]+)?\.[a-z0-9-]+\.workers\.dev$/i.test(origin) ||
    /^https:\/\/[a-z0-9-]+\.(?:bhio|solebio)\.pages\.dev$/i.test(origin) ||
    /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
}

function corsHeaders(request: Request) {
  const origin = request.headers.get("origin") ?? "";

  return {
    "Access-Control-Allow-Origin": isAllowedOrigin(origin) ? origin : "https://bhio.link",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
    "Content-Type": "application/json",
    "Vary": "Origin",
  };
}

function json(request: Request, body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders(request) });
}

async function listFiles(
  storage: ReturnType<typeof createClient>["storage"],
  prefix: string,
): Promise<string[]> {
  const files: string[] = [];
  let offset = 0;

  while (true) {
    const { data: entries, error } = await storage
      .from("profile-images")
      .list(prefix, { limit: 1000, offset });

    if (error) throw error;
    if (!entries?.length) break;

    for (const entry of entries) {
      const path = `${prefix}/${entry.name}`;
      if (entry.id) files.push(path);
      else files.push(...await listFiles(storage, path));
    }

    if (entries.length < 1000) break;
    offset += entries.length;
  }

  return files;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }

  if (request.method !== "POST" && request.method !== "DELETE") {
    return json(request, { error: "Method not allowed" }, 405);
  }

  let body: { confirmation?: string };
  try {
    body = await request.json();
  } catch {
    return json(request, { error: "Invalid request body" }, 400);
  }
  if (body.confirmation !== "DELETE") {
    return json(request, { error: "Deletion confirmation required" }, 400);
  }

  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return json(request, { error: "Authentication required" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error("Supabase function secrets are not configured");
    return json(request, { error: "Server configuration error" }, 500);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  });
  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) {
    return json(request, { error: "Invalid or expired session" }, 401);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const files = await listFiles(adminClient.storage, user.id);
    for (let index = 0; index < files.length; index += 100) {
      const { error } = await adminClient.storage
        .from("profile-images")
        .remove(files.slice(index, index + 100));
      if (error) throw error;
    }

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
    if (deleteError) throw deleteError;

    return json(request, { deleted: true });
  } catch (error) {
    console.error("Account deletion failed", error);
    return json(request, { error: "Account deletion failed" }, 500);
  }
});