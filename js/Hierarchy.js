function Hierarchy(container, componentState) {
    $('body')
        .on('hierarchy:add', function (event, parent) {
            $('#hierarchyTree').jstree().create_node(parent, {
                "text": "New Component"
            }, "last", function () { });
        })
        .on('hierarchy:remove', function (event, node) {
            $('#hierarchyTree').jstree().delete_node(node);
        })
        .on('hierarchy:rename', function (event, node, text) {
            $('#hierarchyTree').jstree().rename_node(node, text);
        });


    const ctxMenu = Menu.buildFromTemplate([{
        label: 'Add new',
        click: (menuItem, browserWindow, event) => {
            if (ctxMenuParam.elementClicked != null) {
                $('body').trigger("hierarchy:add", [ctxMenuParam.elementClicked]);
            } else {
                $('body').trigger("hierarchy:add", ["#"]);
            }
        }
    }, {
        label: 'Remove',
        id: 'remove',
        enabled: false,
        click: (menuItem, browserWindow, event) => {
            if (ctxMenuParam.elementClicked != null) {
                $('body').trigger("hierarchy:remove", [ctxMenuParam.elementClicked]);
            }
        }
    }, {
        label: 'Rename',
        id: 'rename',
        enabled: false,
        click: (menuItem, browserWindow, event) => {
            if (ctxMenuParam.elementClicked != null) {
                var input = '<span class="jstree-anchor  jstree-clicked" style="margin: 0;">\
                                <i class="jstree-icon jstree-themeicon" role="presentation"></i>\
                                <input value="' + ctxMenuParam.elementClicked.text + '" id="renameComponent" style="padding: 0px;display: inline-block;border: none;background-color: #3E3D32;color: white;">\
                            </span>';
                $("#" + ctxMenuParam.elementClicked.a_attr.id).remove();
                $("#" + ctxMenuParam.elementClicked.li_attr.id)
                    .append(input)
                    .find('input')
                    .on('blur keyup', function (event) {
                        if (event.type == "keyup" && event.keyCode != 13) return;
                        var val = $('#renameComponent').val();
                        $('body').trigger("hierarchy:rename", [ctxMenuParam.elementClicked, val]);
                    }).focus();
            }
        }
    }]);

    var ctxMenuParam = {
        elementClicked: null
    };
    var canRemove = ctxMenu.getMenuItemById('remove');
    var canRename = ctxMenu.getMenuItemById('rename');

    container.getElement().html('<div style="margin-top: 10px;"><div id="hierarchyTree"></div></div>')
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
        }).on('contextmenu', '.jstree-anchor, .jstree-wholerow', function (e) {
            canRemove.enabled = true;
            canRename.enabled = true;
            ctxMenuParam.elementClicked = $('#hierarchyTree').jstree(true).get_node(e.target);
            ctxMenu.popup({
                callback: function () { }
            });
            e.stopPropagation();
        });

    container.getElement().on("contextmenu", function (e) {
        ctxMenuParam.elementClicked = null;
        canRemove.enabled = false;
        canRename.enabled = false;
        ctxMenu.popup({
            callback: function () { }
        });
    });
}