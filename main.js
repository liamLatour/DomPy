const {
    app,
    BrowserWindow
} = require('electron');

// using https://github.com/sindresorhus/electron-context-menu for context menus
// using https://www.npmjs.com/package/custom-electron-titlebar for custom titlebar

// colors https://www.colourlovers.com/palette/1718713/Monokai
// sahdes https://maketintsandshades.com/#272822

let win

function createWindow() {
    win = new BrowserWindow({
        frame: false,
        resizable: true,
        webPreferences: {
            nodeIntegration: true
        }
    })

    win.loadFile('index.html');
    win.maximize();

    win.webContents.openDevTools()

    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    })
}

app.on('ready', createWindow)


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
})