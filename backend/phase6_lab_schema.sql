USE lancersnexus_mastercore;

CREATE TABLE IF NOT EXISTS lab_inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity INT DEFAULT 0,
    status ENUM('Available', 'Low Stock', 'Maintenance', 'Depleted') DEFAULT 'Available',
    last_restock DATE,
    client_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES lancers_clients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lab_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(255) NOT NULL,
    instructor_name VARCHAR(255) NOT NULL,
    experiment_title VARCHAR(255) NOT NULL,
    schedule_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status ENUM('Scheduled', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
    client_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES lancers_clients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lab_safety_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    incident_type VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    reported_by INT NOT NULL,
    status ENUM('Resolved', 'Investigating', 'Reported') DEFAULT 'Reported',
    client_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES lancers_clients(id) ON DELETE CASCADE
);
