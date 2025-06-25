const { EmbedBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config');

class ServerSetup {
    constructor() {
        this.categories = {
            '🦅 PTERONEST': [
                { name: 'welcome', type: ChannelType.GuildText, topic: 'Welcome to Pteronest Marketplace!' },
                { name: 'announcements', type: ChannelType.GuildText, topic: 'Important announcements and updates' },
                { name: 'rules', type: ChannelType.GuildText, topic: 'Server rules and guidelines' }
            ],
            '🛍️ MARKETPLACE': [
                { name: 'product-showcase', type: ChannelType.GuildText, topic: 'Showcase your Pterodactyl products' },
                { name: 'product-requests', type: ChannelType.GuildText, topic: 'Request specific products or features' },
                { name: 'seller-verification', type: ChannelType.GuildText, topic: 'Apply to become a verified seller' }
            ],
            '💬 COMMUNITY': [
                { name: 'general', type: ChannelType.GuildText, topic: 'General discussion about Pterodactyl' },
                { name: 'help-support', type: ChannelType.GuildText, topic: 'Get help with Pterodactyl and products' },
                { name: 'showcase', type: ChannelType.GuildText, topic: 'Show off your Pterodactyl setups' },
                { name: 'off-topic', type: ChannelType.GuildText, topic: 'Off-topic discussions' }
            ],
            '🎮 GAMING': [
                { name: 'minecraft', type: ChannelType.GuildText, topic: 'Minecraft server discussions' },
                { name: 'other-games', type: ChannelType.GuildText, topic: 'Other game server discussions' },
                { name: 'server-setups', type: ChannelType.GuildText, topic: 'Share your server configurations' }
            ],
            '🔧 DEVELOPMENT': [
                { name: 'development', type: ChannelType.GuildText, topic: 'Development discussions and help' },
                { name: 'api-support', type: ChannelType.GuildText, topic: 'API and integration help' },
                { name: 'bug-reports', type: ChannelType.GuildText, topic: 'Report bugs and issues' }
            ],
            '🎵 VOICE CHANNELS': [
                { name: '🎵 Lobby', type: ChannelType.GuildVoice },
                { name: '🎮 Gaming', type: ChannelType.GuildVoice },
                { name: '💻 Development', type: ChannelType.GuildVoice },
                { name: '🎤 Support', type: ChannelType.GuildVoice }
            ]
        };
    }

    async handleSetupCommand(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            const errorEmbed = new EmbedBuilder()
                .setColor(config.colors.error)
                .setTitle('❌ Permission Denied')
                .setDescription('You need Administrator permissions to use this command.')
                .setTimestamp();

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        const confirmEmbed = new EmbedBuilder()
            .setColor(config.colors.warning)
            .setTitle('⚠️ Server Setup Confirmation')
            .setDescription('This will **DELETE ALL EXISTING CHANNELS** and create a new Pteronest server structure.')
            .addFields(
                { name: '🗑️ What will be deleted:', value: '• All text channels\n• All voice channels\n• All categories\n• All channel permissions', inline: false },
                { name: '✨ What will be created:', value: '• 6 organized categories\n• 15+ professional channels\n• Optimized permissions\n• Pteronest branding', inline: false },
                { name: '⚠️ Warning:', value: 'This action cannot be undone! Make sure you have a backup if needed.', inline: false }
            )
            .setTimestamp();

        const confirmRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('setup_confirm')
                    .setLabel('✅ Confirm Setup')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('setup_cancel')
                    .setLabel('❌ Cancel')
                    .setStyle(ButtonStyle.Secondary)
            );

        await interaction.reply({ embeds: [confirmEmbed], components: [confirmRow], ephemeral: true });
    }

    async handleSetupConfirm(interaction) {
        try {
            const progressEmbed = new EmbedBuilder()
                .setColor(config.colors.info)
                .setTitle('🔄 Server Setup in Progress')
                .setDescription('Setting up your Pteronest server... This may take a few moments.')
                .addFields(
                    { name: '📊 Progress', value: '🔄 Initializing...', inline: false }
                )
                .setTimestamp();

            await interaction.update({ embeds: [progressEmbed], components: [] });

            const guild = interaction.guild;
            let progressMessage = null;

            try {
                await this.updateProgress(interaction, '🗑️ Deleting existing channels...', 10);
                await this.deleteAllChannels(guild);

                await this.updateProgress(interaction, '📁 Creating categories...', 30);
                const categoryChannels = await this.createCategories(guild);

                await this.updateProgress(interaction, '💬 Creating text channels...', 60);
                await this.createTextChannels(guild, categoryChannels);

                await this.updateProgress(interaction, '🎵 Creating voice channels...', 80);
                await this.createVoiceChannels(guild, categoryChannels);

                await this.updateProgress(interaction, '⚙️ Setting up permissions...', 90);
                await this.setupPermissions(guild);

                await this.updateProgress(interaction, '✅ Setup complete!', 100);

                const successEmbed = new EmbedBuilder()
                    .setColor(config.colors.success)
                    .setTitle('🎉 Server Setup Complete!')
                    .setDescription('Your Pteronest server has been successfully configured!')
                    .addFields(
                        { name: '📁 Categories Created', value: Object.keys(this.categories).length.toString(), inline: true },
                        { name: '💬 Text Channels', value: this.getTextChannelCount().toString(), inline: true },
                        { name: '🎵 Voice Channels', value: this.getVoiceChannelCount().toString(), inline: true },
                        { name: '✨ Next Steps', value: '• Set up your bot permissions\n• Configure welcome messages\n• Add your server rules\n• Invite your community!', inline: false }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'Pteronest Server Setup', iconURL: interaction.client.user.displayAvatarURL() });

                await interaction.editReply({ embeds: [successEmbed] });

            } catch (error) {
                console.error('Setup error:', error);
                
                const errorEmbed = new EmbedBuilder()
                    .setColor(config.colors.error)
                    .setTitle('❌ Setup Failed')
                    .setDescription('An error occurred during server setup. Please try again or contact support.')
                    .addFields(
                        { name: 'Error', value: error.message, inline: false }
                    )
                    .setTimestamp();

                try {
                    await interaction.editReply({ embeds: [errorEmbed] });
                } catch (editError) {
                    await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
                }
            }

        } catch (error) {
            console.error('Setup confirmation error:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor(config.colors.error)
                .setTitle('❌ Setup Failed')
                .setDescription('Failed to start server setup. Please try again.')
                .setTimestamp();

            try {
                await interaction.editReply({ embeds: [errorEmbed] });
            } catch (editError) {
                await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }

    async updateProgress(interaction, status, percentage) {
        try {
            const progressEmbed = new EmbedBuilder()
                .setColor(config.colors.info)
                .setTitle('🔄 Server Setup in Progress')
                .setDescription('Setting up your Pteronest server... This may take a few moments.')
                .addFields(
                    { name: '📊 Progress', value: `${status} (${percentage}%)`, inline: false }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [progressEmbed] });
        } catch (error) {
            console.error('Progress update error:', error);
        }
    }

    async deleteAllChannels(guild) {
        const channels = guild.channels.cache.filter(channel => 
            channel.type !== ChannelType.GuildCategory && 
            channel.name !== 'general'
        );

        for (const channel of channels.values()) {
            try {
                await channel.delete();
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error(`Failed to delete channel ${channel.name}:`, error);
            }
        }
    }

    async createCategories(guild) {
        const categoryChannels = {};

        for (const [categoryName, channels] of Object.entries(this.categories)) {
            try {
                const category = await guild.channels.create({
                    name: categoryName,
                    type: ChannelType.GuildCategory
                });
                categoryChannels[categoryName] = category;
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                console.error(`Failed to create category ${categoryName}:`, error);
            }
        }

        return categoryChannels;
    }

    async createTextChannels(guild, categoryChannels) {
        for (const [categoryName, channels] of Object.entries(this.categories)) {
            if (categoryName === '🎵 VOICE CHANNELS') continue;

            const category = categoryChannels[categoryName];
            if (!category) continue;

            for (const channelConfig of channels) {
                if (channelConfig.type === ChannelType.GuildText) {
                    try {
                        await guild.channels.create({
                            name: channelConfig.name,
                            type: ChannelType.GuildText,
                            parent: category.id,
                            topic: channelConfig.topic,
                            permissionOverwrites: this.getChannelPermissions(channelConfig.name, guild)
                        });
                        await new Promise(resolve => setTimeout(resolve, 500));
                    } catch (error) {
                        console.error(`Failed to create text channel ${channelConfig.name}:`, error);
                    }
                }
            }
        }
    }

    async createVoiceChannels(guild, categoryChannels) {
        const voiceCategory = categoryChannels['🎵 VOICE CHANNELS'];
        if (!voiceCategory) return;

        const voiceChannels = this.categories['🎵 VOICE CHANNELS'];
        for (const channelConfig of voiceChannels) {
            if (channelConfig.type === ChannelType.GuildVoice) {
                try {
                    await guild.channels.create({
                        name: channelConfig.name,
                        type: ChannelType.GuildVoice,
                        parent: voiceCategory.id,
                        permissionOverwrites: this.getChannelPermissions(channelConfig.name, guild)
                    });
                    await new Promise(resolve => setTimeout(resolve, 500));
                } catch (error) {
                    console.error(`Failed to create voice channel ${channelConfig.name}:`, error);
                }
            }
        }
    }

    getChannelPermissions(channelName, guild) {
        const permissions = [];

        switch (channelName) {
            case 'announcements':
                permissions.push({
                    id: guild.roles.everyone.id,
                    deny: [PermissionFlagsBits.SendMessages],
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory]
                });
                break;
            case 'rules':
                permissions.push({
                    id: guild.roles.everyone.id,
                    deny: [PermissionFlagsBits.SendMessages],
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory]
                });
                break;
            case 'seller-verification':
                permissions.push({
                    id: guild.roles.everyone.id,
                    deny: [PermissionFlagsBits.SendMessages],
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory]
                });
                break;
            default:
                permissions.push({
                    id: guild.roles.everyone.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                });
        }

        return permissions;
    }

    async setupPermissions(guild) {
        try {
            const everyoneRole = guild.roles.everyone;
            
            await everyoneRole.setPermissions([
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory,
                PermissionFlagsBits.UseExternalEmojis,
                PermissionFlagsBits.AddReactions
            ]);
        } catch (error) {
            console.error('Failed to setup permissions:', error);
        }
    }

    getTextChannelCount() {
        let count = 0;
        for (const [categoryName, channels] of Object.entries(this.categories)) {
            if (categoryName !== '🎵 VOICE CHANNELS') {
                count += channels.filter(ch => ch.type === ChannelType.GuildText).length;
            }
        }
        return count;
    }

    getVoiceChannelCount() {
        const voiceChannels = this.categories['🎵 VOICE CHANNELS'];
        return voiceChannels ? voiceChannels.filter(ch => ch.type === ChannelType.GuildVoice).length : 0;
    }
}

module.exports = new ServerSetup(); 