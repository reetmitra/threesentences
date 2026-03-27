# C8: Group Message RLS Policy Gap

## Current State

### Messages SELECT policy (`supabase/schema.sql:165`)
```sql
CREATE POLICY "messages_select" ON public.messages
FOR SELECT USING (auth.jwt() ->> 'sub' IN (sender_id, receiver_id));
```

This only checks `sender_id` and `receiver_id`. For group messages:
- `receiver_id IS NULL` (by the `message_target` constraint on line 75-78)
- `group_id IS NOT NULL`

So the `IN (sender_id, receiver_id)` check fails for anyone who isn't the sender, because `receiver_id` is NULL and `NULL IN (...)` is never true.

**Result**: Group messages are invisible to all non-senders.

### Messages UPDATE policy (`schema.sql:167`)
```sql
CREATE POLICY "messages_update" ON public.messages
FOR UPDATE USING (auth.jwt() ->> 'sub' = receiver_id);
```

Only `receiver_id` can update (mark as read). For group messages, `receiver_id IS NULL`, so nobody can mark group messages as read.

### Group members DELETE policy (`schema.sql:162`)
```sql
CREATE POLICY "group_members_delete" ON public.group_members
FOR DELETE USING (auth.jwt() ->> 'sub' = user_id);
```

A member can only delete themselves. Group owners/admins cannot remove other members. The `groups_delete` policy only allows the `created_by` user to delete the group itself.

## Target State

1. Group messages readable by all group members
2. Group messages markable as read by any group member
3. Group admins can remove members

## Files to Modify

| File | Change |
|------|--------|
| `supabase/schema.sql` | Update RLS policies (for reference) |
| Supabase Dashboard / Migration | Execute policy changes |

## SQL Implementation

### Step 1: Drop existing message policies

```sql
DROP POLICY IF EXISTS "messages_select" ON public.messages;
DROP POLICY IF EXISTS "messages_update" ON public.messages;
```

### Step 2: Create new message SELECT policy

```sql
CREATE POLICY "messages_select" ON public.messages
FOR SELECT USING (
    -- DM: user is sender or receiver
    auth.jwt() ->> 'sub' IN (sender_id, receiver_id)
    OR
    -- Group: user is a member of the group
    (
        group_id IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM public.group_members
            WHERE group_members.group_id = messages.group_id
            AND group_members.user_id = auth.jwt() ->> 'sub'
        )
    )
);
```

### Step 3: Create new message UPDATE policy

```sql
CREATE POLICY "messages_update" ON public.messages
FOR UPDATE USING (
    -- DM: receiver can mark as read
    auth.jwt() ->> 'sub' = receiver_id
    OR
    -- Group: any member except sender can mark as read
    (
        group_id IS NOT NULL
        AND auth.jwt() ->> 'sub' != sender_id
        AND EXISTS (
            SELECT 1 FROM public.group_members
            WHERE group_members.group_id = messages.group_id
            AND group_members.user_id = auth.jwt() ->> 'sub'
        )
    )
);
```

### Step 4: Fix group_members DELETE policy

```sql
DROP POLICY IF EXISTS "group_members_delete" ON public.group_members;

CREATE POLICY "group_members_delete" ON public.group_members
FOR DELETE USING (
    -- Member can remove themselves
    auth.jwt() ->> 'sub' = user_id
    OR
    -- Group admin can remove members
    EXISTS (
        SELECT 1 FROM public.group_members gm
        WHERE gm.group_id = group_members.group_id
        AND gm.user_id = auth.jwt() ->> 'sub'
        AND gm.role = 'admin'
    )
    OR
    -- Group creator can remove anyone
    EXISTS (
        SELECT 1 FROM public.groups
        WHERE groups.id = group_members.group_id
        AND groups.created_by = auth.jwt() ->> 'sub'
    )
);
```

### Step 5: Update schema.sql for future reference

Update the policy definitions in `supabase/schema.sql` to match the new policies, so the file stays in sync with the live DB.

## Performance Note

The `EXISTS (SELECT 1 FROM group_members ...)` subquery runs per-row during RLS evaluation. With the existing index `idx_group_members_group_id` and `idx_group_members_user_id`, this is an index lookup — fast.

For high-volume message tables, consider adding a composite index:
```sql
CREATE INDEX idx_group_members_group_user ON public.group_members(group_id, user_id);
```

## Testing

1. **DM visibility unchanged**: User A sends DM to User B → both can read → User C cannot read
2. **Group message visible to members**: User A sends to group → all group members can SELECT → non-members cannot
3. **Group message read marking**: Group member (not sender) can UPDATE `is_read` → non-member cannot
4. **Admin member removal**: Group admin can DELETE another member's row → regular member cannot DELETE another member
5. **Self-removal**: Any member can DELETE their own group_members row
6. **Performance**: Run `EXPLAIN ANALYZE` on a message SELECT with group_id filter to verify index usage

### Test via Supabase SQL Editor
```sql
-- Impersonate a group member
SET request.jwt.claim.sub = 'user_id_of_group_member';
SELECT * FROM messages WHERE group_id = 'some-group-id';
-- Should return rows

-- Impersonate a non-member
SET request.jwt.claim.sub = 'user_id_not_in_group';
SELECT * FROM messages WHERE group_id = 'some-group-id';
-- Should return 0 rows
```
