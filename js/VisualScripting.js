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
    }

    events() {
        var supThis = this;
        $('body')
            .on('visualScripting:load', function (event, node) {
                supThis.selectedNode = node;

                // Empty scene
                supThis.clear();

                if (node != null) {
                    // Do your thing
                    if (node.data != null) {
                        for (var element in node.data) {
                            fs.readFile(element, 'utf8', function (err, data) {
                                if (err) throw err;
                                var scriptData = JSON.parse(data);
                                for (const tiles of scriptData.members) {
                                    supThis.ctxMenu.append(new MenuItem({
                                        label: tiles.title,
                                        click: (menuItem, browserWindow, event) => {
                                            var figure = new CollapsibleShape([{
                                                x: 50,
                                                y: 25
                                            }, tiles]);
                                            supThis.draw2DCanvas.add(figure);
                                        }
                                    }));
                                }
                            });
                        }
                    }

                    if (node.content == null) {
                        node.content = {};
                    } else {
                        console.log("Node content ", node.content);
                    }
                }
            })
    }
}