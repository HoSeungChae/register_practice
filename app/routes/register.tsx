import { json, redirect } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { useActionData, Form } from "@remix-run/react";
import bcrypt from "bcrypt";
import { Pool } from "pg";

const pool = new Pool({
  user: "myuser",
  host: "localhost",
  database: "skill_web",
  password: "0756",
  port: 5432,
});

const DEFAULT_ROLE_ID = 20; // 일반 사용자 역할

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return json({ error: "이메일과 비밀번호를 모두 입력해주세요." }, { status: 400 });
  }

  if (password.length < 8) {
    return json({ error: "비밀번호는 최소 8자 이상이어야 합니다." }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await client.query(
      `INSERT INTO login_info (email, pw_hash, role_id, create_user, update_user)
       VALUES ($1, $2, $3, $1, $1)`,
      [email, hashedPassword, DEFAULT_ROLE_ID]
    );
    return redirect("/login");
  } catch (err: any) {
    console.error("회원가입 오류:", err);
    return json({
      error: err.code === "23505"
        ? "이미 사용 중인 이메일입니다."
        : "회원가입 처리 중 오류가 발생했습니다."
    }, { status: 500 });
  } finally {
    client.release();
  }
}

export default function Register() {
  const actionData = useActionData<typeof action>();

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto", padding: "1rem" }}>
      <h1 style={{ textAlign: "center", marginBottom: "1.5rem" }}>회원가입</h1>

      {actionData?.error && (
        <div style={{
          color: "red",
          padding: "0.75rem",
          border: "1px solid red",
          borderRadius: "4px",
          marginBottom: "1rem"
        }}>
          ⚠️ {actionData.error}
        </div>
      )}

      <Form method="post" style={{ display: "grid", gap: "1rem" }}>
        <label style={{ display: "grid", gap: "0.25rem" }}>
          <span>이메일*</span>
          <input
            type="email"
            name="email"
            required
            style={{ padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
          />
        </label>

        <label style={{ display: "grid", gap: "0.25rem" }}>
          <span>비밀번호* (8자 이상)</span>
          <input
            type="password"
            name="password"
            required
            minLength={8}
            style={{ padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
          />
        </label>

        <button
          type="submit"
          style={{
            padding: "0.75rem",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: "500"
          }}
        >
          회원가입 완료
        </button>
      </Form>
    </div>
  );
}
