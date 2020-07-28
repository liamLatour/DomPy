class Hierarchy {
    constructor(container, componentState) {
        this.container = container;
        this.componentState = componentState;
        this.canRemove;
        this.canRename;
        this.ctxMenuParam = {
            elementClicked: null
        };
        this.ctxMenu;

        this.buildCtxMenu();
        this.instantiateLayout();
        this.events();
    }

    instantiateLayout() {
        var supThis = this;
        supThis.container.getElement().html('<div style="margin-top: 10px;"><div id="hierarchyTree"></div></div>')
            .find("#hierarchyTree").jstree({
                "plugins": ["wholerow", "dnd"],
                "dnd": {
                    'large_drag_target': true,
                    'large_drop_target': true
                },
                'core': {
                    'multiple': false,
                    "check_callback": true,
                    'themes': {
                        'name': 'proton',
                        'responsive': false,
                        'dots': false,
                        'icons': false
                    },
                    'data': []
                }
            }).on('changed.jstree rename_node.jstree', function (e, data) {
                var val = null;
                if ($('#hierarchyTree').jstree("get_selected", true) != 0) {
                    val = data.node;
                }
                $('body').trigger("componentView:load", [val]);
                $('body').trigger("visualScripting:load", [val]);
            }).on('contextmenu', '.jstree-anchor, .jstree-wholerow', function (e) {
                supThis.canRemove.enabled = true;
                supThis.canRename.enabled = true;
                supThis.ctxMenuParam.elementClicked = $('#hierarchyTree').jstree(true).get_node(e.target);
                supThis.ctxMenu.popup({
                    callback: function () {}
                });
                e.stopPropagation();
            });
    }

    events() {
        var supThis = this;
        $('body')
            .on('hierarchy:add', function (event, parent) {
                $('#hierarchyTree').jstree().create_node(parent, {
                    "text": "New Component"
                }, "last", function () {});
            })
            .on('hierarchy:remove', function (event, node) {
                $('#hierarchyTree').jstree().delete_node(node);
            })
            .on('hierarchy:rename', function (event, node, text) {
                $('#hierarchyTree').jstree().rename_node(node, text);
            })
            .on('global:open', function (event) {
                var dialog = remote.dialog;

                var options = {
                    //Placeholder 1
                    title: "Save file",

                    //Placeholder 2
                    defaultPath: "C:\\",

                    //Placeholder 4
                    buttonLabel: "Open DomJS File",

                    //Placeholder 3
                    filters: [{
                        name: 'Custom File Type',
                        extensions: ['dom']
                    }, {
                        name: 'All Files',
                        extensions: ['*']
                    }]
                }

                var filename = dialog.showOpenDialog(null, options).then(result => {
                    filename = result.filePaths[0];
                    if (filename === undefined) {
                        console.error('the user clicked the btn but didn\'t created a file');
                        return;
                    }
                    fs.readFile(filename, 'utf8', (err, data) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        console.log(JSON.parse(data));
                        $('#hierarchyTree').jstree(true).settings.core.data = JSON.parse(data);
                        $('#hierarchyTree').jstree(true).refresh();
                    })
                }).catch(err => {
                    console.error(err);
                });
            })
            .on('global:save', function (event) {
                var dialog = remote.dialog;

                var options = {
                    //Placeholder 1
                    title: "Save file",

                    //Placeholder 2
                    defaultPath: "C:\\MyConfiguration.dom",

                    //Placeholder 4
                    buttonLabel: "Save DomJS File",

                    //Placeholder 3
                    filters: [{
                        name: 'Custom File Type',
                        extensions: ['dom']
                    }, {
                        name: 'All Files',
                        extensions: ['*']
                    }]
                }

                var fileData = JSON.stringify($('#hierarchyTree').jstree(true).get_json('#'));

                var filename = dialog.showSaveDialog(null, options).then(result => {
                    filename = result.filePath;
                    if (filename === undefined) {
                        console.error('the user clicked the btn but didn\'t created a file');
                        return;
                    }
                    fs.writeFile(filename, fileData, (err) => {
                        if (err) {
                            console.error(err);
                            return
                        }
                        console.log('File saved');
                    });
                }).catch(err => {
                    console.error(err);
                });
            });

        supThis.container.getElement().on("contextmenu", function (e) {
            supThis.ctxMenuParam.elementClicked = null;
            supThis.canRemove.enabled = false;
            supThis.canRename.enabled = false;
            supThis.ctxMenu.popup({
                callback: function () {}
            });
        });
    }

    buildCtxMenu() {
        var supThis = this;
        supThis.ctxMenu = Menu.buildFromTemplate([{
            label: 'Add new',
            click: (menuItem, browserWindow, event) => {
                if (supThis.ctxMenuParam.elementClicked != null) {
                    $('body').trigger("hierarchy:add", [supThis.ctxMenuParam.elementClicked]);
                } else {
                    $('body').trigger("hierarchy:add", ["#"]);
                }
            }
        }, {
            label: 'Remove',
            id: 'remove',
            enabled: false,
            click: (menuItem, browserWindow, event) => {
                if (supThis.ctxMenuParam.elementClicked != null) {
                    $('body').trigger("hierarchy:remove", [supThis.ctxMenuParam.elementClicked]);
                }
            }
        }, {
            label: 'Rename',
            id: 'rename',
            enabled: false,
            click: (menuItem, browserWindow, event) => {
                if (supThis.ctxMenuParam.elementClicked != null) {
                    var input = '<span class="jstree-anchor  jstree-clicked" style="margin: 0;">\
                                        <i class="jstree-icon jstree-themeicon" role="presentation"></i>\
                                        <input value="' + supThis.ctxMenuParam.elementClicked.text + '" id="renameComponent" style="padding: 0px;display: inline-block;border: none;background-color: #3E3D32;color: white;">\
                                    </span>';
                    $("#" + supThis.ctxMenuParam.elementClicked.a_attr.id).remove();
                    $("#" + supThis.ctxMenuParam.elementClicked.li_attr.id)
                        .append(input)
                        .find('input')
                        .on('blur keyup', function (event) {
                            if (event.type == "keyup" && event.keyCode != 13) return;
                            var val = $('#renameComponent').val();
                            $('body').trigger("hierarchy:rename", [supThis.ctxMenuParam.elementClicked, val]);
                        }).focus();
                }
            }
        }]);

        supThis.canRemove = supThis.ctxMenu.getMenuItemById('remove');
        supThis.canRename = supThis.ctxMenu.getMenuItemById('rename');
    }
}