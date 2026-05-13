-- ============================================================
-- 0021 · Fix auth.users tokens NULL (quebra gotrue listUsers/login)
-- Seeds antigos (seed-demo.sql) inseriam users com tokens NULL.
-- Em versões novas do gotrue, scan de NULL em colunas texto quebra
-- a serialização e retorna 500 "Database error finding users".
-- ============================================================

update auth.users
   set confirmation_token         = coalesce(confirmation_token, ''),
       recovery_token             = coalesce(recovery_token, ''),
       email_change_token_current = coalesce(email_change_token_current, ''),
       email_change_token_new     = coalesce(email_change_token_new, ''),
       email_change               = coalesce(email_change, ''),
       phone_change               = coalesce(phone_change, ''),
       phone_change_token         = coalesce(phone_change_token, ''),
       reauthentication_token     = coalesce(reauthentication_token, '')
 where confirmation_token         is null
    or recovery_token             is null
    or email_change_token_current is null
    or email_change_token_new     is null
    or email_change               is null
    or phone_change               is null
    or phone_change_token         is null
    or reauthentication_token     is null;
