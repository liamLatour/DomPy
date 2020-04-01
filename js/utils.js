const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const Store = require('electron-store');
const store = new Store();
const colors = JSON.parse(fs.readFileSync('colorThemes/' + store.get('colorTheme')));

function filewalker(dir, done) {
    let dirList = {
        "text": path.basename(dir),
        "id": dir,
        "children": []
    };

    fs.readdir(dir, function (err, list) {
        if (err) return done(err);

        var pending = list.length;

        if (!pending) return done(null, dirList);

        list.forEach(function (file) {
            file = path.resolve(dir, file);

            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    filewalker(file, function (err, res) {
                        dirList.children.push(res);
                        if (!--pending) done(null, dirList);
                    });
                } else {
                    if (!--pending) done(null, dirList);
                }
            });
        });
    });
};

function openDir(dir) {
    fs.readdir(dir, function (err, list) {
        if (err) return done(err);
        $("#folderContent").html('');

        list.forEach(function (file) {
            file = path.resolve(dir, file);

            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    $("#folderContent").append('<div class="col-auto mb-3">\
                                                    <div class="card" style="width: 5rem;height: 5rem;background-color: transparent;border: none;">\
                                                        <div class="card-body text-center" style="width: 100%;height: 100%;padding: 0;">\
                                                            <img src="./icons/folderIconB.svg" alt="Folder" data-path="' + file + '" class="folderClick icons" style="height: 100%;width: 100%;cursor: pointer;">\
                                                            <footer>' + path.basename(file) + '</footer>\
                                                        </div>\
                                                    </div >\
                                                </div > ');
                } else {
                    $("#folderContent").append('<div class="col-auto mb-3">\
                                                    <div class="card" style="width: 5rem;height: 5rem;background-color: transparent;border: none;">\
                                                        <div class="card-body text-center" style="width: 100%;height: 100%;padding: 0;">\
                                                            <img src="./icons/scriptIcon.svg" alt="Script" data-path="' + file + '" class="scriptClick icons" style="height: 100%;width: 100%;cursor: pointer;">\
                                                            <footer>' + path.basename(file) + '</footer>\
                                                        </div>\
                                                    </div>\
                                                </div>');
                }
                $('.icons').colorSVG(colors.textColor.tertiary);
            });
        });
    });
}