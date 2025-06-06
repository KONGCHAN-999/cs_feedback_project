(function (PLUGIN_ID) {
  kintone.events.on('app.record.index.show', async () => {
    const config = kintone.plugin.app.getConfig(PLUGIN_ID);
    if (config && config.config) {
      const parsedConfig = JSON.parse(config.config);
      console.log('Plugin config:123', parsedConfig);
    } else {
      console.log('No plugin config found.');
    }
  });
})(kintone.$PLUGIN_ID);
