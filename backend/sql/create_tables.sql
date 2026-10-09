
-- ========================================
-- Australian Tech Job Market
-- Database Schema
-- ========================================

-- 1. Jobs table

CREATE TABLE IF NOT EXISTS jobs (
    job_id BIGINT PRIMARY KEY,

    title TEXT NOT NULL,
    company TEXT,
    description TEXT,

    location TEXT,
    city VARCHAR(100) NOT NULL DEFAULT 'Unknown',
    location_status VARCHAR(50),

    role_category VARCHAR(100) NOT NULL,
    classification_status VARCHAR(50),

    salary_min NUMERIC(12, 2),
    salary_max NUMERIC(12, 2),
    salary_unit VARCHAR(50),

    salary_annual_min NUMERIC(12, 2),
    salary_annual_max NUMERIC(12, 2),
    salary_midpoint NUMERIC(12, 2),
    salary_status VARCHAR(100),
    salary_is_usable BOOLEAN NOT NULL DEFAULT FALSE,
    salary_is_predicted BOOLEAN,

    skills TEXT,
    skill_count INTEGER NOT NULL DEFAULT 0,
    skills_source VARCHAR(100),
    skills_extraction_method VARCHAR(100),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_skill_count
        CHECK (skill_count >= 0),

    CONSTRAINT valid_salary_range
        CHECK (
            salary_annual_min IS NULL
            OR salary_annual_max IS NULL
            OR salary_annual_min <= salary_annual_max
        ),

    CONSTRAINT valid_role_category
        CHECK (
            role_category IN (
                'Software Engineer',
                'Data Analyst',
                'Frontend Developer',
                'Full Stack Developer',
                'IT Support',
                'Other'
            )
        )
);


-- 2. Skills table

CREATE TABLE IF NOT EXISTS skills (
    skill_id INTEGER GENERATED ALWAYS AS IDENTITY
        PRIMARY KEY,

    skill_name VARCHAR(100) NOT NULL UNIQUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT nonempty_skill_name
        CHECK (LENGTH(TRIM(skill_name)) > 0)
);


-- 3. Job-Skills relationship table

CREATE TABLE IF NOT EXISTS job_skills (
    job_id BIGINT NOT NULL,
    skill_id INTEGER NOT NULL,

    PRIMARY KEY (job_id, skill_id),

    CONSTRAINT fk_job
        FOREIGN KEY (job_id)
        REFERENCES jobs(job_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_skill
        FOREIGN KEY (skill_id)
        REFERENCES skills(skill_id)
        ON DELETE CASCADE
);


-- 4. Indexes for analytics queries

CREATE INDEX IF NOT EXISTS idx_jobs_role
    ON jobs(role_category);

CREATE INDEX IF NOT EXISTS idx_jobs_city
    ON jobs(city);

CREATE INDEX IF NOT EXISTS idx_jobs_role_city
    ON jobs(role_category, city);

CREATE INDEX IF NOT EXISTS idx_job_skills_skill_id
    ON job_skills(skill_id);
