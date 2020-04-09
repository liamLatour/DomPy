function ComponentView(container, componentState) {

    var selectedNode = {
        dataInternal: null,
        dataListener: function (val) { },
        set data(val) {
            this.dataInternal = val;
            this.dataListener(val);
        },
        get data() {
            return this.dataInternal;
        },
        onChange: function (listener) {
            this.dataListener = listener;
        }
    };

    selectedNode.onChange(function (val) {
        if (val == null) {
            $('#componentView').hide();
        } else {
            $('#componentView').show();
        }
    });

    $('body').on('componentView:load', function (event, node) {
        selectedNode.data = node;
        $('#scriptAccordion').empty();
        $('#componentName').val(node.text);

        if (selectedNode.data.data == null) {
            selectedNode.data.data = {};
        } else {
            for (var element in selectedNode.data.data) {
                addScript(element, false, selectedNode.data.data[element].opened, selectedNode.data.data[element].enabled);
            }
        }
    });

    function addScript(script, newScript = true, opened = true, enabled = true) {
        var checked = (enabled ? 'checked' : '');
        var shown = (opened ? 'show' : '');
        var icon = (opened ? '' : 'collapsed');
        var scriptLayout = $('<div class="card">\
                                <div class="card-header" id="heading' + script + '" style="display: flex;align-items: center;">\
                                    <button class="btn smoothTransition' + icon + '" style="padding: 0;border: 0;outline: none;box-shadow: none;" type="button" data-toggle="collapse" data-target="#collapse' + script + '" aria-expanded="false" aria-controls="collapseTwo">\
                                        <img src="./icons/opened.svg" class="icons" alt=">" style="height: 15px;width: 15px;cursor: pointer;">\
                                    </button><img src="./icons/rpi.svg" alt="R" style="height: 15px;width: 15px;margin-right: 5px;">\
                                    <input id="enabling' + script + '" type="checkbox" ' + checked + ' style="margin: 0;margin-right: 5px;">This is a script\
                                </div>\
                                <div id="collapse' + script + '" class="collapse ' + shown + '" aria-labelledby="heading' + script + '">\
                                    <div class="card-body">\
                                        hey do\
                                    </div>\
                                </div>\
                            </div>')
            .on('change', '#enabling' + script, function () {
                selectedNode.data.data[script].enabled = $('#enabling' + script).is(":checked");
            }).on('hide.bs.collapse', function () {
                selectedNode.data.data[script].opened = false;
            }).on('show.bs.collapse', function () {
                selectedNode.data.data[script].opened = true;
            });
        $('#scriptAccordion').append(scriptLayout).find('.icons').colorSVG(colors.textColor.normal);
        if (newScript) {
            selectedNode.data.data[script] = {
                'opened': true,
                'enabled': true
            };
        }
    }

    container.getElement()
        .html('<div id="componentView"><input id="componentName" type="text" value="New Component" style="margin-bottom:10px;border: none;background-color: #3E3D32;color: white;width: 100%;height: 2em;padding: 10px;">\
                    <div id="scriptAccordion"></div>\
                    <div style="text-align: center;padding: 10px;"><div style="margin:auto; width:6cm">\
                        <button type="button" class="btn btn-dark" style="width: 100%;" id="addScriptButton">Add Script</button>\
                        <div id="chooseScript" style="height: 9cm;width:6cm; background-color:var(--secondary);z-index:1;position:fixed;">\
                            <div class="input-group mb-3">\
                                <div class="input-group-prepend">\
                                    <img src="./icons/magnifyingGlass.svg" class="icons" alt="🔍" style="height: 23.5px;width: 15px;">\
                                </div>\
                                <input type="text" id="search" class="form-control" placeholder="Ex: rpi" aria-describedby="basic-addon1">\
                            </div>\
                            <div id="scriptContainer">\
                                <div id="script1"><img src="./icons/rpi.svg" alt="" style="height: 15px;width: 15px;">Raspberry Pi 3</div>\
                            </div>\
                        </div></div>\
                </div></div>')
        .find('#componentView')
        .hide()
        .find('#scriptAccordion')
        .sortable()
        .on("show.bs.collapse", function () {
            $('#scriptAccordion').sortable('disable');
        })
        .on("hide.bs.collapse", function () {
            $('#scriptAccordion').sortable('enable');
        })
        .accordion({
            collapsible: true,
            active: true,
            heightStyle: 'fill',
            header: 'card'
        })
        .sortable({
            change: function (event, ui) {
                ui.placeholder.css({
                    visibility: 'visible',
                    border: '2px solid ' + colors.textColor.tertiary
                });
            },
            items: '.card'
        });

    var i = 0;
    $('body')
        .on('click', '#addScriptButton', function () {
            addScript(i++);
        })
        .on('blur keyup', '#componentName', function (event) {
            if (event.type == "keyup" && event.keyCode != 13) return;
            var val = $('#componentName').val();
            $('body').trigger("hierarchy:rename", [selectedNode.data, val]);
        });
}