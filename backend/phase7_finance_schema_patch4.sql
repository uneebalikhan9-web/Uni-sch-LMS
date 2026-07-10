USE lancersnexus_mastercore;

ALTER TABLE finance_student_scholarships DROP FOREIGN KEY finance_student_scholarships_ibfk_2;
ALTER TABLE finance_student_scholarships DROP COLUMN scholarship_type_id;

ALTER TABLE finance_student_scholarships
ADD COLUMN IF NOT EXISTS scholarship_id INT NOT NULL,
ADD COLUMN IF NOT EXISTS semester_id INT NULL,
ADD COLUMN IF NOT EXISTS approved_amount DECIMAL(10,2) NULL;

ALTER TABLE finance_student_scholarships MODIFY COLUMN status ENUM('approved', 'pending', 'rejected', 'active', 'revoked', 'expired') DEFAULT 'pending';

-- Re-add foreign key for scholarship_id
ALTER TABLE finance_student_scholarships ADD CONSTRAINT fk_fss_scholarship FOREIGN KEY (scholarship_id) REFERENCES finance_scholarship_types(id) ON DELETE CASCADE;
