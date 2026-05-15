-- Prevent duplicate payroll records for the same employee/month/year.
DELETE FROM "Payroll"
WHERE "id" IN (
  SELECT "id"
  FROM (
    SELECT
      "id",
      ROW_NUMBER() OVER (
        PARTITION BY "employeeId", "month", "year"
        ORDER BY "createdAt" ASC
      ) AS row_number
    FROM "Payroll"
  ) duplicates
  WHERE duplicates.row_number > 1
);

CREATE UNIQUE INDEX "Payroll_employeeId_month_year_key" ON "Payroll"("employeeId", "month", "year");
