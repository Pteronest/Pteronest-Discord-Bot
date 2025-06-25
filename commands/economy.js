const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config');

class EconomySystem {
    constructor() {
        this.balances = new Map();
        this.transactions = [];
    }

    getBalance(userId) {
        return this.balances.get(userId) || 0;
    }

    addBalance(userId, amount) {
        const currentBalance = this.getBalance(userId);
        const newBalance = currentBalance + amount;
        this.balances.set(userId, newBalance);
        
        this.transactions.push({
            userId,
            type: 'add',
            amount,
            timestamp: new Date(),
            newBalance
        });
        
        return newBalance;
    }

    removeBalance(userId, amount) {
        const currentBalance = this.getBalance(userId);
        if (currentBalance < amount) {
            throw new Error('Insufficient funds');
        }
        
        const newBalance = currentBalance - amount;
        this.balances.set(userId, newBalance);
        
        this.transactions.push({
            userId,
            type: 'remove',
            amount,
            timestamp: new Date(),
            newBalance
        });
        
        return newBalance;
    }

    async handleBalanceCommand(interaction) {
        const userId = interaction.user.id;
        const balance = this.getBalance(userId);
        
        const balanceEmbed = new EmbedBuilder()
            .setColor(config.colors.success)
            .setTitle('💰 Your Balance')
            .setDescription(`**${interaction.user.username}**'s current balance`)
            .addFields(
                { name: '💳 Current Balance', value: `$${balance.toFixed(2)}`, inline: true },
                { name: '🆔 User ID', value: userId, inline: true }
            )
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Buy Credits')
                    .setStyle(ButtonStyle.Link)
                    .setURL(`${config.links.website}/credits`),
                new ButtonBuilder()
                    .setLabel('Transaction History')
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId('transactions')
            );

        await interaction.reply({ embeds: [balanceEmbed], components: [buttons] });
    }

    async handleTransactionsCommand(interaction) {
        const userId = interaction.user.id;
        const userTransactions = this.transactions
            .filter(t => t.userId === userId)
            .slice(-10)
            .reverse();

        if (userTransactions.length === 0) {
            const noTransactionsEmbed = new EmbedBuilder()
                .setColor(config.colors.warning)
                .setTitle('📊 Transaction History')
                .setDescription('No transactions found for your account.')
                .setTimestamp();

            await interaction.reply({ embeds: [noTransactionsEmbed], ephemeral: true });
            return;
        }

        const transactionFields = userTransactions.map(t => ({
            name: `${t.type === 'add' ? '➕' : '➖'} $${t.amount.toFixed(2)}`,
            value: `<t:${Math.floor(t.timestamp.getTime() / 1000)}:R> | Balance: $${t.newBalance.toFixed(2)}`,
            inline: false
        }));

        const transactionsEmbed = new EmbedBuilder()
            .setColor(config.colors.info)
            .setTitle('📊 Recent Transactions')
            .setDescription(`Last 10 transactions for **${interaction.user.username}**`)
            .addFields(transactionFields)
            .setTimestamp();

        await interaction.reply({ embeds: [transactionsEmbed], ephemeral: true });
    }

    async handleDailyCommand(interaction) {
        const userId = interaction.user.id;
        const dailyAmount = 10.00;
        
        try {
            const newBalance = this.addBalance(userId, dailyAmount);
            
            const dailyEmbed = new EmbedBuilder()
                .setColor(config.colors.success)
                .setTitle('🎁 Daily Reward Claimed!')
                .setDescription(`You received **$${dailyAmount.toFixed(2)}** as your daily reward!`)
                .addFields(
                    { name: '💰 New Balance', value: `$${newBalance.toFixed(2)}`, inline: true },
                    { name: '⏰ Next Daily', value: 'Available in 24 hours', inline: true }
                )
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .setTimestamp();

            await interaction.reply({ embeds: [dailyEmbed] });
        } catch (error) {
            const errorEmbed = new EmbedBuilder()
                .setColor(config.colors.error)
                .setTitle('❌ Error')
                .setDescription('Failed to claim daily reward. Please try again later.')
                .setTimestamp();

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
}

module.exports = new EconomySystem(); 