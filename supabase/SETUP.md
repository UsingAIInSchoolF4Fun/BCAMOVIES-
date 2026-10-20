# BCAMOVIES+ signup welcome email and owner accounts

## Welcome email
1. Open your Supabase project dashboard.
2. Go to **Authentication → Email Templates → Confirm signup**.
3. Set the subject to **Welcome to BCAMOVIES+! 🎬 Please confirm your email**.
4. Paste the HTML from `supabase/email-templates/confirm-signup.html` into the template editor and save.
5. Under **Authentication → Providers → Email**, enable **Confirm email** if it isn't already enabled.
6. Configure custom SMTP if needed for reliable delivery, then test with a new account.

The welcome message is part of the confirmation email, so it is sent by Supabase's authentication system rather than insecurely from the browser. Supabase may apply sending limits.

## Owner account list
1. Deploy `supabase/functions/owner-accounts/index.ts` as the **owner-accounts** Edge Function.
2. Ensure the function has the project URL, anon key and service-role key as **server-side** environment variables; never place the service-role key in public files.
3. The function validates the signed-in user's identity and permits primary Owner `jonathan.pollard@bcaroyals.com` and backup Owner `jonathanspollard11@gmail.com`.
4. Log in at `owner.html` and use **Registered Accounts → Refresh Accounts**.

The owner dashboard displays account names, emails, and signup dates. It does not retrieve passwords. The public website cannot access the complete Supabase Auth user list without the securely deployed function.
