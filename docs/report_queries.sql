-- Monthly average grade by subject
SELECT s.name, DATE_TRUNC('month', g."createdAt") m, AVG(g.value) avg_grade
FROM "Grade" g JOIN "Subject" s ON s.id=g."subjectId"
GROUP BY s.name, m;

-- Frequently absent students
SELECT st.id, u."lastName", COUNT(*) absent_count
FROM "Attendance" a
JOIN "Student" st ON st.id=a."studentId"
JOIN "User" u ON u.id=st."userId"
WHERE a.status='ABSENT'
GROUP BY st.id, u."lastName"
ORDER BY absent_count DESC;
