-- 0. updated_at 자동 갱신 트리거 함수
DROP FUNCTION IF EXISTS update_timestamp();
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. 역할 테이블
DROP TABLE IF EXISTS role;
CREATE TABLE role (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    create_user VARCHAR(254),
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    update_user VARCHAR(254),
    is_deleted BOOLEAN DEFAULT FALSE
);
CREATE TRIGGER trg_role_update_timestamp BEFORE UPDATE ON role FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- 2. 권한 테이블
DROP TABLE IF EXISTS permission;
CREATE TABLE permission (
    permission_id SERIAL PRIMARY KEY,
    permission_name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    create_user VARCHAR(254),
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    update_user VARCHAR(254),
    is_deleted BOOLEAN DEFAULT FALSE
);
CREATE TRIGGER trg_permission_update_timestamp BEFORE UPDATE ON permission FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- 3. 역할-권한 매핑
DROP TABLE IF EXISTS role_permission;
CREATE TABLE role_permission (
    role_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    create_user VARCHAR(254),
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    update_user VARCHAR(254),
    is_deleted BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES role(role_id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permission(permission_id) ON DELETE CASCADE
);
CREATE TRIGGER trg_role_permission_update_timestamp BEFORE UPDATE ON role_permission FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- 4. 성별 테이블 (hard delete)
DROP TABLE IF EXISTS gender;
CREATE TABLE gender (
    gender_id INTEGER PRIMARY KEY,
    gender_title VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    create_user VARCHAR(254),
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    update_user VARCHAR(254)
);
CREATE TRIGGER trg_gender_update_timestamp BEFORE UPDATE ON gender FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- 5. 직급 테이블
DROP TABLE IF EXISTS position;
CREATE TABLE position (
    position_id INTEGER PRIMARY KEY,
    position_title VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    create_user VARCHAR(254),
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    update_user VARCHAR(254),
    is_deleted BOOLEAN DEFAULT FALSE
);
CREATE TRIGGER trg_position_update_timestamp BEFORE UPDATE ON position FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- 6. 주소 상위 테이블
DROP TABLE IF EXISTS address_high;
CREATE TABLE address_high (
    address_high_code INTEGER PRIMARY KEY,
    address_high_title VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    create_user VARCHAR(254),
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    update_user VARCHAR(254),
    is_deleted BOOLEAN DEFAULT FALSE
);
CREATE TRIGGER trg_address_high_update_timestamp BEFORE UPDATE ON address_high FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- 7. 주소 중간 테이블
DROP TABLE IF EXISTS address_mid;
CREATE TABLE address_mid (
    address_mid_code INTEGER PRIMARY KEY,
    address_mid_title VARCHAR(50) NOT NULL,
    address_high_code INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    create_user VARCHAR(254),
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    update_user VARCHAR(254),
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_address_mid_high FOREIGN KEY (address_high_code) REFERENCES address_high(address_high_code)
);
CREATE TRIGGER trg_address_mid_update_timestamp BEFORE UPDATE ON address_mid FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- 8. 주소 하위 테이블
DROP TABLE IF EXISTS address_low;
CREATE TABLE address_low (
    address_low_code INTEGER PRIMARY KEY,
    address_low_title VARCHAR(50) NOT NULL,
    address_mid_code INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    create_user VARCHAR(254),
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    update_user VARCHAR(254),
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_address_low_mid FOREIGN KEY (address_mid_code) REFERENCES address_mid(address_mid_code)
);
CREATE TRIGGER trg_address_low_update_timestamp BEFORE UPDATE ON address_low FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- 9. 부서 상위 테이블
DROP TABLE IF EXISTS department_high;
CREATE TABLE department_high (
    department_high_id INTEGER PRIMARY KEY,
    department_high_title VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    create_user VARCHAR(254),
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    update_user VARCHAR(254),
    is_deleted BOOLEAN DEFAULT FALSE
);
CREATE TRIGGER trg_department_high_update_timestamp BEFORE UPDATE ON department_high FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- 10. 부서 중간 테이블
DROP TABLE IF EXISTS department_mid;
CREATE TABLE department_mid (
    department_mid_id INTEGER PRIMARY KEY,
    department_mid_title VARCHAR(50) NOT NULL,
    department_high_id INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    create_user VARCHAR(254),
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    update_user VARCHAR(254),
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_department_mid_high FOREIGN KEY (department_high_id) REFERENCES department_high(department_high_id)
);
CREATE TRIGGER trg_department_mid_update_timestamp BEFORE UPDATE ON department_mid FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- 11. 부서 하위 테이블
DROP TABLE IF EXISTS department_low;
CREATE TABLE department_low (
    department_low_id INTEGER PRIMARY KEY,
    department_low_title VARCHAR(50) NOT NULL,
    department_mid_id INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    create_user VARCHAR(254),
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    update_user VARCHAR(254),
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_department_low_mid FOREIGN KEY (department_mid_id) REFERENCES department_mid(department_mid_id)
);
CREATE TRIGGER trg_department_low_update_timestamp BEFORE UPDATE ON department_low FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- 12. 로그인 정보
DROP TABLE IF EXISTS login_info;
CREATE TABLE login_info (
    login_id SERIAL PRIMARY KEY,
    email VARCHAR(254) UNIQUE NOT NULL,
    pw_hash VARCHAR(100) NOT NULL,
    login_fail_count INTEGER DEFAULT 0,
    last_login TIMESTAMPTZ,
    role_id INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    create_user VARCHAR(254),
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    update_user VARCHAR(254),
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_logininfo_role FOREIGN KEY (role_id) REFERENCES role(role_id) ON DELETE RESTRICT
);
CREATE TRIGGER trg_login_info_update_timestamp BEFORE UPDATE ON login_info FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- 13. 사용자 정보
DROP TABLE IF EXISTS user_info;
CREATE TABLE user_info (
    user_info_id SERIAL PRIMARY KEY,
    login_id INTEGER NOT NULL UNIQUE,
    email VARCHAR(254) NOT NULL UNIQUE,
    first_name VARCHAR(15) NOT NULL,
    last_name VARCHAR(20) NOT NULL,
    first_name_kana VARCHAR(20) NOT NULL,
    last_name_kana VARCHAR(25) NOT NULL,
    birth_date DATE NOT NULL,
    nationality VARCHAR(50) NOT NULL,
    gender_id INTEGER NOT NULL,
    phone_number VARCHAR(11) NOT NULL,
    employee_number VARCHAR(10) NOT NULL UNIQUE,
    position_id INTEGER NOT NULL,
    address_low_code INTEGER NOT NULL,
    department_low_id INTEGER NOT NULL,
    preference TEXT,
    skills TEXT,
    skill_start_date DATE,
    career_start_date DATE,
    salary INTEGER,
    foreigner TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    create_user VARCHAR(254),
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    update_user VARCHAR(254),
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_user_login FOREIGN KEY (login_id) REFERENCES login_info(login_id) ON DELETE CASCADE,
    CONSTRAINT fk_user_gender FOREIGN KEY (gender_id) REFERENCES gender(gender_id) ON DELETE RESTRICT,
    CONSTRAINT fk_user_position FOREIGN KEY (position_id) REFERENCES position(position_id),
    CONSTRAINT fk_user_address FOREIGN KEY (address_low_code) REFERENCES address_low(address_low_code),
    CONSTRAINT fk_user_department FOREIGN KEY (department_low_id) REFERENCES department_low(department_low_id)
);
CREATE TRIGGER trg_user_info_update_timestamp BEFORE UPDATE ON user_info FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- 14. 사용자별 권한 부여
DROP TABLE IF EXISTS user_permission;
CREATE TABLE user_permission (
    login_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    create_user VARCHAR(254),
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    update_user VARCHAR(254),
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT pk_user_permission PRIMARY KEY (login_id, permission_id),
    CONSTRAINT fk_user_permission_user FOREIGN KEY (login_id) REFERENCES login_info(login_id) ON DELETE CASCADE,
    CONSTRAINT fk_user_permission_permission FOREIGN KEY (permission_id) REFERENCES permission(permission_id) ON DELETE CASCADE
);
CREATE TRIGGER trg_user_permission_update_timestamp BEFORE UPDATE ON user_permission FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- 15. 사용자 전체 주소 뷰
CREATE OR REPLACE VIEW user_with_address AS
SELECT
    u.user_info_id,
    u.email,
    u.first_name,
    u.last_name,
    CONCAT_WS(' ',
        ah.address_high_title,
        am.address_mid_title,
        al.address_low_title
    ) AS full_address,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, u.skill_start_date)) AS skill_years,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, u.career_start_date)) AS career_years
FROM user_info u
JOIN login_info l ON u.login_id = l.login_id AND l.is_deleted = FALSE
JOIN address_low al ON u.address_low_code = al.address_low_code AND al.is_deleted = FALSE
JOIN address_mid am ON al.address_mid_code = am.address_mid_code AND am.is_deleted = FALSE
JOIN address_high ah ON am.address_high_code = ah.address_high_code AND ah.is_deleted = FALSE
WHERE u.is_deleted = FALSE;

-- 16. 사용자 부서 뷰
CREATE OR REPLACE VIEW view_user_department AS
SELECT
    u.user_info_id,
    u.email,
    u.first_name,
    u.last_name,
    dh.department_high_title AS 본부,
    dm.department_mid_title AS 부서,
    dl.department_low_title AS 팀,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, u.skill_start_date)) AS skill_years,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, u.career_start_date)) AS career_years
FROM user_info u
JOIN login_info l ON u.login_id = l.login_id AND l.is_deleted = FALSE
JOIN department_low dl ON u.department_low_id = dl.department_low_id AND dl.is_deleted = FALSE
JOIN department_mid dm ON dl.department_mid_id = dm.department_mid_id AND dm.is_deleted = FALSE
JOIN department_high dh ON dm.department_high_id = dh.department_high_id AND dh.is_deleted = FALSE
WHERE u.is_deleted = FALSE;

-- 17. 자격증 정보 마스터
DROP TABLE IF EXISTS certificate_info;
CREATE TABLE certificate_info (
    cert_id SERIAL PRIMARY KEY,
    cert_name VARCHAR(100) NOT NULL,
    cert_level VARCHAR(50),
    cert_level_rank INTEGER,
    cert_level_desc TEXT,
    issuer VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    create_user VARCHAR(254),
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    update_user VARCHAR(254),
    is_deleted BOOLEAN DEFAULT FALSE
);
CREATE TRIGGER trg_certificate_info_update_timestamp BEFORE UPDATE ON certificate_info FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- 18. 점수 랭킹 테이블
DROP TABLE IF EXISTS certificate_rank_info;
CREATE TABLE certificate_rank_info (
    cert_rank_id SERIAL PRIMARY KEY,
    cert_id INTEGER NOT NULL,
    score INTEGER NOT NULL,
    score_rank_value INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    create_user VARCHAR(254),
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    update_user VARCHAR(254),
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_cert_rank_cert FOREIGN KEY (cert_id) REFERENCES certificate_info(cert_id),
    UNIQUE(cert_id, score)
);
CREATE TRIGGER trg_certificate_rank_info_update_timestamp BEFORE UPDATE ON certificate_rank_info FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- 19. 사용자 자격증
DROP TABLE IF EXISTS user_certificate;
CREATE TABLE user_certificate (
    user_certificate_id SERIAL PRIMARY KEY,
    employee_number VARCHAR(10) NOT NULL,
    cert_id INTEGER NOT NULL,
    issue_date DATE NOT NULL,
    expire_date DATE,
    score INTEGER,
    is_expired BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    create_user VARCHAR(254),
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    update_user VARCHAR(254),
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT unique_user_cert UNIQUE (employee_number, cert_id),
    CONSTRAINT fk_user_cert_employee FOREIGN KEY (employee_number) REFERENCES user_info(employee_number) ON DELETE CASCADE,
    CONSTRAINT fk_user_cert_cert FOREIGN KEY (cert_id) REFERENCES certificate_info(cert_id)
);
CREATE TRIGGER trg_user_certificate_update_timestamp BEFORE UPDATE ON user_certificate FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- 19-1. 자격증 만료 여부 자동 설정 트리거
DROP FUNCTION IF EXISTS check_certificate_expired();
CREATE OR REPLACE FUNCTION check_certificate_expired()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_deleted = FALSE THEN
        NEW.is_expired := (NEW.expire_date IS NOT NULL AND NEW.expire_date < CURRENT_DATE);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_check_certificate_expired
BEFORE INSERT OR UPDATE ON user_certificate
FOR EACH ROW
EXECUTE FUNCTION check_certificate_expired();

-- 19-2. 소프트 삭제 전파 (user_info → login_info, user_certificate, user_language_proficiency)
DROP FUNCTION IF EXISTS propagate_soft_delete_user_info();
CREATE OR REPLACE FUNCTION propagate_soft_delete_user_info()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_deleted = TRUE AND OLD.is_deleted = FALSE THEN
        UPDATE login_info
        SET is_deleted = TRUE,
            updated_at = CURRENT_TIMESTAMP,
            update_user = NEW.update_user
        WHERE login_id = NEW.login_id AND is_deleted = FALSE;
        UPDATE user_certificate
        SET is_deleted = TRUE,
            updated_at = CURRENT_TIMESTAMP,
            update_user = NEW.update_user
        WHERE employee_number = NEW.employee_number AND is_deleted = FALSE;
        UPDATE user_language_proficiency
        SET is_deleted = TRUE,
            updated_at = CURRENT_TIMESTAMP,
            update_user = NEW.update_user
        WHERE employee_number = NEW.employee_number AND is_deleted = FALSE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_user_info_soft_delete
BEFORE UPDATE OF is_deleted ON user_info
FOR EACH ROW
WHEN (OLD.is_deleted = FALSE AND NEW.is_deleted = TRUE)
EXECUTE FUNCTION propagate_soft_delete_user_info();

-- 20. 사용자 자격증 오버뷰 뷰
CREATE OR REPLACE VIEW user_cert_overview AS
SELECT
    u.employee_number,
    u.first_name,
    u.last_name,
    u.email,
    ci.cert_name,
    ci.cert_level,
    ci.cert_level_rank,
    ci.cert_level_desc,
    ci.issuer,
    uc.issue_date,
    uc.expire_date,
    uc.score,
    uc.is_expired,
    cri.score_rank_value,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, u.skill_start_date)) AS skill_years,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, u.career_start_date)) AS career_years
FROM user_certificate uc
JOIN user_info u ON uc.employee_number = u.employee_number AND u.is_deleted = FALSE
JOIN login_info l ON u.login_id = l.login_id AND l.is_deleted = FALSE
JOIN certificate_info ci ON uc.cert_id = ci.cert_id AND ci.is_deleted = FALSE
LEFT JOIN certificate_rank_info cri ON ci.cert_id = cri.cert_id AND uc.score = cri.score AND cri.is_deleted = FALSE
WHERE uc.is_deleted = FALSE;

-- 21. 회화 능력 마스터
DROP TABLE IF EXISTS language_proficiency_type;
CREATE TABLE language_proficiency_type (
    proficiency_id SERIAL PRIMARY KEY,
    proficiency_level VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    create_user VARCHAR(254),
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    update_user VARCHAR(254),
    is_deleted BOOLEAN DEFAULT FALSE
);
CREATE TRIGGER trg_language_proficiency_type_update_timestamp BEFORE UPDATE ON language_proficiency_type FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- 22. 사용자 회화 능력
DROP TABLE IF EXISTS user_language_proficiency;
CREATE TABLE user_language_proficiency (
    user_lang_id SERIAL PRIMARY KEY,
    employee_number VARCHAR(10) NOT NULL,
    language VARCHAR(50) NOT NULL,
    proficiency_id INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    create_user VARCHAR(254),
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    update_user VARCHAR(254),
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_user_proficiency_employee FOREIGN KEY (employee_number) REFERENCES user_info(employee_number) ON DELETE CASCADE,
    CONSTRAINT fk_user_proficiency_type FOREIGN KEY (proficiency_id) REFERENCES language_proficiency_type(proficiency_id)
);
CREATE TRIGGER trg_user_language_proficiency_update_timestamp BEFORE UPDATE ON user_language_proficiency FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- 23. 사용자 회화 능력 오버뷰 뷰
CREATE OR REPLACE VIEW user_language_proficiency_overview AS
SELECT
    u.employee_number,
    u.first_name,
    u.last_name,
    u.email,
    ul.language,
    pt.proficiency_level,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, u.skill_start_date)) AS skill_years,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, u.career_start_date)) AS career_years
FROM user_language_proficiency ul
JOIN user_info u ON ul.employee_number = u.employee_number AND u.is_deleted = FALSE
JOIN login_info l ON u.login_id = l.login_id AND l.is_deleted = FALSE
JOIN language_proficiency_type pt ON ul.proficiency_id = pt.proficiency_id AND pt.is_deleted = FALSE
WHERE ul.is_deleted = FALSE;

-- 인덱스 추가 (성능 최적화)
CREATE INDEX idx_user_info_login_id ON user_info(login_id);
CREATE INDEX idx_user_info_employee_number ON user_info(employee_number);