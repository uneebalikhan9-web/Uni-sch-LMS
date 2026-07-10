USE lancersnexus_mastercore;

-- Update finance_student_challans
ALTER TABLE finance_student_challans ADD COLUMN IF NOT EXISTS campus_id INT NULL;
ALTER TABLE finance_student_challans ADD COLUMN IF NOT EXISTS paid_date DATE NULL;
ALTER TABLE finance_student_challans MODIFY COLUMN status ENUM('unpaid', 'paid', 'overdue', 'pending') DEFAULT 'unpaid';

-- Add Foreign key if possible
-- ALTER TABLE finance_student_challans ADD CONSTRAINT fk_fsc_campus FOREIGN KEY (campus_id) REFERENCES lancers_clients(id) ON DELETE CASCADE;

-- Create missing finance tables
CREATE TABLE IF NOT EXISTS finance_fee_structures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    program_id INT NOT NULL,
    semester_id INT NOT NULL,
    fee_type VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    campus_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
    FOREIGN KEY (campus_id) REFERENCES lancers_clients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS finance_scholarship_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    discount_percentage DECIMAL(5,2) NOT NULL,
    campus_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campus_id) REFERENCES lancers_clients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS finance_student_scholarships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    scholarship_type_id INT NOT NULL,
    status ENUM('active', 'revoked', 'expired') DEFAULT 'active',
    campus_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (scholarship_type_id) REFERENCES finance_scholarship_types(id) ON DELETE CASCADE,
    FOREIGN KEY (campus_id) REFERENCES lancers_clients(id) ON DELETE CASCADE
);
