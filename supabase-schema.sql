-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query)

CREATE TABLE entries (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at            timestamptz NOT NULL DEFAULT now(),
  task                  text        NOT NULL,
  my_approach           text        NOT NULL,
  approach_committed_at timestamptz NOT NULL DEFAULT now(),
  ai_approach           text,
  lesson                text,
  tags                  text[]      NOT NULL DEFAULT '{}'
);

ALTER TABLE entries
  ADD CONSTRAINT stage2_requires_commit
  CHECK (
    approach_committed_at IS NOT NULL
    OR (ai_approach IS NULL AND lesson IS NULL)
  );

-- Row Level Security: only the authenticated user can see/edit their own entries.
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner access"
  ON entries
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
