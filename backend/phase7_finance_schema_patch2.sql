USE lancersnexus_mastercore;

DROP TABLE IF EXISTS finance_fee_structures;

CREATE TABLE finance_fee_structures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    program_id INT NULL,
    semester_id INT NULL,
    per_credit_hour_fee DECIMAL(10,2) DEFAULT 5000,
    registration_fee DECIMAL(10,2) DEFAULT 2000,
    exam_fee DECIMAL(10,2) DEFAULT 1000,
    lab_fee_per_credit DECIMAL(10,2) DEFAULT 1500,
    security_deposit DECIMAL(10,2) DEFAULT 0,
    late_fee_per_day DECIMAL(10,2) DEFAULT 100,
    effective_from DATE NULL,
    is_active TINYINT(1) DEFAULT 1,
    campus_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
    FOREIGN KEY (campus_id) REFERENCES lancers_clients(id) ON DELETE CASCADE
);
