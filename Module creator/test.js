const moduleCreator = require('./moduleCreator.js');

var package = new moduleCreator.Package("Test", "test.js");

package.addConfig("Data", "GPIO", "");
package.addConfig("Receiver pin 1", "GPIO", "");
package.addConfig("Receiver pin 2", "GPIO", "");

var sniffer = new moduleCreator.Module("Sniffer", "getCodes");
sniffer.addInput("Launch", "trigger", "");

var trigger = new moduleCreator.Module("Trigger", "switchSocket");
trigger.addInput("Socket number", "int", "");
trigger.addInput("ON/OFF", "bool", "");

package.addModule(sniffer);
package.addModule(trigger);

function getCodes() {

}

function switchSocket() {

}

package.createConfig();