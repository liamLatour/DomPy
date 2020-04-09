function Assets(container, componentState) {
    $('body').on('updateTree', function () {
        fileWalker(componentState.selectedFolder, function (err, output) {
            if (err) {
                throw err;
            }
            $('#assetsTree').jstree(true).settings.core.data = output;
            $('#assetsTree').jstree(true).refresh(false, function (state) {
                if (state.core.selected.length == 0) {
                    state.core.selected = [componentState.selectedFolder];
                    state.core.open = [componentState.selectedFolder];
                }
                return state;
            });
        });
    });

    var ctxMenuParam = {
        elementClicked: null
    }

    const ctxMenu = Menu.buildFromTemplate([{
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
            if (ctxMenuParam.elementClicked != null) {
                rimraf($(ctxMenuParam.elementClicked).data("path"), function () { console.log("done"); });
                $('body').trigger("updateTree");
            }
        }
    }]);

    container.getElement().html('<div class="container-fluid" style="height: 100%">\
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
            var canDelete = ctxMenu.getMenuItemById('delete');
            canDelete.enabled = true;
            ctxMenuParam.elementClicked = this;
            ctxMenu.popup({
                callback: function () {
                    ctxMenuParam.elementClicked = null;
                    canDelete.enabled = false;
                }
            });
            event.stopPropagation();
        }).on("contextmenu", "#folderCol", function (e) {
            ctxMenu.popup({
                callback: function () {
                }
            });
        }).find('#assetsTree').jstree({
            "plugins" : ["wholerow"],
            'core': {
                'multiple': false,
                "check_callback" : true,
                'themes': {
                    'name': 'proton',
                    'responsive': false,
                    "dots": false
                },
                'data': []
            }
        }).on("changed.jstree", function (e, data) {
            if (data.node == undefined) return;
            container.extendState({
                selectedFolder: data.node.id
            });
            openDir(data.node.id);
        });

    $('body').trigger("updateTree");
}