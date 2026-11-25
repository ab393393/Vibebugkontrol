# VBK enquiry register

Destination: the owner's supplied spreadsheet, tab **Enquiries**. The **Connection
setup** tab contains the same checklist. Existing tabs are retained.

The website saves validated enquiries through a private server-to-Apps-Script
request before continuing its existing FormSubmit/Resend flow. This keeps the
Google write token off the public form. It also captures leads when the later
email request fails. A row is not proof of email receipt. Follow-up status starts
at New; the team can select Contacted, Quote sent, Booked or Closed.

## One-time Google setup

1. On a computer, open the supplied sheet and choose **Extensions → Apps Script**.
2. Paste the complete `Code.gs` beside this README into the editor and save.
3. Select **setupShieldAndShine**, click **Run**, and authorize your Google account.
   This checks the headers and creates a private `SHIELD_WEBHOOK_TOKEN` in
   **Project Settings → Script properties**. Running setup again preserves it.
4. Choose **Deploy → New deployment → Web app**. Set **Execute as: Me** and
   **Who has access: Anyone**. Deploy, and copy the URL ending in `/exec`.
5. Configure these private website runtime settings, then publish:
   - `GOOGLE_SHEETS_WEBHOOK_URL`: the web-app `/exec` URL.
   - `GOOGLE_SHEETS_WEBHOOK_TOKEN`: the value of `SHIELD_WEBHOOK_TOKEN` from Script
     properties. Store it as a secret. Do not put it in spreadsheet cells, Git,
     frontend JavaScript, form fields or Google Analytics.

The Sheets connector can prepare the workbook but cannot create or deploy an
Apps Script project. Google authorization and the deployment remain owner steps.
Neither website setting is enabled until those steps are complete.

## Verify

After configuration, submit one separately authorized enquiry test. Match its
SS- reference in column B and both email inboxes. Time is written explicitly in
Asia/Kolkata. A native/JSON API response reports `sheet.state` as saved, failed or
not_configured; the email status remains independent. Failures log only the
reference and failure category, never the token or enquiry contents. Google
failures time out after four seconds so they cannot indefinitely block email.
No automatic retry is made. Google deduplicates repeated requests with the same
reference under a script lock, and writes submitted text as literal cell values.

Changing script code requires updating its web-app deployment version. Keep the
register headers and their order unchanged. Do not put the write token into a
FormSubmit `_webhook` field: public form fields are visible to visitors.

Automated tests use local mocks; no live enquiry or email is sent by these tests.
