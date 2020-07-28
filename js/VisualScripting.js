class VisualScripting {
    constructor(container, componentState) {
        this.container = container;
        this.componentState = componentState;
        this.draw2DCanvas = null;
        this.selectedNode = null;

        var supThis = this;
        $(function () {
            container.getElement().html('<div id="visualScriptingDiv"></div>')
                .on('contextmenu', function () {
                    supThis.ctxMenu.popup({
                        callback: function () {}
                    }, {
                        passive: true
                    });
                });
            supThis.clear();
            supThis.draw();
            supThis.events();
        });
    }

    /*TODO: working area is not updated*/
    draw() {
        var supThis = this;

        if (supThis.draw2DCanvas == null) {
            supThis.draw2DCanvas = new draw2d.Canvas('visualScriptingDiv');
        }

        supThis.draw2DCanvas.setScrollArea($(window));


        supThis.draw2DCanvas.installEditPolicy(new draw2d.policy.connection.DragConnectionCreatePolicy({
            createConnection: function () {
                var connection = new draw2d.Connection({
                    stroke: 3,
                    outlineStroke: 1,
                    outlineColor: "#303030",
                    color: "91B93E",
                    //            router:new draw2d.layout.connection.ManhattanConnectionRouter()
                    router: new draw2d.layout.connection.SplineConnectionRouter()
                });
                return connection;
            }
        }));

        /*
        var figure = new CollapsibleShape([{
            x: 50,
            y: 25
        }, {
            'title': 'Second node',
            'body': [{
                'side': 'output',
                'text': 'GPIO',
                'type': 'GPIO'
            }]
        }]);
        supThis.draw2DCanvas.add(figure);
        */
    }

    clear() {
        var supThis = this;

        if (supThis.selectedNode != null) {
            // save state
            var writer = new draw2d.io.json.Writer();
            writer.marshal(supThis.draw2DCanvas, function (json) {
                supThis.selectedNode.data.graph = json;
            });
        }

        supThis.ctxMenu = Menu.buildFromTemplate([{
            label: 'New Node',
            submenu: [{
                    label: 'Float',
                    click: (menuItem, browserWindow, event) => {
                        var figure = new CollapsibleShape([{
                            x: 50,
                            y: 25
                        }, {
                            'title': 'Second node',
                            'body': [{
                                'side': 'output',
                                'text': 'GPIO',
                                'type': 'GPIO'
                            }]
                        }]);
                        supThis.draw2DCanvas.add(figure);
                    }
                },
                {
                    label: 'Color',
                    click: (menuItem, browserWindow, event) => {}
                },
                {
                    label: 'Bool',
                    click: (menuItem, browserWindow, event) => {}
                }
            ]
        }, {
            type: 'separator'
        }]);

        if (supThis.draw2DCanvas != null) {
            supThis.draw2DCanvas.clear();
        }
    }

    events() {
        var supThis = this;
        $('body')
            .on('visualScripting:load', function (event, node) {
                // Empty scene
                supThis.clear();

                supThis.selectedNode = node;

                if (node != null) {
                    // Do your thing
                    if (node.data.scripts != null) {
                        for (var element in node.data.scripts) {
                            fs.readFile(element, 'utf8', function (err, data) {
                                if (err) throw err;
                                var scriptData = JSON.parse(data);
                                for (const tile of scriptData.members) {
                                    supThis.ctxMenu.append(new MenuItem({
                                        label: tile.title,
                                        click: (menuItem, browserWindow, event) => {
                                            var figure = new CollapsibleShape([{
                                                x: 50,
                                                y: 25
                                            }, tile]);
                                            supThis.draw2DCanvas.add(figure);
                                        }
                                    }));
                                }
                            });
                        }
                    }

                    if (node.data.graph == null || node.data.graph.length == 0) {
                        node.data.graph = {};
                    } else {
                        for (const tile of node.data.graph) {
                            if (tile.type == "CollapsibleShape") {
                                var figure = new CollapsibleShape([{
                                    x: tile.x,
                                    y: tile.y,
                                    id: tile.id
                                }, tile.userData]);
                                supThis.draw2DCanvas.add(figure);
                            } else {
                                var reader = new draw2d.io.json.Reader();
                                reader.unmarshal(supThis.draw2DCanvas, [tile]);
                            }
                        }
                    }
                }
            })
    }
}