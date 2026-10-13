const SUPABASE_URL = "https://mnydbjvjnytpqgiwkzqb.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ueWRianZqbnl0cHFnaXdrenFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzMTg3MzMsImV4cCI6MjEwNjg5NDczM30.eRrwxgvQ9bmPvSsGZVv8p9QFS_EkSZ80DXTHPQfDWPk";

console.log("Inicio de API Key:", SUPABASE_KEY.substring(0, 10));
console.log("Longitud de API Key:", SUPABASE_KEY.length);

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);