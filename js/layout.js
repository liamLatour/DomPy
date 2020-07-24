const customTitlebar = require('custom-electron-titlebar');

$("body").css('background-color', colors.mainColor.normal);
$("body").css('color', colors.textColor.normal);

var config = {
    settings: {
        hasHeaders: true,
        constrainDragToContainer: true,
        reorderEnabled: true,
        selectionEnabled: false,
        popoutWholeStack: false,
        blockedPopoutsThrowError: true,
        closePopoutsOnUnload: true,
        showPopoutIcon: false,
        showMaximiseIcon: true,
        showCloseIcon: true
    },
    dimensions: {
        borderWidth: 5,
        minItemHeight: 100,
        minItemWidth: 150,
        headerHeight: 20,
        dragProxyWidth: 300,
        dragProxyHeight: 200
    },
    content: [{
        type: 'column',
        content: [{
            type: 'row',
            content: [{
                type: 'component',
                id: 'visualScripting',
                componentName: 'VisualScripting',
                componentState: {
                    label: 'B'
                }
            }, {
                type: 'component',
                id: 'hierarchy',
                componentName: 'Hierarchy',
                componentState: {}
            }, {
                type: 'component',
                id: 'componentView',
                componentName: 'ComponentView',
                componentState: {}
            }]
        }, {
            type: 'component',
            id: 'assets',
            componentName: 'Assets',
            componentState: {
                selectedFolder: path.resolve(".\\Assets\\")
            }
        }]
    }]
};

var savedState = store.get('layoutState');

if (savedState !== null) {
    myLayout = new GoldenLayout(JSON.parse(savedState), '.container-after-titlebar');
} else {
    myLayout = new GoldenLayout(config, '.container-after-titlebar');
}

let titleBar = new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex(colors.mainColor.dark),
    shadow: false,
    icon: './icons/icon.svg'
});

const menu = new Menu();

menu.append(new MenuItem({
    label: 'Window',
    submenu: [{
        label: 'Assets',
        id: 'winAssets',
        click: () => {
            var newItemConfig = {
                type: 'component',
                id: 'assets',
                componentName: 'Assets',
                componentState: {
                    selectedFolder: path.resolve(".\\Assets\\")
                }
            };
            myLayout.root.contentItems[0].addChild(newItemConfig);
        }
    }, {
        label: 'Hierarchy',
        id: 'winHierarchy',
        click: () => {
            var newItemConfig = {
                type: 'component',
                id: 'hierarchy',
                componentName: 'Hierarchy',
                componentState: {}
            };
            myLayout.root.contentItems[0].addChild(newItemConfig);
        }
    }, {
        label: 'ComponentView',
        id: 'winComponentView',
        click: () => {
            var newItemConfig = {
                type: 'component',
                id: 'componentView',
                componentName: 'ComponentView',
                componentState: {}
            };
            myLayout.root.contentItems[0].addChild(newItemConfig);
        }
    }, {
        label: 'VisualScripting',
        id: 'winVisualScripting',
        click: () => {
            var newItemConfig = {
                type: 'component',
                id: 'visualScripting',
                componentName: 'VisualScripting',
                componentState: {}
            };
            myLayout.root.contentItems[0].addChild(newItemConfig);
        }
    }]
}));

titleBar.updateMenu(menu);
titleBar.updateTitle('Welcome to DomPy !');


myLayout._isFullPage = true;

myLayout.registerComponent('testComponent', function (container, componentState) {
    container.getElement().html('');
});


myLayout.registerComponent('Assets', Assets);
myLayout.registerComponent('Hierarchy', Hierarchy);
myLayout.registerComponent('ComponentView', ComponentView);
myLayout.registerComponent('VisualScripting', VisualScripting);


myLayout.on('stateChanged', function () {
    var assets = menu.getMenuItemById('winAssets');
    var hierarchy = menu.getMenuItemById('winHierarchy');
    var componentView = menu.getMenuItemById('winComponentView');
    var visualScripting = menu.getMenuItemById('winVisualScripting');
    if (myLayout.root.getItemsById('assets').length == 0) {
        assets.enabled = true;
    } else {
        assets.enabled = false;
    }

    if (myLayout.root.getItemsById('hierarchy').length == 0) {
        hierarchy.enabled = true;
    } else {
        hierarchy.enabled = false;
    }

    if (myLayout.root.getItemsById('componentView').length == 0) {
        componentView.enabled = true;
    } else {
        componentView.enabled = false;
    }

    if (myLayout.root.getItemsById('visualScripting').length == 0) {
        visualScripting.enabled = true;
    } else {
        visualScripting.enabled = false;
    }

    var state = JSON.stringify(myLayout.toConfig());
    store.set('layoutState', state);
});

myLayout.init();