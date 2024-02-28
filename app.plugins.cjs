const vue = require('@vitejs/plugin-vue');
const unpluginVueI18n = require('@intlify/unplugin-vue-i18n');

module.exports = [vue({ isProduction: true, customElements: ['i18n'] }), unpluginVueI18n.unplugin.vite()];
