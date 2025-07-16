import {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData, useActionData } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { requireUserSession } from "~/utils/session.server";
import { useState } from "react";

// 📥 GET 요청 → 로그인한 본인만 접근
export async function loader({ request, params }: LoaderFunctionArgs) {
  const sessionUserId = await requireUserSession(request);
  const urlUserId = Number(params.userId);

  if (sessionUserId !== urlUserId) {
    throw redirect("/login");
  }

  const result = await db.query(
    `SELECT * FROM user_info WHERE user_id = $1`,
    [sessionUserId]
  );
  const userInfo = result.rows[0];

  if (!userInfo) {
    throw new Response("사용자 정보를 찾을 수 없습니다.", { status: 404 });
  }

  return json({ userInfo });
}

// 📤 POST 요청 → DB에 수정 적용
export async function action({ request, params }: ActionFunctionArgs) {
  const sessionUserId = await requireUserSession(request);
  const urlUserId = Number(params.userId);

  if (sessionUserId !== urlUserId) {
    throw redirect("/login");
  }

  const formData = await request.formData();
  const data = {
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    email: formData.get("email"),
    phone_number: formData.get("phone_number"),
    birth: formData.get("birth"),
    gender: formData.get("gender"),
    position: formData.get("position"),
    upper_department: formData.get("upper_department"),
    lower_department: formData.get("lower_department"),
    address: formData.get("address"),
  };

  try {
    await db.query(
      `UPDATE user_info
       SET first_name = $1, last_name = $2, email = $3, phone_number = $4,
           birth = $5, gender = $6, position = $7, upper_department = $8,
           lower_department = $9, address = $10
       WHERE user_id = $11`,
      [
        data.first_name,
        data.last_name,
        data.email,
        data.phone_number,
        data.birth,
        data.gender,
        data.position,
        data.upper_department,
        data.lower_department,
        data.address,
        sessionUserId,
      ]
    );
    return redirect(`/user/${sessionUserId}/edit`);
  } catch (err) {
    console.error("DB 업데이트 오류:", err);
    return json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// 🧑‍💻 컴포넌트
export default function EditUser() {
  const { userInfo } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [upperDept, setUpperDept] = useState(userInfo.upper_department || "");
  const [lowerDept, setLowerDept] = useState(userInfo.lower_department || "");

  const departmentOptions: Record<string, string[]> = {
    "개발본부": ["제1개발부", "제2개발부", "한국지사", "교육그룹", "AI솔루션그룹"],
    "ICT본부": ["제1그룹", "제2그룹", "제3그룹", "제4그룹"],
    "사회인프라사업부": ["설계·품질그룹", "토호쿠사업소", "후쿠오카사업소", "스마트에너지솔루션부"],
    "경영지원실": ["인사그룹", "경리그룹", "총무그룹"],
    "영업본부": ["영업본부"],
    "품질관리부": ["품질관리부"],
  };

  return (
    <div>
      <h2>개인정보 수정</h2>
      {actionData?.error && <p style={{ color: "red" }}>{actionData.error}</p>}
      <Form method="post">
        <label>
          이름:
          <input type="text" name="first_name" defaultValue={userInfo.first_name} required />
        </label>
        <br />
        <label>
          성:
          <input type="text" name="last_name" defaultValue={userInfo.last_name} required />
        </label>
        <br />
        <label>
          이메일:
          <input type="email" name="email" defaultValue={userInfo.email} required />
        </label>
        <br />
        <label>
          전화번호:
          <input type="tel" name="phone_number" defaultValue={userInfo.phone_number || ""} />
        </label>
        <br />
        <label>
          생년월일:
          <input type="date" name="birth" defaultValue={userInfo.birth || ""} />
        </label>
        <br />
        <fieldset>
          <legend>성별</legend>
          {["male", "female", "others"].map((gender) => (
            <label key={gender}>
              <input
                type="radio"
                name="gender"
                value={gender}
                defaultChecked={userInfo.gender === gender}
              />
              {gender}
            </label>
          ))}
        </fieldset>
        <br />
        <fieldset>
          <legend>직책</legend>
          {[
            ["staff", "사원"],
            ["assistant_manager", "주임"],
            ["manager", "대리"],
            ["senior_manager", "과장"],
            ["deputy_general_manager", "차장"],
            ["general_manager", "부장"],
          ].map(([val, label]) => (
            <label key={val}>
              <input
                type="radio"
                name="position"
                value={val}
                defaultChecked={userInfo.position === val}
              />
              {label}
            </label>
          ))}
        </fieldset>
        <br />
        <label>
          주소:
          <input type="text" name="address" defaultValue={userInfo.address || ""} />
        </label>
        <br />
        <label>
          소속본부:
          <select
            name="upper_department"
            value={upperDept}
            onChange={(e) => {
              setUpperDept(e.target.value);
              setLowerDept("");
            }}
          >
            <option value="">선택</option>
            {Object.keys(departmentOptions).map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </label>
        <br />
        {upperDept && (
          <label>
            하위부서:
            <select
              name="lower_department"
              value={lowerDept}
              onChange={(e) => setLowerDept(e.target.value)}
            >
              <option value="">선택</option>
              {departmentOptions[upperDept].map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </label>
        )}
        <br />
        <button type="submit">수정하기</button>
      </Form>
    </div>
  );
}
