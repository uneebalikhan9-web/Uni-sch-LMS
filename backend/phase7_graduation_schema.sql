USE lancersnexus_mastercore;

CREATE TABLE IF NOT EXISTS program_graduation_policies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    program_id INT NOT NULL,
    required_credits DECIMAL(6,2) DEFAULT 0,
    minimum_cgpa DECIMAL(4,3) DEFAULT 0,
    mandatory_courses TEXT NULL,
    graduation_fee DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
);
