ALTER TYPE "AttendanceStatus" ADD VALUE 'ON_TIME';

CREATE UNIQUE INDEX "Attendance_employeeId_date_key" ON "Attendance"("employeeId", "date");