const moment = require("moment-timezone");
const AppSettings = require("../utilities/settingsConfig");

moment.tz.setDefault(AppSettings._appTimezone);

module.exports = moment;
