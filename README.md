# Exam Books — protected e-book app

Two parts:

- `server/` is a Node.js + MongoDB API. It handles login, keeps **one active phone per account**, and serves book content one section at a time to signed-in users who have access.
- `app/` is a React Native (Expo) app. It has login, a library, a table of contents and a reader. It **blocks screenshots and screen recording**, adds a watermark, and keeps an **encrypted** offline copy of books for a limited time.

## How the protections work

| Requirement | How it is done |
|---|---|
| Read only inside the app | Text can't be selected or copied, and there is no export. Sections the student opens (or downloads with **Download for offline**) are saved on the phone **encrypted** with XChaCha20-Poly1305; the key is random per install and kept in the Android Keystore / iOS Keychain, and file names are hashed so nothing on disk names a book or chapter. Server responses still carry `Cache-Control: no-store`. |
| Offline limit | Saved books open without internet only for `OFFLINE_DAYS` (default 7) after the app last reached the server; after that the student must go online once. The saved copy is **wiped** on logout, when the account signs in on another phone, when another account logs in, and per book when access is removed. |
| One login at a time | Each login creates a new session id, saved on the user record and inside the token. Every request checks that the token's session is still the active one. When the account logs in on phone B, phone A gets `SESSION_REPLACED` on its next request (it checks on opening, on returning to the app and every 60 s) and is signed out with a message. |
| No screenshots | **Android:** `FLAG_SECURE`, so screenshots and recordings come out black and the recent-apps preview is blank. **iOS:** `expo-screen-capture` prevents capture where the iOS/Expo version supports it, and every screenshot is otherwise *detected* and reported to the server (`GET /admin/screenshot-events`). A cover screen hides the page in the app switcher. |
| Deterrence | Every page has a faint watermark with the reader's email, so a photo taken with another phone shows whose account leaked it. |

**What no app can stop:** someone with a rooted phone and real skill could, in principle, read the offline key from memory and decrypt saved books — set `OFFLINE_DAYS=0` if you'd rather never store books on the phone. Also someone photographing the screen with a second phone, and rooted or jailbroken phones that disable `FLAG_SECURE`. The watermark and the screenshot log are there for those cases.

## 1. Run the server

Requirements: Node 18+ and a MongoDB database. MongoDB Atlas has a free tier.

```bash
cd server
cp .env.example .env          # set MONGODB_URI and a long random JWT_SECRET
npm install
npm run create-admin -- you@example.com "YourStrongPassword"
npm start                     # → E-book API listening on port 4000
```

Deploy it to any Node host (Render, Railway, a VPS behind Nginx) with **HTTPS**. The app must talk to the server over https.

## 2. Load a book

1. In the Assam GK doc, export each tab as Markdown.
2. Save the files in `server/content/assam-gk/` with ordering prefixes:
   ```
   00-front-matter.md
   01-chapter-1-sources-and-early-assam.md
   02-chapter-2-ancient-assam.md
   90-test-paper-1.md … 94-test-paper-5.md
   ```
   File names containing `front` show under *Front matter*, names containing `test` or `mock` under *Test papers*, and the rest under *Chapters*. Each section's title is the first `# ` heading in its file.
3. Run `npm run import-book -- content/assam-gk`. Run it again whenever you update a chapter; it replaces that book's sections.
   To import or re-sync every book in `content/` at once, run `npm run import-all`. It checks every folder first and writes nothing if any of them has a problem.

`book.json` in the same folder holds the title, subtitle and edition.

## 3. Create student accounts

Accounts are created by you, not by students (set `ALLOW_SIGNUP=true` to change that). First log in as admin to get a token:

```bash
TOKEN=$(curl -s -X POST https://api.your-domain.com/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","password":"YourStrongPassword","deviceId":"admin-cli"}' | jq -r .token)

# create a student with access to Book 1
curl -X POST https://api.your-domain.com/admin/users -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Student","email":"student@example.com","password":"Pass12345","books":["assam-gk"]}'
```

  ```bash
TOKEN=$(curl -s -X POST http://localhost:4000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@admin.com","password":"admin@123","deviceId":"admin-cli"}' | jq -r .token)

# create a student with access to Book 1
curl -X POST http://localhost:4000/admin/users -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Student","email":"student@admin.com","password":"admin@123","books":["assam-gk"]}'
```

### Give a student access to more books

Importing a book does not give anyone access to it. From the `server/` folder:

```bash
npm run grant-books -- --list                                         # all books, and who can read what
npm run grant-books -- student@example.com general-english social-studies
npm run grant-books -- student@example.com --all                      # every published book
```

It only adds books; the ones a student already has are kept.

# 1. log in as admin and copy the token (same as README step 3)
# 2. find the student's user id
curl -s http://localhost:4000/admin/users -H "Authorization: Bearer <ADMIN_TOKEN>"

# 3. give the student all six books
curl -X PATCH http://localhost:4000/admin/users/<STUDENT_ID> \
  -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" \
  -d '{"books":["assam-gk","general-english","general-knowledge","general-mathematics","logical-reasoning","social-studies"]}'


Logging in from the command line as admin also counts as the admin's one session. That is fine, because the admin doesn't need the app open at the same time.

Other admin endpoints:

| Endpoint | Use |
|---|---|
| `GET /admin/users` | List users and the phone each one is signed in on |
| `PATCH /admin/users/:id` | Change `books`, set `disabled`, or reset `password` (both disabling and a password reset sign the user out) |
| `POST /admin/users/:id/reset-session` | Sign a user out everywhere, e.g. after a lost phone |
| `GET /admin/screenshot-events` | Screenshot attempts detected, with the user, book and section |

## 4. Run and build the app

```bash
cd app
npm install
npx expo install --fix        # aligns package versions with your Expo SDK
```

Set your server address in `app.json` → `expo.extra.apiUrl`, and change the `package` / `bundleIdentifier` to your own.

Screenshot blocking needs a real build, not Expo Go:

```bash
npx expo run:android          # on a connected phone or emulator
# or build for the stores
npm install -g eas-cli && eas build -p android   # and -p ios
```

**Test checklist**

- Log in on phone A, then on phone B with the same account. Phone A shows "Signed out … another phone" within a minute, or immediately when it's reopened.
- Try a screenshot on Android: you get a black image or a "can't take screenshot" message.
- On iOS, take a screenshot, then check `GET /admin/screenshot-events`.
- Open a book and tap **Download**, then turn off the internet: the library, contents and chapters still open, with an "Offline" banner. Sections never opened or downloaded show "Can't reach the server".
- Log out (or sign in on another phone): the saved copies are deleted.

## Files

```
server/
  src/index.js              Express app
  src/config.js             env settings
  src/models/User.js        user + activeSession
  src/models/Book.js        Book, Section, ScreenshotEvent
  src/middleware/auth.js    token + single-session check
  src/routes/auth.js        login, me, logout (+ optional signup)
  src/routes/books.js       library, contents, section, screenshot report
  src/routes/admin.js       users, access, sessions, screenshot log
  src/routes/progress.js    test-paper answers & scores, profile
  src/lib/testKey.js        grades test papers from their own answer key
  src/models/TestAttempt.js saved answers (in progress) and submitted results
  scripts/create-admin.js
  scripts/import-book.js
  scripts/grant-books.js    give a student access to books
  content/assam-gk/book.json
app/
  App.js                    navigation, screen protection, privacy cover
  src/api.js                fetch wrapper, signs out on 401
  src/auth/AuthContext.js   login state, 60 s session check
  src/device.js             per-install device id
  src/security.js           capture blocking + screenshot reporting
  src/components/           Watermark, PrivacyCover
  src/screens/              Login, Library, Book, Reader
```


adb reverse tcp:4000 tcp:4000 