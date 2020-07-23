class ComponentView {
    constructor(container, componentState) {
        this.container = container;
        this.componentState = componentState;
        this.selectedNode = null;

        this.instantiateLayout();
        this.events();
    }

    addScript(script, newScript = true, opened = true, enabled = true) {
        var supThis = this;

        if (newScript && script in supThis.selectedNode.data) return;

        var checked = (enabled ? 'checked' : '');
        var shown = (opened ? 'show' : '');
        var icon = (opened ? '' : 'collapsed');
        var id = path.basename(script, path.extname(script));

        fs.readFile(script, 'utf8', function (err, data) {
            if (err) throw err;
            var scriptData = JSON.parse(data);

            var inputs = "";

            for (i in scriptData.config) {
                inputs += '<tr>\
                                <td>'+scriptData.config[i].name+'</td>\
                                <td><input type="text" class="configInput" id="name" name="name" size="10"></td>\
                            </tr>';
            }

            var scriptLayout = $('<div class="card">\
                                <div class="card-header" id="heading' + id + '" style="display: flex;align-items: center;">\
                                    <button class="btn smoothTransition ' + icon + '" style="padding: 0;border: 0;outline: none;box-shadow: none;" type="button" data-toggle="collapse" data-target="#collapse' + id + '" aria-expanded="false" aria-controls="collapseTwo">\
                                        <img src="./icons/opened.svg" class="icons" alt=">" style="height: 15px;width: 15px;cursor: pointer;">\
                                    </button><img src="./icons/rpi.svg" alt="R" style="height: 15px;width: 15px;margin-right: 5px;">\
                                    <input id="enabling' + id + '" type="checkbox" ' + checked + ' style="margin: 0;margin-right: 5px;">' + scriptData.title + '\
                                </div>\
                                <div id="collapse' + id + '" class="collapse ' + shown + '" aria-labelledby="heading' + id + '">\
                                    <div class="card-body">\
                                        <table style="width: 100%;">\
                                            <tbody>'+inputs+'</tbody>\
                                        </table>\
                                    </div>\
                                </div>\
                            </div>')
                .on('change', '#enabling' + id, function () {
                    supThis.selectedNode.data[script].enabled = $('#enabling' + id).is(":checked");
                }).on('hide.bs.collapse', function () {
                    supThis.selectedNode.data[script].opened = false;
                }).on('show.bs.collapse', function () {
                    supThis.selectedNode.data[script].opened = true;
                });
            $('#scriptAccordion').append(scriptLayout).find('.icons').colorSVG(colors.textColor.normal);
            if (newScript) {
                supThis.selectedNode.data[script] = {
                    'opened': true,
                    'enabled': true
                };
                $('body').trigger("visualScripting:load", [supThis.selectedNode]);
            }
        });
    }

    instantiateLayout() {
        var supThis = this;
        supThis.container.getElement()
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
                            <div id="scriptContainer" style="text-align: left;">\
                                <div class="chooseScript" data-script="1"><img src="./icons/rpi.svg" alt="R" class="imgScript">Raspberry Pi 3</div>\
                                <div class="chooseScript" data-script="2"><img src="./icons/rpi.svg" alt="R" class="imgScript">Raspberry Pi B+</div>\
                            </div>\
                        </div></div>\
                </div></div>')
            .droppable({
                accept: ".scriptFromAssets",
                drop: function (event, ui) {
                    if ($('#componentView').is(":visible")) {
                        var scriptPath = $(ui.draggable).find('img').data('path');
                        supThis.addScript(scriptPath);
                    }
                }
            })
            .find('#componentView')
            .hide()
            .find('#chooseScript')
            .hide()
            .parent().parent()
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
    }

    events() {
        var supThis = this;
        $('body')
            .on('componentView:load', function (event, node) {
                supThis.selectedNode = node;
                $('#scriptAccordion').empty();

                if (node == null) {
                    $('#componentView').hide();
                } else {
                    $('#componentView').show();
                    $('#componentName').val(node.text);

                    if (node.data == null) {
                        node.data = {};
                    } else {
                        console.log("Node data ", node);
                        for (var element in node.data) {
                            supThis.addScript(element, false, node.data[element].opened, node.data[element].enabled);
                        }
                    }
                }
            })
            .on('click', '#addScriptButton', function () {
                $('#chooseScript').toggle();
            })
            .on('click', '.chooseScript', function () {
                if (!($(this).data('script') in supThis.selectedNode.data)) {
                    supThis.addScript($(this).data('script'));
                }
            })
            .on('blur keyup', '#componentName', function (event) {
                if (event.type == "keyup" && event.keyCode != 13) return;
                var val = $('#componentName').val();
                $('body').trigger("hierarchy:rename", [supThis.selectedNode, val]);
            });

        $(document).click(function (event) {
            if (!$(event.target).closest('#addScriptButton').length &&
                !$(event.target).closest('#chooseScript').length &&
                $('#chooseScript').is(":visible")) {
                $('#chooseScript').hide();
            }
        });
    }
}