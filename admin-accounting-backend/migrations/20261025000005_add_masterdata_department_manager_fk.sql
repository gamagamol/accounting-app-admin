-- Add the department manager foreign key after masterdata_employee exists.
-- The department table is created first because employee references it, so this
-- constraint must be added in a later migration.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_department_manager'
          AND conrelid = 'masterdata_department'::regclass
    ) THEN
        ALTER TABLE masterdata_department
            ADD CONSTRAINT fk_department_manager
            FOREIGN KEY (manager_employee_id) REFERENCES masterdata_employee(id);
    END IF;
END $$;
