# 📄 PaperPulseBot

A **Discord bot** designed to simulate a virtual exam system. Built with **Node.js** and **discord.js**, the bot enables candidates to take timed papers under examiner supervision in a fully automated environment on Discord.

> 🚧 **Under Active Development**
>
> Features and structure are actively evolving. Expect frequent updates — and note that this README may occasionally be out of date.

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

## 🧪 Features

### ✅ Currently Available

- `startpaper` slash command to begin an exam
- Auto-creation of paper channels under specified category
- Timer and reminder logic when paper time is up
- ESLint and Prettier enforced formatting and linting

### ⏳ In Progress / Planned

- Mark awarding system
- Candidate and examiner profiles
- leaderboard command

> 🔄 Features evolve as per development and testing feedback.

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
├── .github/workflows/        # GitHub Actions for CI
│   ├── lint.yml              # Runs ESLint checks
│   └── prettier.yaml         # Runs Prettier formatting check
├── .gitignore                # Git ignored files config
├── .prettierrc               # Prettier formatting rules
├── commands/                 # Command handler modules
│   ├── messageCommands/      # Legacy or message-based commands
│   │   └── add.js
│   └── slashCommands/        # Slash (/) commands for Discord
│       ├── startpaper.js     # Starts an exam session
│       ├── upload.js         # Handles paper upload
│       ├── verify.js         # Verifies candidate fairness and they did not cheat, Only available for use by examiner
│       └── award.js          # Handles awarding the marks to a candidate in a specific session channel by the examiner only
├── config.json               # Local bot configuration
├── data/
│   └── state.js              # Temporary app state data
├── eslint.config.mjs         # ESLint config using flat config system
├── examples/                 # Sample config and env files
│   ├── .env
│   └── config.json
├── index.js                  # Entry point of the bot
├── LICENSE                   # License info
├── package.json              # Project metadata and dependencies
├── package-lock.json         # Lockfile for npm dependencies
├── Readme.md                 # Project documentation
├── scripts/                  # Utility scripts for managing commands
│   ├── clear-commands.js     # Clear registered slash commands
│   └── deploy-commands.js    # Register slash commands with Discord
└── utils/                    # Utility and helper modules
    ├── buttonHandlers.js     # Handles button interactions
    ├── buttons.js            # Button component definitions
    ├── config.js             # Shared config helpers
    ├── embeds.js             # Embed template definitions
    └── time.js               # Time-related utilities
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
