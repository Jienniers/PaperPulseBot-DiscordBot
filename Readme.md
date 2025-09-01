# 📄 PaperPulseBot

A **Discord bot** designed to simulate a virtual exam system. Built with **Node.js** and **discord.js**, the bot enables candidates to take timed papers under examiner supervision in a fully automated environment on Discord.

---

## 🔧 Tech Stack

- **Language:** JavaScript (Node.js)
- **Library:** [discord.js](https://discord.js.org/)
- **Environment Config:** dotenv
- **Linter:** ESLint with Prettier integration
- **CI:** GitHub Actions (ESLint, Prettier)
- **Code Style:** Prettier
- **Config:** Local JSON files

---

## 📘 Slash Commands Overview

| Command        | Description                                                                                        | Usage                                    |
| -------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `/startpaper`  | Starts a new paper session for candidates in the server                                            | `/startpaper`                            |
| `/upload`      | Uploads a paper file for examiner to check _(Requires a PDF file)_                                 | `/upload file:<paper.pdf>`               |
| `/award`       | Examiner awards marks to a candidate                                                               | `/award user:@candidate marks:50/100`    |
| `/verify`      | Verifies that a candidate completed the paper fairly _(Examiner-only, within the session channel)_ | `/verify user:@candidate`                |
| `/profile`     | Displays a candidate's profile summary _(User argument is optional — defaults to command user)_    | `/profile` or `/profile user:@candidate` |
| `/leaderboard` | Shows the leaderboard ranked by percentage _(Only shows results for the current channel)_          | `/leaderboard`                           |

---

### 💬 Message Commands

| Command          | Description                                                                                           | Usage                       |
| ---------------- | ----------------------------------------------------------------------------------------------------- | --------------------------- |
| `!add @users...` | Starts the paper timer for the mentioned users in the current paper session _(examiner-only command)_ | `!add @user1 @user2 @user3` |

> ⚠️ `!add` must be used inside a **paper session channel**. It supports **multiple mentions** and starts the exam timer for added users.

---

## 🚀 Getting Started

> Ensure [Node.js](https://nodejs.org/) is installed before setup.

### 1. Clone the Repository

```bash
git clone https://github.com/Jienniers/paperpulsebot.git
cd paperpulsebot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory.
You can use the example provided in examples/.env:

```bash
cp examples/.env .env
```

Edit the file to include your credentials:

```env
TOKEN=your_discord_bot_token
CLIENT_ID=your_application_client_id
GUILD_ID=your_guild_id
```

### 4. Configuration File

Create `config.json` in the root directory.
You can also copy from examples/config.json:

```bash
cp examples/config.json config.json
```

Update it as needed:

```json
{
    "category_id": "YOUR_CATEGORY_CHANNEL_ID"
}
```

### 5. Clear old Slash Commands (Optional)

```bash
node node scripts/clear-commands.js
```

### 6. Register Slash Commands

```bash
node scripts/deploy_commands.js
```

### 7. Start the Bot

```bash
node app.js
```

---

## 🧹 Code Quality

- Run ESLint to check code:

    ```bash
    npm run lint
    ```

- Format code automatically with Prettier:

    ```bash
    npm run format
    ```

---

## 📁 Project Structure

```
├── .env                      # Environment variables (not committed)
├── .gitignore                # Git ignored files config
├── .prettierrc               # Prettier formatting rules
├── config.json               # Local bot configuration
├── eslint.config.mjs         # ESLint config using flat config system
├── index.js                  # Entry point of the bot
├── LICENSE                   # License info
├── package.json              # Project metadata and dependencies
├── package-lock.json         # Lockfile for npm dependencies
├── Readme.md                 # Project documentation
├── .github/workflows/        # GitHub Actions for CI
│   ├── lint.yml              # Runs ESLint checks
│   └── prettier.yaml         # Runs Prettier formatting check
├── commands/                 # Command handler modules
│   ├── messageCommands/      # Legacy or message-based commands
│   │   └── add.js            # Adds candidates to the session and starts the exam timer (examiner-only)
│   └── slashCommands/        # Slash (/) commands for Discord
│       ├── award.js          # Awards marks to candidate (examiner-only)
│       ├── leaderboard.js    # Shows top candidates by marks
│       ├── profile.js        # Displays a candidate's profile summary
│       ├── startpaper.js     # Starts an exam session by creating a paper channel
│       ├── upload.js         # Handles paper PDF upload to the examiner
│       └── verify.js         # Verifies candidate fairness (examiner-only)
├── data/
│   └── state.js              # Temporary Discord bot state
├── database/                 # Database models and services
│   ├── models/
│   │   ├── dynamicModelFactory.js # Creates dynamic Mongoose models
│   │   └── index.js              # Central export for all models
│   └── services/
│       ├── candidateSessionMapService.js # Service for candidate-session mapping
│       ├── examinerMapService.js         # Service for examiner map in Database
│       ├── mapServiceFactory.js          # Factory for creating map services
│       ├── paperChannelsService.js       # Service for managing paper channels in Database
│       ├── paperRunningMapService.js     # Service for tracking running papers in Database
│       └── paperTimeMinsService.js       # Service for paper channel with time in mins map in Database
├── examples/                 # Sample config and env files
│   ├── .env
│   └── config.json
├── scripts/                  # Utility scripts for managing commands
│   ├── clear-slash-commands.js  # Clear registered slash commands
│   └── deploy-slash-commands.js # Register slash commands with Discord
└── utils/                    # Utility and helper modules
    ├── common/
    │   ├── config.js         # Shared config helpers
    │   └── time.js           # Time-related utilities
    ├── database/
    │   ├── mongoConnection.js    # MongoDB connection logic
    │   └── stateDatabaseSync.js  # Syncs bot state with database
    └── discord/
        ├── buttonHandlers.js  # Handles button interactions
        ├── buttons.js        # Button component definitions
        └── embeds.js         # Embed template definitions
```

---

## 🤝 Contributing

Contributions, suggestions, and improvements are welcome!

If you'd like to contribute to **PaperPulseBot**, follow these steps:

### 📦 Fork & Clone

1. Fork the repository
2. Clone your fork:

    ```bash
    git clone https://github.com/Jienniers/paperpulsebot.git
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
    npm run lint
    npm run format
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
