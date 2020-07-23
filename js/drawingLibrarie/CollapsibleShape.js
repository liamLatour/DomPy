var CollapsibleShape = draw2d.shape.layout.VerticalLayout.extend({

    NAME: "CollapsibleShape",

    init: function (attr) {
        this.inputLocator = new CollapsibleInputLocator();
        this.outputLocator = new CollapsibleOutputLocator();
        this.rows = [];

        this._super($.extend({
            bgColor: "#424242",
            color: "#E7E7E7",
            stroke: 2,
            radius: 5,
            gap: 5
        }, attr[0]));

        this.header = new draw2d.shape.layout.HorizontalLayout({
            stroke: 0,
            radius: 5,
            bgColor: "#2C8A5D"
        });

        var label = null;
        this.header.add(label = new draw2d.shape.basic.Label({
            text: attr[1].title,
            fontColor: "#ffffff",
            stroke: 0,
            fontSize: 16,
            fontFamily: "Verdana",
            padding: {
                left: 20,
                right: 20
            }
        }));

        var img1 = new draw2d.shape.icon.ArrowDown({
            minWidth: 15,
            minHeight: 15,
            width: 15,
            height: 15,
        });
        var img2 = new draw2d.shape.icon.ArrowUp({
            minWidth: 15,
            minHeight: 15,
            width: 15,
            height: 15,
            visible: false
        });

        var toggle = function () {
            for(i in this.rows){
                var row = this.rows[i];

                row.portRelayoutRequired = true;
                row.setVisible(!row.isVisible());

                row.portRelayoutRequired = true;
                row.layoutPorts();
            }
            img1.setVisible(!img1.isVisible());
            img2.setVisible(!img2.isVisible());
        }.bind(this);

        img1.on("click", toggle);
        img2.on("click", toggle);
        label.on("click", toggle);
        img1.addCssClass("pointer");
        img2.addCssClass("pointer");
        this.header.add(img1);
        this.header.add(img2);

        // finally compose the shape with top/middle/bottom in VerticalLayout
        //
        this.add(this.header);

        for (row in attr[1].body) {
            attributes = attr[1].body[row]

            var ligne = new draw2d.shape.basic.Label({
                text: attributes.text,
                fontColor: "#ffffff",
                resizeable: true,
                stroke: 0,
                padding: {
                    left: 20
                }
            });

            if (attributes.side == 'input' || attributes.side == 'both') {
                ligne.createPort("input", this.inputLocator);
            } else if (attributes.side == 'output' || attributes.side == 'both') {
                ligne.createPort("output", this.outputLocator);
            }
            this.rows.push(ligne);
            this.add(ligne);
        }
    }
});