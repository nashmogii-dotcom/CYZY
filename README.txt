N Film Comments update:
- Unauthenticated users see red "You Are Not Authenticated" with a "Who am I?" authentication button.
- Authentication opens the existing Who Am I/onboarding interface.
- Authenticated users can comment.
- Comments support Reply.
- Users can delete their own locally-created comments and replies only.
- Existing N Film player/embed behavior is preserved.

AUTHENTICATION UPDATE NOTES
- Username suggestions now appear as a full-screen popup only after typing, and selecting a name checks whether a pfps-tagged profile exists.
- Existing profiles request the 4-digit passcode. Missing profiles request an image and a 4-digit non-sequential/non-repeating passcode, then upload as tag pfps with Name, Status=Locked, and Passcode contextual metadata.
- IMPORTANT: To enable profile uploads, create an unsigned Cloudinary upload preset named cyzy_pfps_upload in Cloudinary Settings > Upload > Upload presets. The script is configured to use that exact preset name. The preset must have Signing Mode set to Unsigned.
- Enter as Dump is a restricted guest mode: favorite/comment actions are disabled and classmate heads/names are hidden. Client-side restrictions are UI controls, not a security boundary.

CLOUDINARY ACCOUNT STATUS UPDATES
- Profile upload preset is configured as: presetsprints (must be unsigned).
- Cloudinary cloud for profile images: uigl7v2b; tag: pfps.
- To enable Online/Offline status updates, configure Netlify environment variables:
  CLOUDINARY_CLOUD_NAME=uigl7v2b
  CLOUDINARY_API_KEY=<your rotated API key>
  CLOUDINARY_API_SECRET=<your rotated API secret>
- Do not put the API secret in script.js or any public file. Rotate any secret shared in chat before deploying.
