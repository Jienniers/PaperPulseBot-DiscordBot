# 📄 PaperPulse

A work-in-progress **Discord bot** built using **Node.js** and the **discord.js** library, designed to simulate a virtual examination system within Discord. The bot allows users (candidates) to take timed "papers" while being supervised by an assigned examiner — all within structured Discord channels.

> 🚧 **Currently Under Development**
>
> This project is in its early stages. Features are being developed and refined iteratively. Expect frequent changes.

---

## 🔧 Tech Stack

- **Language:** JavaScript (Node.js)
- **Library:** [discord.js](https://discord.js.org/)
- **Environment Config:** dotenv
- **Data Storage:** Local JSON config files

---

## 🧪 Features

### ✅ In Development

### ⏳ Planned

- Awarding marks to candidates
- Verify the candidates if they did not cheat during the session
- View the profile of candidates and examiner

> ℹ️ **Note:** Planned features will be updated as per development needs.

---

## 🚀 Getting Started

> Ensure you have [Node.js](https://nodejs.org/) installed before proceeding.

### 1. Clone the Repo

```bash
git clone https://github.com/Jienniers/paperpulse.git
cd paperpulse
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
TOKEN=your_discord_bot_token
CLIENT_ID=your_application_client_id
GUILD_ID=your_guild_id
```

### 4. Configure the Project

Create a `config.json` file in the root directory:

```json
{
    "category_id": "YOUR_CATEGORY_CHANNEL_ID"
}
```

### 5. Register Slash Commands

```bash
node deploy_commands.js
```

### 6. Start the Bot

```bash
node index.js
```

---

## 📌 Note

This repository is **private** during the development phase.
It will be made public once the bot reaches a functional and stable release.

---

## 👤 Author

Built and maintained by [@Jienniers](https://github.com/Jienniers)

---

Stay tuned for updates on **PaperPulse**!
