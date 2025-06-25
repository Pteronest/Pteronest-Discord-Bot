# Pteronest Discord Bot

A professional Discord bot for the Pteronest marketplace community, featuring welcome embeds, information commands, economy system, and interactive features.

## ✨ Features

- **Welcome Embeds**: Beautiful welcome messages for new members with interactive buttons
- **Slash Commands**: Modern Discord slash command system with 10+ commands
- **Interactive Buttons**: Clickable buttons for quick actions and navigation
- **Economy System**: Virtual currency system with daily rewards and transactions
- **Information Commands**: Get marketplace info, products, status, and more
- **Server & User Info**: Detailed server and user information commands
- **Professional Design**: Clean, modern embeds with consistent branding
- **Advanced Logging**: Comprehensive logging system for debugging and monitoring
- **Error Handling**: Robust error handling and user-friendly error messages
- **Configuration System**: Easy-to-customize configuration file

## 🎮 Commands

### Information Commands
- `/info` - Get comprehensive information about Pteronest marketplace
- `/products` - View featured products with trending items
- `/help` - Show all available commands and useful links
- `/status` - Check real-time marketplace status
- `/ping` - Check bot and API latency

### Server & User Commands
- `/server` - Get detailed server information
- `/user [user]` - Get user information (optional user parameter)

### Economy Commands
- `/balance` - Check your virtual currency balance
- `/daily` - Claim daily reward (10 credits)
- `/transactions` - View your transaction history

## 🚀 Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   - Copy `env.example` to `.env`
   - Fill in your Discord bot credentials:
     ```
     DISCORD_TOKEN=your_discord_bot_token_here
     CLIENT_ID=your_discord_client_id_here
     GUILD_ID=your_discord_guild_id_here
     ```

3. **Discord Bot Setup**
   - Create a Discord application at [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a bot and get your token
   - Enable required intents:
     - Server Members Intent
     - Message Content Intent
   - Invite the bot to your server with appropriate permissions

4. **Run the Bot**
   ```bash
   npm start
   ```

## 🛠️ Development

```bash
npm run dev
```

## 📊 Bot Permissions

The bot requires the following permissions:
- Send Messages
- Use Slash Commands
- Embed Links
- Add Reactions
- Read Message History
- View Channels
- Manage Messages (for logging)

## ⚙️ Configuration

### Customizing the Bot

Edit `config.js` to customize:
- **Colors**: Brand colors for embeds
- **Links**: Website, docs, support, and Discord links
- **Channels**: Welcome and support channel names
- **Features**: Enable/disable specific features
- **Marketplace**: Stats and categories

### Welcome Channels
The bot automatically sends welcome messages to channels named:
- `welcome`
- `general` 
- `new-members`

### Embed Colors
Update the color codes in `config.js`:
- Primary: `#6366f1` (Indigo)
- Success: `#10b981` (Emerald)
- Warning: `#f59e0b` (Amber)
- Error: `#ef4444` (Red)
- Info: `#3b82f6` (Blue)

## 📁 Project Structure

```
discordbot/
├── index.js              # Main bot file
├── config.js             # Configuration settings
├── package.json          # Dependencies and scripts
├── README.md            # Documentation
├── .gitignore           # Git ignore rules
├── env.example          # Environment variables template
├── utils/
│   └── logger.js        # Logging utility
├── commands/
│   └── economy.js       # Economy system
└── logs/                # Log files (auto-generated)
```

## 🔧 Advanced Features

### Economy System
- Virtual currency for marketplace integration
- Daily rewards system
- Transaction history tracking
- Balance management

### Logging System
- Automatic log file creation
- Different log levels (info, success, warning, error, debug)
- Daily log rotation
- Development mode debugging

### Error Handling
- Comprehensive error catching
- User-friendly error messages
- Graceful fallbacks
- Detailed error logging

## 🌐 Hosting

This bot is designed to be hosted on any Node.js platform:
- **Railway** - Easy deployment with automatic scaling
- **Heroku** - Free tier available for small bots
- **DigitalOcean** - Reliable VPS hosting
- **VPS** - Full control over hosting environment
- **Local development** - For testing and development

## 📈 Monitoring

The bot includes built-in monitoring features:
- Console logging with emojis for easy reading
- File-based logging for persistence
- Error tracking and reporting
- Performance monitoring (ping/latency)

## 🤝 Support

For support with the Discord bot:
- Check the `/help` command in Discord
- Review the logs in the `logs/` directory
- Contact the Pteronest team
- Create an issue in the repository

## 🔄 Updates

The bot automatically:
- Deploys slash commands on startup
- Handles Discord API updates
- Manages command registration
- Updates activity status

---

**Pteronest Discord Bot** - Empowering the Pterodactyl community with professional Discord integration! 🦅 