class Assets {
    constructor(container, componentState) {
        this.container = container;
        this.componentState = componentState;

        this.ctxMenuParam = {
            elementClicked: null
        };
        this.ctxMenu;

        this.buildCtxMenu();
        this.instantiateLayout();
        this.events();
        $('body').trigger("updateTree");
    }

    fileWalker(dir, done) {
        var supThis = this;
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
                        supThis.fileWalker(file, function (err, res) {
                            dirList.children.push(res);
                            if (!--pending) done(null, dirList);
                        });
                    } else {
                        if (!--pending) done(null, dirList);
                    }
                });
            });
        });
    }

    openDir(dir) {
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
                                                    </div >');
                    } else {
                        var addedScript = $('<div class="col-auto mb-3 scriptFromAssets">\
                                                <div class="card" style="width: 5rem;height: 5rem;background-color: transparent;border: none;">\
                                                    <div class="card-body text-center" style="width: 100%;height: 100%;padding: 0;">\
                                                        <img src="./icons/scriptIcon.svg" alt="Script" data-path="' + file + '" class="scriptClick icons" style="height: 100%;width: 100%;cursor: pointer;">\
                                                        <footer>' + path.basename(file) + '</footer>\
                                                    </div>\
                                                </div>\
                                            </div>').draggable({
                            helper: function (event) {
                                var helper = $('<div class="col-auto mb-3" style="position: fixed;z-index:5;">\
                                            <div class="card" style="width: 5rem;height: 5rem;background-color: transparent;border: none;">\
                                                <div class="card-body text-center" style="width: 100%;height: 100%;padding: 0;">\
                                                    <img src="./icons/scriptIcon.svg" alt="Script" class="icons" style="height: 100%;width: 100%;">\
                                                    <footer>' + path.basename(file) + '</footer>\
                                                </div>\
                                            </div >\
                                        </div>');
                                $(helper).find('.icons').colorSVG(colors.textColor.tertiary);
                                return helper;
                            }
                        });
                        $("#folderContent").append(addedScript);
                    }
                    $('.icons').colorSVG(colors.textColor.tertiary);
                });
            });
        });
    }

    instantiateLayout() {
        var supThis = this;
        supThis.container.getElement().html('<div class="container-fluid" style="height: 100%">\
                                        <div class="row" style="height: 100%">\
                                            <div class="col" style="flex: 0 0 5cm;overflow-y: scroll;max-height: 100%;padding: 10px;">\
                                                <div id="assetsTree"></div>\
                                            </div>\
                                            <div class="col" id="folderCol">\
                                                <div class="d-flex flex-wrap mt-4 justify-content-start" id="folderContent">\
                                            </div>\
                                        </div>\
                                    </div>')
            .on("click", ".folderClick", function () {
                $('#assetsTree').jstree(true).deselect_all(true);
                $('#assetsTree').jstree(true).select_node($(this).data("path"));
            }).on("contextmenu", ".folderClick, .scriptClick", function (event) {
                var canDelete = supThis.ctxMenu.getMenuItemById('delete');
                canDelete.enabled = true;
                supThis.ctxMenuParam.elementClicked = this;
                supThis.ctxMenu.popup({
                    callback: function () {
                        supThis.ctxMenuParam.elementClicked = null;
                        canDelete.enabled = false;
                    }
                });
                event.stopPropagation();
            }).on("contextmenu", "#folderCol", function (e) {
                supThis.ctxMenu.popup({
                    callback: function () { }
                });
            }).find('#assetsTree').jstree({
                "plugins": ["wholerow"],
                'core': {
                    'multiple': false,
                    "check_callback": true,
                    'themes': {
                        'name': 'proton',
                        'responsive': false,
                        "dots": false
                    },
                    'data': []
                }
            }).on("changed.jstree", function (e, data) {
                if (data.node == undefined) return;
                supThis.container.extendState({
                    selectedFolder: data.node.id
                });
                supThis.openDir(data.node.id);
            });
    }

    events() {
        var supThis = this;
        $('body').on('updateTree', function () {
            supThis.fileWalker(supThis.componentState.selectedFolder, function (err, output) {
                if (err) {
                    throw err;
                }
                $('#assetsTree').jstree(true).settings.core.data = output;
                $('#assetsTree').jstree(true).refresh(false, function (state) {
                    if (state.core.selected.length == 0) {
                        state.core.selected = [supThis.componentState.selectedFolder];
                        state.core.open = [supThis.componentState.selectedFolder];
                    }
                    return state;
                });
            });
        });
    }

    buildCtxMenu() {
        var supThis = this;
        supThis.ctxMenu = Menu.buildFromTemplate([{
            label: 'Create',
            submenu: [{
                label: 'Folder',
                click: (menuItem, browserWindow, event) => {
                    var placeholder = $('<div class="col-auto mb-3 placeholder">\
                                                <div class="card" style="width: 5rem;height: 5rem;background-color: transparent;border: none;">\
                                                    <div class="card-body text-center" style="width: 100%;height: 100%;padding: 0;">\
                                                        <img src="./icons/folderIconB.svg" class="icons" alt="Folder" style="height: 100%;width: 100%;cursor: pointer;">\
                                                        <footer>\
                                                            <input type="text" id="newFolderInput" placeholder="New Folder" autofocus style="width: 150%;margin-left: -25%;border: solid var(--green) 0.16em; border-radius: 5px;background-color: transparent;padding-left: 5px;">\
                                                        </footer>\
                                                    </div>\
                                                </div>\
                                            </div>').on('blur keyup', '#newFolderInput', function (event) {
                        if (event.type == "keyup" && event.keyCode != 13) return;
                        try {
                            fs.mkdirSync(myLayout.root.getItemsById('assets')[0].config.componentState.selectedFolder + '\\' + $('#newFolderInput').val());
                        } catch (err) {
                            console.error(err);
                        }

                        $('.placeholder').remove();
                        $('body').trigger("updateTree");
                    });
                    $("#folderContent").append(placeholder).find('.icons').colorSVG(colors.textColor.tertiary);
                }
            },
            {
                label: 'Js script',
                click: (menuItem, browserWindow, event) => {
                    var placeholder = $('<div class="col-auto mb-3 placeholder">\
                                                <div class="card" style="width: 5rem;height: 5rem;background-color: transparent;border: none;">\
                                                    <div class="card-body text-center" style="width: 100%;height: 100%;padding: 0;">\
                                                        <img src="./icons/scriptIcon.svg" class="icons" alt="Script" style="height: 100%;width: 100%;cursor: pointer;">\
                                                        <footer>\
                                                            <input type="text" id="newScriptInput" placeholder="New Script" style="width: 150%;margin-left: -25%;border: solid var(--green) 0.16em; border-radius: 5px;background-color: transparent;padding-left: 5px;">\
                                                        </footer>\
                                                    </div>\
                                                </div>\
                                            </div>').find('input').on('blur keyup', function (event) {
                        if (event.type == "keyup" && event.keyCode != 13) return;
                        var val = $('#newScriptInput').val();
                        if (path.extname(val) != '.js') {
                            val += '.js';
                        }
                        try {
                            fs.writeFileSync(myLayout.root.getItemsById('assets')[0].config.componentState.selectedFolder + '\\' + val, "");
                        } catch (err) {
                            console.error(err);
                        }
                        $('.placeholder').remove();
                        $('body').trigger("updateTree");
                    }).focus();
                    $("#folderContent").append(placeholder).find('.icons').colorSVG(colors.textColor.tertiary);
                }
            }
            ]
        }, {
            type: 'separator'
        }, {
            label: 'Delete',
            id: 'delete',
            enabled: false,
            click: (menuItem, browserWindow, event) => {
                if (supThis.ctxMenuParam.elementClicked != null) {
                    rimraf($(supThis.ctxMenuParam.elementClicked).data("path"), function () {
                        console.log("done");
                    });
                    $('body').trigger("updateTree");
                }
            }
        }]);
    }
}