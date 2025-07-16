// app/routes/login.tsx
import { ActionFunctionArgs, json, redirect, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import bcrypt from "bcryptjs";
import { db } from "~/utils/db.server";
import { getSession, commitSession } from "~/utils/session.server";

// ✅ 1. loader (GET 요청)
export const loader = async ({ request }: LoaderFunctionArgs) => {
  return json({});
};

// ✅ 2. action (로그인 처리 및 세션 저장)
export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString() || "";
  const password = formData.get("password")?.toString() || "";

  try {
    // 로그인 정보 확인
    const result = await db.query(
      "SELECT * FROM login_info WHERE email = $1",
      [email]
    );
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.pw_hash))) {
      return json(
        { error: "이메일 또는 비밀번호가 잘못되었습니다." },
        { status: 401 }
      );
    }

    // user_info 등록 여부 확인
    const userInfo = await db.query(
      "SELECT * FROM user_info WHERE login_id = $1",
      [user.login_id]
    );

    // ✅ 세션 생성 및 login_id 저장 (키 이름은 "login_id"로 통일)
    const session = await getSession(request);
    session.set("login_id", user.login_id);

    const redirectUrl = userInfo.rowCount === 0
      ? "/user/new"               // 개인정보 미등록 상태
      : `/user/${userInfo.rows[0].user_info_id}/edit`;  // 개인정보 있음

    // ✅ 세션 쿠키 포함해서 리디렉션
    return redirect(redirectUrl, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });

  } catch (error) {
    console.error("로그인 오류:", error);
    return json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
};

// ✅ 3. 로그인 컴포넌트
export default function Login() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="login-wrapper">
      <h2>로그인</h2>
      {actionData?.error && <p style={{ color: "red" }}>{actionData.error}</p>}
      <Form method="post">
        <label>
          이메일
          <input type="email" name="email" required />
        </label>
        <label>
          비밀번호
          <input type="password" name="password" required />
        </label>
        <button type="submit">로그인</button>
      </Form>
      <p>
        계정이 없으신가요? <a href="/register">회원가입</a>
      </p>
    </div>
  );
}
