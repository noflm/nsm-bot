// Discord.jsの読み込み
const Discord = require('discord.js');
// Discord.jsでbotクライアントを作成
const client = new Discord.Client();
// config.jsonファイルの読み込み
const config = require('./config.json');
// ふりーとーくのチャンネルID
const mainChannelId = '758372112283992075';

client.once('ready', () => {
	console.log('準備完了！');
});

// botトークンからログイン
client.login(config.token);

// メッセージが送信された際の基本動作
client.on('message', async message => {

	if (!message.content.startsWith(config.prefix)) return;
	const args = message.content
	// prefixを切り抜く
		.slice(config.prefix.length)
	// content両端の空白を削除
		.trim()
	// spaceで区切って分割
		.split(/ +/);
	// 配列から先頭を削除(commandの名前となる部分)
	// .toLowerCase()をshiftの後につければ全角半角どっちでもおーけーになります
	const command = args.shift();

	// botが参加しているDiscordサーバー名と参加中の人数を表示
	if (command === 'server') {
		const embed = new Discord.MessageEmbed()
			.setAuthor(`サーバー名: ${message.guild.name}\n合計人数: ${message.guild.memberCount}人`)
			.setColor('#0099ff')
			.setTimestamp()
			.setFooter('noflm Server Manager');
		message.channel.send(embed);
		return;
	}

	// コマンド実行者のユーザー名(ニックネームではない)とユーザーIDを表示
	if (command === 'ui') {
		const embed = new Discord.MessageEmbed()
			.setAuthor(`あなたの名前: ${message.author.username}\nあなたのID: ${message.author.id}`)
			.setColor('#0099ff')
			.setTimestamp()
			.setFooter('noflm Server Manager');

		message.channel.send(embed);
		return;
	}

	// コマンド実行者のPingを計測
	if(command === 'ping') {

		// コマンド実行者に'Pingを計測中...'を送信
		message.channel.send('Pingを計測中...').then(m =>{
			// Pingを計測処理
			const ping = m.createdTimestamp - message.createdTimestamp;

			// 埋め込み
			const embed = new Discord.MessageEmbed()
				.setAuthor(`あなたのPingは${ping}msです`)
				.setColor('#0099ff')
				.setTimestamp()
				.setFooter('noflm Server Manager');

			// 計測結果を送信
			m.edit(embed);
		});
	}

	// helpコマンド
	if (command === 'help') {
		const embed = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle('**noflm Server Manager Help**')
			.setDescription('noflm Server Manage のコマンド一覧です')
			.addField('**__!nsm help__**', 'このbotのヘルプを表示')
			.addField('**__!nsm server__**', 'botが参加中のDiscordサーバー名と参加中の人数を表示')
			.addField('**__!nsm ui__**', 'コマンド実行者のユーザー名(ニックネームではない)とユーザーIDを表示')
			.addField('**__!nsm ping__**', 'コマンド実行者のPingを計測')
			.addField('**__!nsm omikuji__**', 'おみくじが引けます(たまに変なの出ますが気にせずにどうぞ)')
			.addField('**__にゃっはろ〜__**', '「にゃっはろ〜」と送るとそのまま返ってきます。ただそれだけ')
			.addField('**__こんばんは,こん,etc...__**', '挨拶を返してくれます(こんばんはしかありません)')
			.addField('**__botにメンション__**', 'メッセージを返します。ただそれだけ')
			.addField('**__メッセージリンク__**', 'メッセージリンクからメッセージを取得後、埋め込みで送信')
			.setTimestamp()
			.setFooter('noflm Server Manager', 'https://i.imgur.com/wSTFkRM.png');

		message.channel.send(embed);
		return;
	}

	// おみくじ機能
	if (command === 'omikuji') {
		const arr = ['**__おめでとうございます!:tada:大吉です!:tada:__**', 'ご利用ありがとうございます!吉がでました!', '__残念、、、凶が出てしまいました、、、:sob:__', 'にゃっはろ〜!', '**^ら^**', 'な〜んでもしてくれる！ししろぼたん！'];
		const weight = [5, 30, 5, 15, 25, 20];
		lotteryByWeight(message.channel.id, arr, weight);
	}

	function lotteryByWeight(channelId, arr, weight) {
		let totalWeight = 0;
		let i;
		for (i = 0; i < weight.length; i++) {
			totalWeight += weight[i];
		}
		let random = Math.floor(Math.random() * totalWeight);
		for (i = 0; i < weight.length; i++) {
			if (random < weight[i]) {
				message.channel.send(arr[i]);
				return;
			}
			else{
				random -= weight[i];
			}
		}
		console.log('lottery error');
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

// Voiceチャンネル参加通知
client.on('voiceStateUpdate', async (oldState, newState) => {
	const newMember = newState.member.voice.channel;
	const oldMember = oldState.member.voice.channel;

	// メンバーがボイチャに入ったとき
	if (newMember !== null) {
		// invite linkを作成
		const invite = await newState.channel.createInvite();
		// channelを取得
		const channel = client.channels.cache.get(mainChannelId);
		channel.send(`<@${newState.member.user.id}> が通話を開始しました！\n${invite.url}`);
	}
	// メンバーがボイチャから抜けたとき
	else if (oldMember === null) {
		console.log(`${oldState.member.user.tag} が ${oldState.channel.name} を退出しました`);
	}
});
