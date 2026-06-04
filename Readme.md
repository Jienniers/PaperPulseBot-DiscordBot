# 📄 PaperPulseBot

A **Discord bot** designed to simulate a virtual exam system. Built with **Node.js** and **discord.js**, the bot enables candidates to take timed papers under examiner supervision in a fully automated environment on Discord.

---

## 🔗 Invite Bot

[Invite PaperPulseBot to your Discord server](https://discord.com/oauth2/authorize?client_id=1509162813015195699&permissions=19472&integration_type=0&scope=bot+applications.commands)

---

## 🔧 Tech Stack

- **Language:** JavaScript (Node.js)
- **Library:** [discord.js](https://discord.js.org/)
- **Environment Config:** dotenv
- **Linter:** ESLint with Prettier integration
- **CI:** GitHub Actions (ESLint, Prettier)
- **Code Style:** Prettier
- **Database:** MongoDB

---

## 🚧 Upcoming Updates & Features

- Readme.md update to reflect the recent feature changes.

## 📘 Commands Overview

### Slash Commands

| Command        | Description                                                                                        | Usage                                    |
| -------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `/startpaper`  | Starts a new paper session for candidates in the server                                            | `/startpaper`                            |
| `/upload`      | Uploads a paper file for examiner to check _(Requires a PDF file)_                                 | `/upload file:<paper.pdf>`               |
| `/award`       | Examiner awards marks to a candidate                                                               | `/award user:@candidate marks:50/100`    |
| `/verify`      | Verifies that a candidate completed the paper fairly _(Examiner-only, within the session channel)_ | `/verify user:@candidate`                |
| `/profile`     | Displays a candidate's profile summary _(User argument is optional — defaults to command user)_    | `/profile` or `/profile user:@candidate` |
| `/leaderboard` | Shows the leaderboard ranked by percentage _(Only shows results for the current channel)_          | `/leaderboard`                           |

---

### Message Commands

| Command          | Description                                                                                           | Usage                       |
| ---------------- | ----------------------------------------------------------------------------------------------------- | --------------------------- |
| `!add @users...` | Starts the paper timer for the mentioned users in the current paper session _(examiner-only command)_ | `!add @user1 @user2 @user3` |

> ⚠️ `!add` **must** be used inside a **paper session channel**. It supports **multiple mentions** and starts the exam timer for added users.

---

## 🖼️ Screenshots

### Paper Session Channel Embed

![PaperChannelEmbed](Screenshots/PaperChannelEmbed.png)

### Paper Started Message

![TimerStarted](Screenshots/TimerStarted.png)

### Paper Results Embed

![MarksAwarded](Screenshots/MarksAwardedDM.png)

### Your Profile Embed

![Profile](Screenshots/Profile.png)

---

## 🚀 Getting Started

> Ensure [Node.js](https://nodejs.org/) (optional If running with Docker) and [Docker](https://www.docker.com/get-started) are installed before setup.

---

### 1️⃣ Setup Environment Variables (Required)

Create a `.env` file in the root directory. You can use the example provided in `examples/.env`:

```bash
cp examples/.env .env
```

Edit the file to include your credentials:

```env
TOKEN=your_discord_bot_token
CLIENT_ID=your_application_client_id
CATEGORY_ID=your_paper_sessions_category_id
GUILD_ID=your_guild_id
SYNC_INTERVAL=5000 # MongoDB sync interval in milliseconds
```

Set `MONGO_URL` depending on your setup:

- **If running the bot fully with Docker (Option 1):**

```env
MONGO_URL=mongodb://mongo:27017/botData
```

- **If running the bot manually (locally) while MongoDB runs in Docker (Option 2):**

```env
MONGO_URL=mongodb://localhost:27017/botData
```

> ⚠️ Do not commit `.env` to GitHub. Keep it private.

> 💡 **Important:** When you add new environment variables to `.env`, remember to also add the variable name to the `requiredVars` array in the `validateEnvironmentVariables()` function in `index.js`. This ensures the bot validates that all required environment variables are set when it starts.

---

## 🐳 Option 1: Run Bot with Docker

> 💡 Tip: Make sure your terminal/command prompt is opened in the project folder (`paperpulsebot`) when running any Docker commands below, e.g., `docker compose up -d`.

1. **Start Bot and MongoDB together:**

```bash
docker compose up -d
```

- Runs both the bot and MongoDB containers in detached mode.

- `.env` file is used automatically for environment variables.

2. **Rebuild containers after code changes:**

```bash
docker compose up -d --build
```

- Rebuilds the Docker images to include any changes in code or dependencies.

- Ensures the latest code is running inside the container.

> 💡 Tip: For development, after making code changes you can run this command and apply your latest code without touching the manual setup.

3. **Check running containers:**

```bash
docker ps
```

4. **Stop containers (if needed):**

```bash
docker compose down
```

> 💡 Tip: Always use `docker compose down -v` if you want to remove MongoDB data and start fresh.

---

## ⚙️ Option 2: Manual Setup

### 1. Setup MongoDB

1. **Pull the MongoDB image:**

```bash
docker pull mongo
```

2. **Run MongoDB container:**

```bash
docker run -d --name paperpulse-mongo -p 27017:27017 -v mongo-data:/data/db mongo
```

- `-d` runs the container in detached mode.

- `--name` gives the container a name.

- `-p` maps local port 27017 to container port 27017.

- `-v` creates a volume for data persistence.

3. **Check if MongoDB container is running:**

```bash
docker ps
```

4. **Stop MongoDB container (if needed):**

```bash
docker stop paperpulse-mongo
```

5. **Start MongoDB container again:**

```bash
docker start paperpulse-mongo
```

### 2. Clone the Repository

```bash
git clone https://github.com/Jienniers/paperpulsebot.git
cd paperpulsebot
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Clear old Slash Commands (Optional)

```bash
node scripts/clear-slash-commands.js
```

### 5. Register Slash Commands (optional if already registered)

```bash
node scripts/deploy-slash-commands.js
```

### 6. Start the Bot

```bash
node index.js
```

---

## 🏗️ Architecture Overview

### State Management

PaperPulseBot uses a **two-tier state system** combining in-memory state with MongoDB persistence:

#### In-Memory State (`data/state.js`)

The bot maintains several in-memory maps to track active sessions:

- **`examinersMap`**: Maps `channelID → examinerId` (tracks which examiner is running which session)
- **`paperChannels`**: Array of active paper session channel IDs
- **`paperTimeMinsMap`**: Maps `channelID → duration` (exam duration in minutes)
- **`paperRunningMap`**: Maps `channelID → boolean` (whether the timer is currently running)
- **`candidateSessionsMap`**: Maps composite keys to candidate session data

#### Composite Key Format

Candidate sessions use a **composite key pattern**: `userId::channelID`

- Example: `"123456789::987654321"` (user 123456789 in channel 987654321)
- This allows tracking multiple sessions for the same user across different channels
- Keys are split with `COMPOSITE_KEY_SEPARATOR` constant (`::`)

### State Synchronization

The bot syncs state between memory and MongoDB every **5 seconds** with **debouncing**:

1. **Initialization** (`initializeAndSyncState`):
    - Load all persistent state from MongoDB into memory
    - Clean up orphaned entries from deleted Discord channels
    - Start periodic sync interval

2. **Periodic Sync** (every 5 seconds):
    - Only syncs if at least 1 second has passed since last sync (debounce)
    - Sends all in-memory state to MongoDB
    - Prevents database hammering

3. **Graceful Shutdown**:
    - On `SIGINT` or `SIGTERM`, performs final sync before exiting
    - Ensures no state is lost on unexpected shutdowns

### Data Flow

```
Discord Events
    ↓
Command Handlers
    ↓
Modify In-Memory State (examinersMap, candidateSessionsMap, etc.)
    ↓
Every 5 seconds (with debounce)
    ↓
Sync to MongoDB
    ↓
Periodic Load from MongoDB (on startup)
```

---

## 📋 Code Quality

- Run ESLint to check code:

    ```bash
    npm run lint
    ```

- Run ESLint to fix code:

    ```bash
    npm run lintfix
    ```

- Format code automatically with Prettier:

    ```bash
    npm run format
    ```

---

## 🤝 Contributing

Contributions, suggestions, and improvements are welcome!

If you'd like to contribute to **PaperPulseBot**, follow these steps:

### 📦 Fork & Clone

1. Fork the repository
2. Clone your fork:

    ```bash
    git clone https://github.com/[USERNAME]/paperpulsebot.git
    cd paperpulsebot
    ```

### 🌱 Create a Branch

Create a new feature or fix branch:

```bash
git checkout -b feature/your-feature-name
```

### ✍️ Make Changes

- Add your code or fix bugs
- Follow existing coding style
- Run linter and formatter:

    ```bash
    npm run format
    npm run lintfix
    ```

### ✅ Commit

Use [conventional commit](https://www.conventionalcommits.org/) style:

```bash
git commit -m "feat: add new exam timer logic"
```

### 🚀 Push & PR

Push your changes:

```bash
git push origin feature/your-feature-name
```

Then open a Pull Request on GitHub. Make sure to:

- Describe your changes clearly
- Reference any related issues if applicable

### 📋 Code Review

Your PR will be reviewed and tested. Make necessary changes if requested. Once approved, it will be merged into `main`.

> Thanks for helping improve **PaperPulseBot**! Your contributions make the project better for everyone. 💙

---

## 👤 Author

Built and maintained by [@Jienniers](https://github.com/Jienniers)

---

Stay tuned for updates and releases of **PaperPulseBot**!

Feel free to ⭐ the repository if you find it useful!
