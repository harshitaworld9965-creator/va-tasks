-- VA task tracker. Tables are prefixed va_ so this can also live in a shared project.

create table if not exists va_tasks (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  notes         text,
  due_date      date,          -- null = unscheduled
  reminder_time time,          -- null = no reminder; only meaningful with due_date
  done          boolean not null default false,
  done_at       timestamptz,
  recurrence    text,          -- null for now; reserved for 'daily' | 'weekly' | ... later
  created_by    uuid references auth.users(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists va_tasks_due_date_idx on va_tasks (due_date) where done = false;

create or replace function va_touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  if new.done and not old.done then new.done_at = now(); end if;
  if not new.done then new.done_at = null; end if;
  return new;
end $$;

drop trigger if exists va_tasks_touch on va_tasks;
create trigger va_tasks_touch before update on va_tasks
  for each row execute function va_touch_updated_at();

-- Shared workspace: any signed-in user (you + the person you assist) sees and edits everything.
alter table va_tasks enable row level security;

drop policy if exists "va_tasks_authenticated_all" on va_tasks;
create policy "va_tasks_authenticated_all" on va_tasks
  for all to authenticated using (true) with check (true);

-- Overdue = past its day and still not done. Computed on read, never stored.
create or replace view va_overdue_tasks as
  select *, to_char(due_date, 'YYYY-MM') as month_key
  from va_tasks
  where done = false and due_date < current_date;
