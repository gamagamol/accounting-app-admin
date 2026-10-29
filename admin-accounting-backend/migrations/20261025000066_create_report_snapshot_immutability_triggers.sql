-- Immutability guards for final report snapshots.
-- A snapshot header and its lines may be built as draft, but once the header
-- status becomes final, no update or delete is allowed.

CREATE OR REPLACE FUNCTION fn_block_final_report_snapshot()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'final' THEN
        RAISE EXCEPTION 'Report snapshot % is final and immutable', OLD.snapshot_number;
    END IF;
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_report_snapshot_immutable ON report_snapshot;
CREATE TRIGGER trg_report_snapshot_immutable
BEFORE UPDATE OR DELETE ON report_snapshot
FOR EACH ROW EXECUTE FUNCTION fn_block_final_report_snapshot();

CREATE OR REPLACE FUNCTION fn_block_final_snapshot_line()
RETURNS TRIGGER AS $$
DECLARE
    parent_id     BIGINT;
    parent_status VARCHAR(20);
BEGIN
    parent_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.snapshot_id ELSE NEW.snapshot_id END;
    SELECT status INTO parent_status FROM report_snapshot WHERE id = parent_id;

    IF parent_status = 'final' THEN
        RAISE EXCEPTION 'Lines of final report snapshot % are immutable', parent_id;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_report_snapshot_line_immutable ON report_snapshot_line;
CREATE TRIGGER trg_report_snapshot_line_immutable
BEFORE INSERT OR UPDATE OR DELETE ON report_snapshot_line
FOR EACH ROW EXECUTE FUNCTION fn_block_final_snapshot_line();
