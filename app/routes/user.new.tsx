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
    <Form id="user-form" method="post">
      {actionData?.error && <p style={{ color: "red" }}>{actionData.error}</p>}
      <p>
        <span>이름</span>
        <input
          aria-label="First name"
          name="first_name"
          placeholder="First"
          type="text"
          required
        />
        <input
          aria-label="Last name"
          name="last_name"
          placeholder="Last"
          type="text"
          required
        />
      </p>
      <p>
        <span>이름(카나)</span>
        <input
          aria-label="First name Kana"
          name="first_name_kana"
          placeholder="First Kana"
          type="text"
        />
        <input
          aria-label="Last name Kana"
          name="last_name_kana"
          placeholder="Last Kana"
          type="text"
        />
      </p>
      <label>
        <span>이메일</span>
        <input
          name="email"
          placeholder="example@domain.com"
          type="email"
          required
        />
      </label>
      <label>
        <span>전화번호</span>
        <input
          name="phone_number"
          placeholder="08012345678"
          type="tel"
        />
      </label>
      <label>
        <span>국적</span>
        <input
          name="nationality"
          placeholder="Korea"
          type="text"
        />
      </label>
      <label>
        <span>생년월일</span>
        <input
          name="birth_date"
          type="date"
        />
      </label>
      <fieldset style={{ border: "none", padding: 0, marginBottom: "1rem" }}>
        <legend style={{ marginBottom: "0.5rem" }}>성별</legend>
        <div style={{ display: "flex", gap: "1rem" }}>
          <label style={{ display: "inline-flex", alignItems: "center" }}>
            <input
              type="radio"
              name="gender_id"
              value="1"
            />
            <span style={{ marginLeft: "0.3rem" }}>남성</span>
          </label>
          <label style={{ display: "inline-flex", alignItems: "center" }}>
            <input
              type="radio"
              name="gender_id"
              value="2"
            />
            <span style={{ marginLeft: "0.3rem" }}>여성</span>
          </label>
          <label style={{ display: "inline-flex", alignItems: "center" }}>
            <input
              type="radio"
              name="gender_id"
              value="3"
            />
            <span style={{ marginLeft: "0.3rem" }}>기타</span>
          </label>
        </div>
      </fieldset>
      <label>
        <span>사원번호</span>
        <input
          name="employee_number"
          type="text"
        />
      </label>
      <fieldset style={{ border: "none", padding: 0, marginBottom: "1rem" }}>
        <legend style={{ marginBottom: "0.5rem", marginLeft: "-0.3rem" }}>직책</legend>
        <div style={{ display: "flex", gap: "1rem" }}>
          {[
            ["10", "사원"],
            ["20", "주임"],
            ["30", "대리"],
            ["40", "과장"],
            ["50", "차장"],
            ["60", "부장"],
          ].map(([val, label]) => (
            <label key={val} style={{ display: "inline-flex", alignItems: "center" }}>
              <input
                type="radio"
                name="position_id"
                value={val}
              />
              <span style={{ marginLeft: "0.3rem" }}>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label>
        <span>주소코드</span>
        <input
          name="address_low_code"
          type="text"
        />
      </label>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1rem" }}>
        <label>
          <span>소속본부</span><br />
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
        {upperDept && (
          <label>
            <span>하위부서</span><br />
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
      </div>
      <label>
        <span>입사일</span>
        <input
          name="career_start_date"
          type="date"
        />
      </label>
      <label>
        <span>선호사항</span>
        <textarea
          name="preference"
          rows={3}
        />
      </label>
      <label>
        <span>보유 기술</span>
        <textarea
          name="skills"
          rows={5}
        />
      </label>
      <p>
        <button type="submit">등록하기</button>
        <button type="button">취소</button>
      </p>
    </Form>
  );
}