-- Carry-forward + reschedule support: remember the first day a task was scheduled for,
-- so the original due date stays visible even after a task rolls over or is moved.

alter table va_tasks add column if not exists original_due_date date;

-- Backfill existing tasks: their current day becomes the recorded original.
update va_tasks set original_due_date = due_date
where original_due_date is null and due_date is not null;

create or replace function va_set_original_due() returns trigger language plpgsql as $$
begin
  -- Capture the first non-null due date; never overwrite it on later reschedules.
  if new.original_due_date is null and new.due_date is not null then
    new.original_due_date := new.due_date;
  end if;
  return new;
end $$;

drop trigger if exists va_tasks_set_original on va_tasks;
create trigger va_tasks_set_original before insert or update on va_tasks
  for each row execute function va_set_original_due();
