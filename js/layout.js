const customTitlebar = require('custom-electron-titlebar');
const {
    remote
} = require('electron');
const {
    Menu,
    MenuItem
} = remote;

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
                componentName: 'testComponent',
                componentState: {
                    label: 'B'
                }
            }, {
                type: 'component',
                id: 'hierarchie',
                componentName: 'Hierarchie',
                componentState: {}
            }, {
                type: 'component',
                componentName: 'testComponent',
                componentState: {
                    label: 'B'
                }
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

if (savedState !== null && false) {
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
        label: 'Hierarchie',
        id: 'winHierarchie',
        click: () => {
            var newItemConfig = {
                type: 'component',
                id: 'hierarchie',
                componentName: 'Hierarchie',
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
myLayout.registerComponent('Hierarchie', Hierarchie);


myLayout.on('stateChanged', function () {
    var assets = menu.getMenuItemById('winAssets');
    var hierarchie = menu.getMenuItemById('winHierarchie');
    if (myLayout.root.getItemsById('assets').length == 0) {
        assets.enabled = true;
    } else {
        assets.enabled = false;
    }

    if (myLayout.root.getItemsById('hierarchie').length == 0) {
        hierarchie.enabled = true;
    } else {
        hierarchie.enabled = false;
    }

    var state = JSON.stringify(myLayout.toConfig());
    store.set('layoutState', state);
});

myLayout.init();