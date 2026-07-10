USE lancersnexus_mastercore;

ALTER TABLE finance_student_challans 
ADD COLUMN IF NOT EXISTS challan_no VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS tuition_fee DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS lab_fee DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS library_fee DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS other_fee DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS academic_year VARCHAR(20) NULL,
ADD COLUMN IF NOT EXISTS notes TEXT NULL;

-- Also update existing total_amount to equal amount if it's 0
UPDATE finance_student_challans SET total_amount = amount WHERE total_amount = 0 OR total_amount IS NULL;
