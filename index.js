require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, REST, Routes, PermissionFlagsBits } = require('discord.js');
const config = require('./config');
const economy = require('./commands/economy');
const serverSetup = require('./commands/setup');
const rulesCommand = require('./commands/rules');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ]
});

const commands = [
    {
        name: 'info',
        description: 'Get information about Pteronest marketplace'
    },
    {
        name: 'products',
        description: 'View featured products'
    },
    {
        name: 'help',
        description: 'Show available commands'
    },
    {
        name: 'status',
        description: 'Check marketplace status'
    },
    {
        name: 'ping',
        description: 'Check bot latency'
    },
    {
        name: 'server',
        description: 'Get server information'
    },
    {
        name: 'user',
        description: 'Get user information',
        options: [
            {
                name: 'user',
                description: 'User to get info about',
                type: 6,
                required: false
            }
        ]
    },
    {
        name: 'balance',
        description: 'Check your virtual currency balance'
    },
    {
        name: 'daily',
        description: 'Claim your daily reward'
    },
    {
        name: 'transactions',
        description: 'View your transaction history'
    },
    {
        name: 'setup',
        description: 'Setup Pteronest server structure (Admin only)'
    },
    {
        name: 'rules',
        description: 'Display server rules and guidelines'
    }
];

client.once('ready', async () => {
    console.log(`🦅 Pteronest Bot logged in as ${client.user.tag}`);
    console.log(`📊 Serving ${client.guilds.cache.size} guilds`);
    console.log(`👥 Serving ${client.users.cache.size} users`);
    
    client.user.setActivity('Pteronest Marketplace', { type: 'WATCHING' });
    
    try {
        console.log('🚀 Deploying slash commands...');
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );
        
        console.log('successfully finished startup');
    } catch (error) {
        console.error('❌ Error deploying slash commands:', error);
    }
});

client.on('guildMemberAdd', async (member) => {
    try {
        const welcomeEmbed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle('🦅 Welcome to Pteronest!')
            .setDescription(`Hey ${member.user.username}, welcome to the **Pteronest Marketplace** community!`)
            .addFields(
                { name: '🎯 What is Pteronest?', value: 'A premium marketplace for Pterodactyl Panel addons, themes, eggs, and scripts.', inline: false },
                { name: '🛍️ Browse Products', value: 'Discover amazing digital products from trusted sellers', inline: true },
                { name: '💰 Sell Your Work', value: 'Monetize your Pterodactyl creations', inline: true },
                { name: '🤝 Community', value: 'Connect with developers and users', inline: true }
            )
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({ text: 'Pteronest Marketplace', iconURL: client.user.displayAvatarURL() });

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Visit Marketplace')
                    .setStyle(ButtonStyle.Link)
                    .setURL(config.links.website),
                new ButtonBuilder()
                    .setLabel('Documentation')
                    .setStyle(ButtonStyle.Link)
                    .setURL(config.links.docs),
                new ButtonBuilder()
                    .setLabel('Support')
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId('support'),
                new ButtonBuilder()
                    .setLabel('Join Discord')
                    .setStyle(ButtonStyle.Link)
                    .setURL(config.links.discord)
            );

        const channel = member.guild.channels.cache.find(ch => 
            config.channels.welcome.includes(ch.name.toLowerCase())
        );
        
        if (channel) {
            await channel.send({ embeds: [welcomeEmbed], components: [buttons] });
        }
    } catch (error) {
        console.error('Error sending welcome message:', error);
    }
});

client.on('interactionCreate', async (interaction) => {
    try {
        if (!interaction.isCommand() && !interaction.isButton()) return;

        if (interaction.isButton()) {
            await handleButtonInteraction(interaction);
            return;
        }

        if (interaction.isCommand()) {
            const { commandName } = interaction;

            switch (commandName) {
                case 'info':
                    await handleInfoCommand(interaction);
                    break;
                case 'products':
                    await handleProductsCommand(interaction);
                    break;
                case 'help':
                    await handleHelpCommand(interaction);
                    break;
                case 'status':
                    await handleStatusCommand(interaction);
                    break;
                case 'ping':
                    await handlePingCommand(interaction);
                    break;
                case 'server':
                    await handleServerCommand(interaction);
                    break;
                case 'user':
                    await handleUserCommand(interaction);
                    break;
                case 'balance':
                    await economy.handleBalanceCommand(interaction);
                    break;
                case 'daily':
                    await economy.handleDailyCommand(interaction);
                    break;
                case 'transactions':
                    await economy.handleTransactionsCommand(interaction);
                    break;
                case 'setup':
                    await serverSetup.handleSetupCommand(interaction);
                    break;
                case 'rules':
                    await rulesCommand.handleRulesCommand(interaction);
                    break;
                default:
                    await interaction.reply({ 
                        content: '❌ Unknown command', 
                        ephemeral: true 
                    });
            }
        }
    } catch (error) {
        console.error('Error handling interaction:', error);
        
        const errorMessage = '❌ An error occurred while processing your request.';
        
        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMessage, ephemeral: true });
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        } catch (followUpError) {
            console.error('Failed to send error message:', followUpError);
        }
    }
});

async function handleButtonInteraction(interaction) {
    try {
        const { customId } = interaction;

        switch (customId) {
            case 'support':
                await handleSupportButton(interaction);
                break;
            case 'transactions':
                await economy.handleTransactionsCommand(interaction);
                break;
            case 'setup_confirm':
                await serverSetup.handleSetupConfirm(interaction);
                break;
            case 'setup_cancel':
                const cancelEmbed = new EmbedBuilder()
                    .setColor(config.colors.info)
                    .setTitle('❌ Setup Cancelled')
                    .setDescription('Server setup has been cancelled.')
                    .setTimestamp();
                
                await interaction.update({ embeds: [cancelEmbed], components: [] });
                break;
            case 'report_issue':
            case 'appeal_ban':
                await rulesCommand.handleButtonInteraction(interaction);
                break;
            default:
                await interaction.reply({ 
                    content: '❌ Unknown button interaction', 
                    ephemeral: true 
                });
        }
    } catch (error) {
        console.error('Button interaction error:', error);
        
        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ 
                    content: '❌ An error occurred while processing your request.', 
                    ephemeral: true 
                });
            } else {
                await interaction.reply({ 
                    content: '❌ An error occurred while processing your request.', 
                    ephemeral: true 
                });
            }
        } catch (followUpError) {
            console.error('Failed to send button error message:', followUpError);
        }
    }
}

async function handleSupportButton(interaction) {
    const supportEmbed = new EmbedBuilder()
        .setColor(config.colors.error)
        .setTitle('🆘 Need Help?')
        .setDescription('Our support team is here to help you!')
        .addFields(
            { name: '📧 Email Support', value: 'support@pteronest.com', inline: true },
            { name: '💬 Discord Support', value: `<#${interaction.guild.channels.cache.find(ch => ch.name === config.supportChannel)?.id || 'N/A'}>`, inline: true },
            { name: '📚 Documentation', value: config.links.docs, inline: true },
            { name: '🌐 Website', value: config.links.website, inline: true },
            { name: '📱 Discord Server', value: config.links.discord, inline: true }
        )
        .setTimestamp();
    
    await interaction.reply({ embeds: [supportEmbed], ephemeral: true });
}

async function handleInfoCommand(interaction) {
    const infoEmbed = new EmbedBuilder()
        .setColor(config.colors.primary)
        .setTitle('🦅 Pteronest Marketplace')
        .setDescription('The premier marketplace for Pterodactyl Panel ecosystem products.')
        .addFields(
            { name: '📊 Marketplace Stats', value: '• 1000+ Products\n• 500+ Sellers\n• 10,000+ Downloads\n• 99.9% Uptime', inline: true },
            { name: '🎯 Product Categories', value: '• Addons & Plugins\n• Themes & UI\n• Server Eggs\n• Scripts & Tools', inline: true },
            { name: '💎 Premium Features', value: '• Secure Payments\n• Instant Downloads\n• Seller Analytics\n• 24/7 Support', inline: true },
            { name: '🔗 Quick Links', value: `[Marketplace](${config.links.website}) • [Documentation](${config.links.docs}) • [Support](${config.links.support}) • [Discord](${config.links.discord})`, inline: false }
        )
        .setThumbnail(client.user.displayAvatarURL())
        .setTimestamp()
        .setFooter({ text: 'Pteronest - Empowering Pterodactyl Developers', iconURL: client.user.displayAvatarURL() });

    await interaction.reply({ embeds: [infoEmbed] });
}

async function handleProductsCommand(interaction) {
    const productsEmbed = new EmbedBuilder()
        .setColor(config.colors.success)
        .setTitle('🛍️ Featured Products')
        .setDescription('Discover the latest and most popular products on Pteronest!')
        .addFields(
            { name: '🔥 Trending', value: '• Advanced Server Manager\n• Dark Theme Pack\n• Auto-Backup System\n• Performance Optimizer', inline: false },
            { name: '⭐ Top Rated', value: '• Security Suite Pro\n• Custom Dashboard\n• Resource Monitor\n• Backup Manager', inline: false },
            { name: '🆕 New Releases', value: '• API Integration Kit\n• Mobile App Theme\n• Analytics Dashboard\n• Notification System', inline: false }
        )
        .setTimestamp()
        .setFooter({ text: `Browse all products at ${config.links.website}`, iconURL: client.user.displayAvatarURL() });

    const browseButton = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setLabel('Browse All Products')
                .setStyle(ButtonStyle.Link)
                .setURL(`${config.links.website}/products`)
        );

    await interaction.reply({ embeds: [productsEmbed], components: [browseButton] });
}

async function handleHelpCommand(interaction) {
    const helpEmbed = new EmbedBuilder()
        .setColor(config.colors.warning)
        .setTitle('❓ Help & Commands')
        .setDescription('Here are all the available commands:')
        .addFields(
            { name: '/info', value: 'Get information about Pteronest marketplace', inline: true },
            { name: '/products', value: 'View featured products', inline: true },
            { name: '/help', value: 'Show this help message', inline: true },
            { name: '/status', value: 'Check marketplace status', inline: true },
            { name: '/ping', value: 'Check bot latency', inline: true },
            { name: '/server', value: 'Get server information', inline: true },
            { name: '/user', value: 'Get user information', inline: true },
            { name: '/balance', value: 'Check your virtual currency balance', inline: true },
            { name: '/daily', value: 'Claim your daily reward', inline: true },
            { name: '/transactions', value: 'View your transaction history', inline: true },
            { name: '/setup', value: 'Setup Pteronest server structure (Admin only)', inline: true },
            { name: '/rules', value: 'Display server rules and guidelines', inline: true }
        )
        .addFields(
            { name: '🔗 Useful Links', value: `[Website](${config.links.website}) • [Docs](${config.links.docs}) • [Support](${config.links.support}) • [Discord](${config.links.discord})`, inline: false }
        )
        .setTimestamp()
        .setFooter({ text: 'Need more help? Contact our support team!', iconURL: client.user.displayAvatarURL() });

    await interaction.reply({ embeds: [helpEmbed] });
}

async function handleStatusCommand(interaction) {
    const statusEmbed = new EmbedBuilder()
        .setColor(config.colors.success)
        .setTitle('🟢 Pteronest Status')
        .setDescription('All systems are operational!')
        .addFields(
            { name: '🌐 Website', value: '🟢 Online', inline: true },
            { name: '💳 Payments', value: '🟢 Online', inline: true },
            { name: '📥 Downloads', value: '🟢 Online', inline: true },
            { name: '📧 Support', value: '🟢 Online', inline: true },
            { name: '🤖 Bot', value: '🟢 Online', inline: true },
            { name: '📊 API', value: '🟢 Online', inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Last updated', iconURL: client.user.displayAvatarURL() });

    await interaction.reply({ embeds: [statusEmbed] });
}

async function handlePingCommand(interaction) {
    const ping = Date.now() - interaction.createdTimestamp;
    const apiLatency = Math.round(client.ws.ping);
    
    const pingEmbed = new EmbedBuilder()
        .setColor(config.colors.info)
        .setTitle('🏓 Pong!')
        .addFields(
            { name: 'Bot Latency', value: `${ping}ms`, inline: true },
            { name: 'API Latency', value: `${apiLatency}ms`, inline: true }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [pingEmbed] });
}

async function handleServerCommand(interaction) {
    const guild = interaction.guild;
    const owner = await guild.fetchOwner();
    
    const serverEmbed = new EmbedBuilder()
        .setColor(config.colors.info)
        .setTitle(`📊 ${guild.name} Server Info`)
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .addFields(
            { name: '👑 Owner', value: owner.user.tag, inline: true },
            { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
            { name: '👥 Members', value: `${guild.memberCount}`, inline: true },
            { name: '💬 Channels', value: `${guild.channels.cache.size}`, inline: true },
            { name: '🎭 Roles', value: `${guild.roles.cache.size}`, inline: true },
            { name: '🚀 Boost Level', value: `${guild.premiumTier}`, inline: true }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [serverEmbed] });
}

async function handleUserCommand(interaction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const member = await interaction.guild.members.fetch(targetUser.id);
    
    const userEmbed = new EmbedBuilder()
        .setColor(config.colors.info)
        .setTitle(`👤 ${targetUser.username}'s Info`)
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .addFields(
            { name: '🆔 User ID', value: targetUser.id, inline: true },
            { name: '📅 Account Created', value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>`, inline: true },
            { name: '📥 Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
            { name: '🎭 Top Role', value: member.roles.highest.toString(), inline: true },
            { name: '🎨 Roles', value: `${member.roles.cache.size - 1}`, inline: true },
            { name: '🟢 Status', value: member.presence?.status || 'Offline', inline: true }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [userEmbed] });
}

client.on('error', (error) => {
    console.error('Bot error:', error);
});

client.on('warn', (warning) => {
    console.warn('Bot warning:', warning);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});

client.login(process.env.DISCORD_TOKEN); 