// const { REST, Routes } = require('discord.js');
// const config = require("../config/config.js");

// const rest = new REST({ version: '10' }).setToken(config.token);

// (async () => {
//   try {
//     console.log('🧹 Đang xóa tất cả GLOBAL commands...');
//     await rest.put(Routes.applicationCommands(config.clientId), { body: [] });
//     console.log('✅ Đã xóa toàn bộ GLOBAL commands!');
//   } catch (error) {
//     console.error('❌ Lỗi khi xóa GLOBAL commands:', error);
//   }
// })();

const { REST, Routes } = require('discord.js');
const config = require("../config/config.js");

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
    try {
        console.log('🧹 Đang xóa tất cả GUILD commands...');
        await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: [] });
        await rest.put(Routes.applicationCommands(config.clientId), { body: [] });
        console.log('✅ Đã xóa toàn bộ GUILD commands!');
    } catch (error) {
        console.error('❌ Lỗi khi xóa GUILD commands:', error);
    }
})();
