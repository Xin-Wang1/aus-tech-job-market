-- =========================================
-- Australian Tech Job Market
-- Analytics Queries
-- =========================================

-- 1. Job Distribution
SELECT
    role_category,
    COUNT(*) AS job_count
FROM jobs
GROUP BY role_category
ORDER BY job_count DESC;

-- 2. City Distribution
SELECT
    city,
    COUNT(*) AS job_count
FROM jobs
GROUP BY city
ORDER BY job_count DESC, city;


SELECT
    city,
    COUNT(*) AS job_count,
    ROUND(
        COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (),
        2
    ) AS percentage
FROM jobs
GROUP BY city
ORDER BY job_count DESC, city;

-- 3. Role by City
SELECT
    city,
    role_category,
    COUNT(*) AS job_count
FROM jobs
WHERE city <> 'Unknown'
GROUP BY city, role_category
ORDER BY city, job_count DESC, role_category;


SELECT
    role_category,
    COUNT(*) AS job_count
FROM jobs
WHERE city = 'Melbourne'
GROUP BY role_category
ORDER BY job_count DESC;


SELECT
    s.skill_name,
    COUNT(DISTINCT js.job_id) AS job_count
FROM skills AS s
JOIN job_skills AS js
    ON s.skill_id = js.skill_id
GROUP BY s.skill_id, s.skill_name
ORDER BY job_count DESC, s.skill_name
LIMIT 10;


SELECT
    j.role_category,
    s.skill_name,
    COUNT(DISTINCT j.job_id) AS job_count
FROM jobs AS j
JOIN job_skills AS js
    ON j.job_id = js.job_id
JOIN skills AS s
    ON js.skill_id = s.skill_id
GROUP BY
    j.role_category,
    s.skill_name
ORDER BY
    j.role_category,
    job_count DESC,
    s.skill_name;


SELECT
    s.skill_name,
    COUNT(DISTINCT j.job_id) AS job_count
FROM jobs AS j
JOIN job_skills AS js
    ON j.job_id = js.job_id
JOIN skills AS s
    ON js.skill_id = s.skill_id
WHERE j.role_category = 'Frontend Developer'
GROUP BY s.skill_id, s.skill_name
ORDER BY job_count DESC, s.skill_name;


SELECT
    job_id,
    COUNT(*) AS duplicate_count
FROM jobs
GROUP BY job_id
HAVING COUNT(*) > 1;


SELECT
    COUNT(*) AS jobs_without_skills
FROM jobs AS j
LEFT JOIN job_skills AS js
    ON j.job_id = js.job_id
WHERE js.job_id IS NULL;


SELECT
    COUNT(*) AS unknown_city_jobs
FROM jobs
WHERE city = 'Unknown';


SELECT
    COUNT(*) AS total_jobs,
    COUNT(*) FILTER (
        WHERE salary_is_usable = TRUE
    ) AS usable_salary_jobs,
    ROUND(
        100.0 * COUNT(*) FILTER (
            WHERE salary_is_usable = TRUE
        ) / NULLIF(COUNT(*), 0),
        2
    ) AS salary_coverage_percentage
FROM jobs;


SELECT
    j.job_id,
    j.title,
    j.skill_count AS recorded_count,
    COUNT(js.skill_id) AS actual_count
FROM jobs AS j
LEFT JOIN job_skills AS js
    ON j.job_id = js.job_id
GROUP BY j.job_id, j.title, j.skill_count
HAVING j.skill_count <> COUNT(js.skill_id);

