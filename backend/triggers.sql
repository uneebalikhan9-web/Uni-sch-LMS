DELIMITER //

CREATE TRIGGER trg_update_section_enrolled_insert
  AFTER INSERT ON enrollment_registrations
  FOR EACH ROW
BEGIN
  IF NEW.status = 'enrolled' THEN
    UPDATE course_sections SET current_enrolled = current_enrolled + 1 WHERE id = NEW.section_id;
    UPDATE course_sections SET
      status = CASE
        WHEN current_enrolled >= max_capacity THEN 'full'
        ELSE 'open'
      END
    WHERE id = NEW.section_id;
  END IF;
END //

CREATE TRIGGER trg_update_section_enrolled_update
  AFTER UPDATE ON enrollment_registrations
  FOR EACH ROW
BEGIN
  IF OLD.status = 'enrolled' AND NEW.status IN ('dropped', 'withdrawn') THEN
    UPDATE course_sections SET
      current_enrolled = GREATEST(0, current_enrolled - 1)
    WHERE id = NEW.section_id;
    UPDATE course_sections SET
      status = CASE WHEN current_enrolled < max_capacity THEN 'open' ELSE status END
    WHERE id = NEW.section_id;
  END IF;
END //

DELIMITER ;
