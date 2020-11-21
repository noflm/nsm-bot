// Discord.jsの読み込み
const Discord = require('discord.js');
// Discord.jsでbotクライアントを作成
const client = new Discord.Client();
// config.jsonファイルの読み込み
const config = require('./config.json');


client.once('ready', () => {
	console.log('準備完了！');
});

// botトークンからログイン
client.login(config.token);

// メッセージが送信された際の基本動作
client.on('message', async message => {

	// botが参加しているDiscordサーバー名と参加中の人数を表示
	if (message.content === `${config.prefix}server`) {
		const embed = new Discord.MessageEmbed()
			.setAuthor(`サーバー名: ${message.guild.name}\n合計人数: ${message.guild.memberCount}人`)
			.setColor('#0099ff')
			.setTimestamp()
			.setFooter('noflm Server Manager');
		message.channel.send(embed);
		return;
	}

	// コマンド実行者のユーザー名(ニックネームではない)とユーザーIDを表示
	if (message.content === `${config.prefix}ui`) {
		const embed = new Discord.MessageEmbed()
			.setAuthor(`あなたの名前: ${message.author.username}\nあなたのID: ${message.author.id}`)
			.setColor('#0099ff')
			.setTimestamp()
			.setFooter('noflm Server Manager');

		message.channel.send(embed);
		return;
	}

	// コマンド実行者のPingを計測
	if(message.content === `${config.prefix}ping`) {

		// It sends the user "Pinging"
		message.channel.send('Pingを計測中...').then(m =>{
			// The math thingy to calculate the user's ping
			const ping = m.createdTimestamp - message.createdTimestamp;

			// Basic embed
			const embed = new Discord.MessageEmbed()
				.setAuthor(`あなたのPingは${ping}msです`)
				.setColor('#0099ff')
				.setTimestamp()
				.setFooter('noflm Server Manager');

			// Then It Edits the message with the ping variable embed that you created
			m.edit(embed);
		});
	}

});

// メッセージリンクからメッセージを取得後、埋め込みで送信する
client.on('message', async (message) => {
	const URL_PATTERN = /http(?:s)?:\/\/(?:.*)?discord(?:app)?\.com\/channels\/(?:\d{17,19})\/(?<channelId>\d{17,19})\/(?<messageId>\d{17,19})/g;
	let result;

	while ((result = URL_PATTERN.exec(message.content)) !== null) {
		const group = result.groups;
		client.channels.fetch(group.channelId)
			.then(channel => channel.messages.fetch(group.messageId))
			.then(targetMessage => new Discord.MessageEmbed()
				.setColor('#0099ff')
				.setDescription(targetMessage)
				.setTimestamp()
				.setFooter('noflm Server Manager'))
			.then(embed => message.channel.send(embed));
		return;
	}
});

// Voiceチャンネル参加通知(反応しない場合が多い)
const mainChannelId = '758372112283992075';

client.on('voiceStateUpdate', (oldState, newState) =>{
	if(oldState.voice.channelID === undefined && newState.voice.channelID !== undefined) {
		if(client.channels.cache.get(newState.voice.channelID).members.size == 1) {
			newState.voice.channel.createInvite({ 'maxAge':'0' })
				.then(invite => client.channels.cache.get(mainChannelId).send(
					'<@' + newState.user.id + '> が通話を開始しました！\n' + invite.url,
				));
		}
	}
});
