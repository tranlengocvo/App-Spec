/** @type {import('next').NextConfig} */
const nextConfig = {};
console.log("NEXT_PUBLIC_SUPABASE_URL =", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY =", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "loaded" : "missing");


export default nextConfig;
