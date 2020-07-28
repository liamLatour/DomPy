const fs = require('fs');

class Package {
    constructor(title, file) {
        this.title = title;
        this.file = file;
        this.config = [];
        this.members = [];
    }

    addModule(module) {
        this.members.push(module);
    }

    addConfig(name, type, variable) {
        this.config.push({
            "name": name,
            "type": type,
            "variable": variable
        });
    }

    createConfig() {
        var JSONconfig = {};

        JSONconfig.title = this.title;
        JSONconfig.JSfile = this.file;
        JSONconfig.config = this.config;

        JSONconfig.members = [];
        for (var module of this.members) {
            JSONconfig.members.push(module.json);
        }

        fs.writeFile(this.file.substring(0, this.file.indexOf('.')) + '.json', JSON.stringify(JSONconfig), (err) => {
            if (err) {
                console.error(err);
                return
            }
            console.log('File saved');
        });
    }
}

class Module {
    constructor(name, func) {
        this.name = name;
        this.func = func;
        this.io = [];
    }

    addInput(text, type, variable) {
        this.io.push({
            "side": "input",
            "text": text,
            "color": "#e8ad47",
            "type": type,
            "variable": variable
        });
    }

    addOutput(text, type, variable) {
        this.io.push({
            "side": "output",
            "text": text,
            "color": "#e8ad47",
            "type": type,
            "variable": variable
        });
    }

    get json() {
        return {
            "title": this.name,
            "function": this.func,
            "body": this.io
        };
    }
}

exports.Package = Package;
exports.Module = Module;