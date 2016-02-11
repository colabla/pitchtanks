# PitchTanks Node.js

## Reference Front-end Application
http://www.keywordfoundry.com

## Important Notes
- Pitches can receive both "votes" and "upvotes". Votes are the tally of number of "wins" that a given video gets on the homepage in head-to-head voting. "Upvotes" are the little "thumbs-up" clicks (like a +1) that a video gets on the gallery page and the company profile page. The votes and upvotes are tallied differently, with the upvotes being used for tiebreakers, etc.

## Authentication
Authentication will be with social signup/in via oAuth for the following providers:
- Facebook
- LinkedIn
- Twitter

If not difficult, email/pass registration/login is also desired.

## Pages
### Home Page
- Displays two video embeds with "vote" buttons beneath each
- Videos can be played individually
- Video winner can be selected by clicking one of the "vote" buttons
- Contains additional marketing copy and three additional videos from the "leaderboard"

### About Page
This is nothing more than a static page for copy to explain what PitchTanks is. Just need simple, static template.

### Pitch Gallery Page
- Grid of pitch videos
- Sortable by "Recent", which is the vide list sorted by most recent
- Sortable by "Popular", which is sorted by number of upvotes
- Each video thumbnail cell on the grid contains the following:
  - Date of upload
  - Current number of "votes" that the video has received
  - "upvote" button
  - Video thumbnail
  - Name of company that uploaded pitch
  - Company logo
  - Company's tagline (if applicable)
- Clicking the thumbnail will navigate the user to the Company Profile page

### Company Profile Page
- Large video embed for the pitch video
- Company Name
- Company tagline (optional)
- Company join date (date they joined PitchTanks)
- Company City
- Company Market (SaaS, etc.)
- Number of "battles" fought (number of times they have been in a head-to-head on home page)
- Company/pitch description
- Link to company website (opens in new window)
- Date of video upload
- "Upvote" button
- Two "related" videos (for MVP, these can just be videos from companies in same category)
- Link below the related videos that goes to the Pitch Gallery"
- "Edit" button if the viewer of the page is the owner of the company profile

### Company Profile Edit Page
Looks identical to the profile page, but the the following fields are editable:
- Company Name
- Company tagline (optional)
- Company City
- Company Market (SaaS, etc.)
- Company/pitch description
- Link to company website (opens in new window)
- Video upload (this will replace the existing video, system will not store multiple videos per company)
- Cancel editing button
- Save changes button
NOTE: This page would also be used as the company create page.

### User Settings Page
- User has option in dropdown at top of screen on right to select "settings"
- Link opens page on which user can edit:
  - Name (derived from social)
  - Email (derived from social)
  - Avatar (if none, use sigil)


