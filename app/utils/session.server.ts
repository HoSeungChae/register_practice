import { createCookieSessionStorage, redirect } from "@remix-run/node";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    secrets: ["super-secret-key"], // 실 서비스에서는 환경변수로
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secure: false, // 배포 시 true
    maxAge: 60 * 60 * 24, // 1일
  },
});

export const getLoginIdFromSession = async (request: Request) => {
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  return session.get("login_id") as number | undefined;
};

export const requireLoginId = async (request: Request) => {
  const login_id = await getLoginIdFromSession(request);
  if (!login_id) throw redirect("/login");
  return login_id;
};

export const createUserSession = async (login_id: number, redirectTo: string) => {
  const session = await sessionStorage.getSession();
  session.set("login_id", login_id);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
};

export const getSession = (request: Request) =>
  sessionStorage.getSession(request.headers.get("Cookie"));

export const commitSession = (session: any) =>
  sessionStorage.commitSession(session);

export const destroySession = (session: any) =>
  sessionStorage.destroySession(session);