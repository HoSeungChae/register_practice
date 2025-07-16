import type { 
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useLoaderData, } from "@remix-run/react";
import invariant from "tiny-invariant";
import { getContact,updateContact } from "../data";
import { useState } from "react";


export const action = async ({
params,
request,
}: ActionFunctionArgs) => {
invariant(params.contactId, "Missing contactId param");
const formData = await request.formData();
const updates = Object.fromEntries(formData);
await updateContact(params.contactId, updates);
return redirect(`/contacts/${params.contactId}`);
};

const departmentOptions: Record<string, string[]> = {
"개발본부": ["제1개발부", "제2개발부", "한국지사", "교육그룹", "AI솔루션그룹"],
"ICT본부": ["제1그룹", "제2그룹", "제3그룹", "제4그룹"],
"사회인프라사업부": ["설계·품질그룹","토호쿠사업소","후쿠오카사업소","스마트에너지솔루션부"],
"경영지원실":["인사그룹","경리그룹","총무그룹"],
"영업본부":["영업본부"],
"품질관리부":["품질관리부"],
};


export const loader = async ({
params,
}: LoaderFunctionArgs) => {
invariant(params.contactId, "Missing contactId param");
const contact = await getContact(params.contactId);
if (!contact) {
  throw new Response("Not Found", { status: 404 });
}
return { contact };
};

export default function EditContact() {
const { contact } = useLoaderData<typeof loader>();
const [upperDept, setUpperDept] = useState(contact.upper_department || "");
const [lowerDept, setLowerDept] = useState(contact.lower_department || "");

return (
  <Form key={contact.id} id="contact-form" method="post">
    <p>
      <span>Name</span>
      <input
        aria-label="First name"
        defaultValue={contact.first}
        name="first"
        placeholder="First"
        type="text"
      />
      <input
        aria-label="Last name"
        defaultValue={contact.last}
        name="last"
        placeholder="Last"
        type="text"
      />
    </p>
    <p>
      <span>Name Kana</span>
      <input
        aria-label="First name Kana"
        defaultValue={contact.first_kana}
        name="first_kana"
        placeholder="First Kana"
        type="text"
      />
      <input
        aria-label="Last name Kana"
        defaultValue={contact.last_kana}
        name="last_kana"
        placeholder="Last Kana"
        type="text"
      />
    </p>
    <label>
      <span>Avatar URL</span>
      <input
        aria-label="Avatar URL"
        defaultValue={contact.avatar}
        name="avatar"
        placeholder="https://example.com/avatar.jpg"
        type="text"
      />
    </label>
    <label>
      <span>Twitter</span>
      <input
        defaultValue={contact.twitter}
        name="twitter"
        placeholder="@jack"
        type="text"
      />
    </label>
    <label>
      <span>Nationality</span>
      <input
        defaultValue={contact.nationality}
        name="nationality"
        placeholder="Korea"
        type="text"
      />
    </label>
    <label>
      <span>Birth</span>
      <input
        defaultValue={contact.birth}
        name="birth"
        type="date"
      />
    </label>
    <fieldset style={{ border: "none", padding: 0, marginBottom: "1rem" }}>
<legend style={{ marginBottom: "0.5rem"}}>Gender</legend>
<div style={{ display: "flex", gap: "1rem" }}>
  <label style={{ display: "inline-flex", alignItems: "center" }}>
    <input
      type="radio"
      name="gender"
      value="male"
      defaultChecked={contact.gender === "male"}
    />
    <span style={{ marginLeft: "0.3rem" }}>Male</span>
  </label>
  <label style={{ display: "inline-flex", alignItems: "center" }}>
    <input
      type="radio"
      name="gender"
      value="female"
      defaultChecked={contact.gender === "female"}
    />
    <span style={{ marginLeft: "0.3rem" }}>Female</span>
  </label>
  <label style={{ display: "inline-flex", alignItems: "center" }}>
    <input
      type="radio"
      name="gender"
      value="others"
      defaultChecked={contact.gender === "others"}
    />
    <span style={{ marginLeft: "0.3rem" }}>Others</span>
  </label>
</div>
</fieldset>
    <label>
      <span>Phone number</span>
      <input
        defaultValue={contact.phonenumber}
        name="phonenumber"
        placeholder="08012345678"
        type="tel"
      />
    </label>
    <label>
      <span>Employee number</span>
      <input
        defaultValue={contact.employee_number}
        name="employee_number"
        type="number"
      />
    </label>
    <fieldset style={{ border: "none", padding: 0, marginBottom: "1rem" }}>
<legend style={{ marginBottom: "0.5rem" ,marginLeft:"-0.3rem" }}>Position</legend>
<div style={{ display: "flex", gap: "1rem" }}>
  <label style={{ display: "inline-flex", alignItems: "center" }}>
    <input
      type="radio"
      name="position"
      value="staff"
      defaultChecked={contact.position === "staff"}
    />
    <span style={{ marginLeft: "0.3rem" }}>사원</span>
  </label>
  <label style={{ display: "inline-flex", alignItems: "center" }}>
    <input
      type="radio"
      name="position"
      value="assistant_manager"
      defaultChecked={contact.position === "assistant_manager"}
    />
    <span style={{ marginLeft: "0.3rem" }}>주임</span>
  </label>
  <label style={{ display: "inline-flex", alignItems: "center" }}>
    <input
      type="radio"
      name="position"
      value="manager"
      defaultChecked={contact.position === "manager"}
    />
    <span style={{ marginLeft: "0.3rem" }}>대리</span>
  </label>
  <label style={{ display: "inline-flex", alignItems: "center" }}>
    <input
      type="radio"
      name="position"
      value="senior_manager"
      defaultChecked={contact.position === "senior_manager"}
    />
    <span style={{ marginLeft: "0.3rem" }}>과장</span>
  </label>
  <label style={{ display: "inline-flex", alignItems: "center" }}>
    <input
      type="radio"
      name="position"
      value="deputy_general_manager"
      defaultChecked={contact.position === "deputy_general_manager"}
    />
    <span style={{ marginLeft: "0.3rem" }}>차장</span>
  </label>
  <label style={{ display: "inline-flex", alignItems: "center" }}>
    <input
      type="radio"
      name="position"
      value="general_manager"
      defaultChecked={contact.position === "general_manager"}
    />
    <span style={{ marginLeft: "0.3rem" }}>부장</span>
  </label>
</div>
</fieldset>
    <label>
      <span>Address</span>
      <input
        defaultValue={contact.address}
        name="address"
        type="text"
      />
    </label>
<div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1rem" }}>
<label>
  <span>Main department</span><br />
  <select
    name="upper_department"
    value={upperDept}
    onChange={(e) => {
      setUpperDept(e.target.value);
      setLowerDept("");
    }}
  >
    <option value="">Choose</option>
    {Object.keys(departmentOptions).map((dept) => (
      <option key={dept} value={dept}>{dept}</option>
    ))}
  </select>
</label>
{upperDept && (
  <label>
    <span>sub department</span><br />
    <select
      name="lower_department"
      value={lowerDept}
      onChange={(e) => setLowerDept(e.target.value)}
    >
      <option value="">Choose</option>
      {departmentOptions[upperDept].map((sub) => (
        <option key={sub} value={sub}>{sub}</option>
      ))}
    </select>
   </label>
    )}
  </div>
  <label>
      <span>Career start date</span>
      <input
        defaultValue={contact.career_start_date}
        name="career_start_date"
        type="date"
      />
    </label>
    <label>
      <span>Notes</span>
      <textarea
        defaultValue={contact.notes}
        name="notes"
        rows={6}
      />
    </label>
    <label>
      <span>Description</span>
      <textarea
        defaultValue={contact.description}
        name="description"
        rows={18}
      />
    </label>
    <p>
      <button type="submit">Save</button>
      <button type="button">Cancel</button>
    </p>
  </Form>
);
}