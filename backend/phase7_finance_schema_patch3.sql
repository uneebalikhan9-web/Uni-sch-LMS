USE lancersnexus_mastercore;

ALTER TABLE finance_scholarship_types
ADD COLUMN IF NOT EXISTS type ENUM('merit', 'need_based', 'sports', 'other') DEFAULT 'merit',
ADD COLUMN IF NOT EXISTS fixed_amount DECIMAL(10,2) NULL,
ADD COLUMN IF NOT EXISTS min_cgpa_required DECIMAL(3,2) NULL,
ADD COLUMN IF NOT EXISTS max_family_income DECIMAL(12,2) NULL,
ADD COLUMN IF NOT EXISTS renewable TINYINT(1) DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_active TINYINT(1) DEFAULT 1;
