const fs = require('node:fs');
const path = require('node:path');
const logger = require('../helpers/getLogger');

function EventHandler(client, eventsPath) {
    const Log = logger.createChannel('event');
    Log.info('Loading...');
    const events = [];
    const eventsMap = new Map();
    fs.readdirSync(eventsPath).forEach((dir) => {
        Log.debug(`Loading ${dir}...`);
        const eventsLog = Log.createChild(dir);
        const eventPath = path.resolve(eventsPath, dir);
        const eventFiles = fs.readdirSync(eventPath).filter(file => file.endsWith('.js'));
        for (const file of eventFiles) {
            eventsLog.debug(`Loading ${dir} ${file}...`);
            const event = require(path.resolve(eventPath, file));
            event.logger = eventsLog.createChild(file);
            events.push(event);
            if (eventsMap.has(event.name)) {
                eventsMap.get(event.name).push(event);
            } else {
                eventsMap.set(event.name, [event]);
            }
            Log.debug(`Loaded ${dir} ${event.name} (${file})`);
        }
        Log.debug(`Loaded ${eventFiles.length} events for ${dir}`);
    });
    eventsMap.forEach((events, eventName) => {
        client.on(eventName ,(...args) => {
            events
                .filter(event => event.filter ? event.filter(...args) : true)
                .forEach((event) => {
                    new Promise(async () => {
                        try {
                            await event.execute(...args, event.logger);
                        } catch (error) {
                            event.logger.error(error);
                        }
                    });
                });
        });
    });
    Log.info(`Loaded ${events.length} events`);
    return events;
}

module.exports = EventHandler;