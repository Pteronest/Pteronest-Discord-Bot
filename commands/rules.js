const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config');

class RulesCommand {
    constructor() {
        this.rules = [
            {
                number: 1,
                title: "Be Respectful",
                description: "Treat all members with respect and kindness. No harassment, bullying, or hate speech."
            },
            {
                number: 2,
                title: "No Spam",
                description: "Avoid excessive messaging, repeated content, or disruptive behavior."
            },
            {
                number: 3,
                title: "Stay On Topic",
                description: "Keep conversations relevant to the channel's purpose and Pteronest marketplace."
            },
            {
                number: 4,
                title: "No Self-Promotion",
                description: "Do not advertise products or services without permission from staff."
            },
            {
                number: 5,
                title: "Follow Discord ToS",
                description: "All Discord Terms of Service and Community Guidelines must be followed."
            },
            {
                number: 6,
                title: "No NSFW Content",
                description: "Keep all content family-friendly and appropriate for all ages."
            },
            {
                number: 7,
                title: "Use Appropriate Channels",
                description: "Post content in the correct channels and respect channel-specific rules."
            },
            {
                number: 8,
                title: "No Impersonation",
                description: "Do not impersonate staff members, developers, or other users."
            },
            {
                number: 9,
                title: "Report Issues",
                description: "Report rule violations to staff instead of taking matters into your own hands."
            },
            {
                number: 10,
                title: "Have Fun!",
                description: "Enjoy your time in our community and help make it a great place for everyone."
            }
        ];
    }

    async handleRulesCommand(interaction) {
        const rulesEmbed = new EmbedBuilder()
            .setColor('#FDBA74') 
            .setTitle('📜 Server Rules')
            .setDescription('Welcome to **Pteronest**! Please read and follow these rules to ensure a positive experience for everyone.')
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setFooter({ 
                text: 'Pteronest Community Rules', 
                iconURL: interaction.guild.iconURL({ dynamic: true }) 
            })
            .setTimestamp();

        // Add rules as fields
        this.rules.forEach(rule => {
            rulesEmbed.addFields({
                name: `**${rule.number}.** ${rule.title}`,
                value: rule.description,
                inline: false
            });
        });

        rulesEmbed.addFields({
            name: '⚠️ Consequences',
            value: 'Breaking these rules may result in warnings, temporary mutes, or permanent bans depending on the severity.',
            inline: false
        });

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('📋 Report Issue')
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId('report_issue'),
                new ButtonBuilder()
                    .setLabel('🛡️ Appeal Ban')
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId('appeal_ban'),
                new ButtonBuilder()
                    .setLabel('🌐 Visit Website')
                    .setStyle(ButtonStyle.Link)
                    .setURL(config.links.website)
            );

        await interaction.reply({ embeds: [rulesEmbed], components: [buttons] });
    }

    async handleButtonInteraction(interaction) {
        switch (interaction.customId) {
            case 'report_issue':
                const reportEmbed = new EmbedBuilder()
                    .setColor('#FDBA74')
                    .setTitle('📋 Report an Issue')
                    .setDescription('To report a rule violation or issue:')
                    .addFields(
                        { name: '1️⃣ Use the Report Feature', value: 'Right-click on the message and select "Report Message"', inline: false },
                        { name: '2️⃣ Contact Staff', value: `Message a moderator or use <#${interaction.guild.channels.cache.find(c => c.name === 'support')?.id || 'support'}>`, inline: false },
                        { name: '3️⃣ Provide Details', value: 'Include screenshots and context when possible', inline: false }
                    )
                    .setTimestamp();
                
                await interaction.reply({ embeds: [reportEmbed], ephemeral: true });
                break;

            case 'appeal_ban':
                const appealEmbed = new EmbedBuilder()
                    .setColor('#FDBA74')
                    .setTitle('🛡️ Appeal a Ban')
                    .setDescription('If you believe you were banned unfairly:')
                    .addFields(
                        { name: '📧 Email Appeal', value: 'Send an appeal to support@pteronest.com', inline: false },
                        { name: '📝 Include Information', value: 'Your Discord ID, reason for appeal, and any evidence', inline: false },
                        { name: '⏰ Response Time', value: 'Appeals are reviewed within 24-48 hours', inline: false }
                    )
                    .setTimestamp();
                
                await interaction.reply({ embeds: [appealEmbed], ephemeral: true });
                break;
        }
    }
}

module.exports = new RulesCommand(); 