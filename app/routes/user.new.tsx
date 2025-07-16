import {
  ActionFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { getLoginIdFromSession } from "~/utils/session.server";
import { useState } from "react";

export async function action({ request }: ActionFunctionArgs) {
  const login_id = await getLoginIdFromSession(request);
  if (!login_id) return redirect("/login");

  const formData = await request.formData();
  const get = (key: string) => formData.get(key)?.toString() ?? "";

  try {
    const result = await db.query(
      `INSERT INTO user_info (
        login_id, email, first_name, last_name, first_name_kana, last_name_kana,
        birth_date, nationality, gender_id, phone_number, employee_number,
        position_id, address_low_code, department_low_id,
        preference, skills, career_start_date
      ) VALUES (
        $1,$2,$3,$4,$5,$6,
        $7,$8,$9,$10,$11,
        $12,$13,$14,
        $15,$16,$17
      ) RETURNING user_info_id`,
      [
        login_id,
        get("email"),
        get("first_name"),
        get("last_name"),
        get("first_name_kana"),
        get("last_name_kana"),
        get("birth_date") || null,
        get("nationality"),
        parseInt(get("gender_id")),
        get("phone_number"),
        get("employee_number"),
        parseInt(get("position_id")),
        parseInt(get("address_low_code")),
        parseInt(get("department_low_id")),
        get("preference"),
        get("skills"),
        get("career_start_date") || null,
      ]
    );

    const newUserId = result.rows[0].user_info_id;
    return redirect(`/user/${newUserId}/edit`);
  } catch (error) {
    console.error("유저 등록 오류:", error);
    return json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// ✅ 정수 ID 포함 구조
const departmentOptions: Record<string, { id: number; name: string }[]> = {
  "개발본부": [
    { id: 31, name: "제1개발부" },
    { id: 35, name: "제2개발부" },
    { id: 32, name: "한국지사" },
    { id: 33, name: "교육그룹" },
    { id: 34, name: "AI솔루션그룹" },
  ],
  "ICT본부": [
    { id: 41, name: "제1그룹" },
    { id: 42, name: "제2그룹" },
    { id: 43, name: "제3그룹" },
    { id: 44, name: "제4그룹" },
  ],
  "사회인프라사업부": [
    { id: 51, name: "설계·품질그룹" },
    { id: 52, name: "토호쿠사업소" },
    { id: 53, name: "후쿠오카사업소" },
    { id: 54, name: "스마트에너지솔루션부" },
  ],
  "경영지원실": [
    { id: 11, name: "인사그룹" },
    { id: 12, name: "경리그룹" },
    { id: 13, name: "총무그룹" },
  ],
  "영업본부": [{ id: 20, name: "영업본부" }],
  "품질관리부": [{ id: 60, name: "품질관리부" }],
};

export default function NewUser() {
  const actionData = useActionData<typeof action>();
  const [upperDept, setUpperDept] = useState("");
  const [lowerDept, setLowerDept] = useState("");

  return (
    <div>
      <h2>개인정보 등록</h2>
      {actionData?.error && <p style={{ color: "red" }}>{actionData.error}</p>}
      <Form method="post">
        <label>이름: <input type="text" name="first_name" required /></label><br />
        <label>성: <input type="text" name="last_name" required /></label><br />
        <label>이름(카나): <input type="text" name="first_name_kana" /></label><br />
        <label>성(카나): <input type="text" name="last_name_kana" /></label><br />
        <label>이메일: <input type="email" name="email" required /></label><br />
        <label>전화번호: <input type="tel" name="phone_number" /></label><br />
        <label>생년월일: <input type="date" name="birth_date" /></label><br />
        <label>국적: <input type="text" name="nationality" placeholder="Korea" /></label><br />

        <fieldset>
          <legend>성별</legend>
          {[
            ["1", "남성"],
            ["2", "여성"],
            ["3", "기타"],
          ].map(([id, label]) => (
            <label key={id}>
              <input type="radio" name="gender_id" value={id} /> {label}
            </label>
          ))}
        </fieldset><br />

        <label>사원번호: <input type="text" name="employee_number" /></label><br />

        <fieldset>
          <legend>직책</legend>
          {[
            ["10", "사원"],
            ["20", "주임"],
            ["30", "대리"],
            ["40", "과장"],
            ["50", "차장"],
            ["60", "부장"],
          ].map(([val, label]) => (
            <label key={val}>
              <input type="radio" name="position_id" value={val} /> {label}
            </label>
          ))}
        </fieldset><br />

        <label>주소코드: <input type="text" name="address_low_code" /></label><br />

        <div>
          <label>소속본부:
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
          </label><br />

          {upperDept && (
            <label>하위부서:
              <select
                name="department_low_id"
                value={lowerDept}
                onChange={(e) => setLowerDept(e.target.value)}
                required
              >
                <option value="">선택</option>
                {departmentOptions[upperDept].map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </label>
          )}
        </div><br />

        <label>입사일: <input type="date" name="career_start_date" /></label><br />
        <label>선호사항: <textarea name="preference" rows={3} /></label><br />
        <label>보유 기술: <textarea name="skills" rows={5} /></label><br />

        <button type="submit">등록하기</button>
      </Form>
    </div>
  );
}
