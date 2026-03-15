import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export const ADMIN_AUTH_COOKIE = "talentos_admin_session";
const ADMIN_SESSION_MAX_AGE = 60 * 60 * 12; // 12 horas

const DEFAULT_ADMIN_USER = "admin_PuPom72Sbu";
const DEFAULT_ADMIN_PASSWORD = "Fk*IrnYbjcHqyY5$sCJqfI!7";

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function getAdminCredentials() {
  const envUser = (process.env.ADMIN_USER ?? "").trim();
  const envPassword = process.env.ADMIN_PASSWORD ?? "";

  return {
    user: envUser || DEFAULT_ADMIN_USER,
    password: envPassword || DEFAULT_ADMIN_PASSWORD,
  };
}

export function hasAdminCredentialsConfigured() {
  const { user, password } = getAdminCredentials();
  return Boolean(user && password);
}

function buildSessionValue(user: string, password: string) {
  return sha256(`talentos-admin:${user}:${password}`);
}

export function validateAdminCredentials(user: string, password: string) {
  const configured = getAdminCredentials();
  if (!configured.user || !configured.password) return false;
  return safeEqual(user, configured.user) && safeEqual(password, configured.password);
}

export async function isAdminAuthenticated() {
  const configured = getAdminCredentials();
  if (!configured.user || !configured.password) return false;

  const cookieStore = await cookies();
  const raw = cookieStore.get(ADMIN_AUTH_COOKIE)?.value ?? "";
  const expected = buildSessionValue(configured.user, configured.password);
  return safeEqual(raw, expected);
}

export function applyAdminSession(response: NextResponse) {
  const configured = getAdminCredentials();
  response.cookies.set({
    name: ADMIN_AUTH_COOKIE,
    value: buildSessionValue(configured.user, configured.password),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
  return response;
}

export function clearAdminSession(response: NextResponse) {
  response.cookies.set({
    name: ADMIN_AUTH_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
