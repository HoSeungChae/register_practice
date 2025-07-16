// app/utils/db.server.ts
import { Pool } from "pg";

// 본인의 DB 연결 정보에 맞게 수정해주세요!
export const db = new Pool({
  host: "localhost",
  port: 5432,
  user: "myuser",
  password: "0756", // 꼭 바꿔주세요!
  database: "skill_web",
});
