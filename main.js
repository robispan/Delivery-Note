'use strict';
require('electron-reload')(__dirname);
const { app, BrowserWindow } = require('electron');
const electron = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const os = require('os');
const ipc = electron.ipcMain;
const shell = electron.shell;

// SET ENV
process.env.NODE_ENV = 'production';

// init win
let win;

// Run create window function
app.on('ready', createWindow);

function createWindow() {

    // Create browser window
    win = new BrowserWindow({
        width: 950,
        height: 850,
        icon: __dirname + '/assets/png/icon.png'
    });

    // Load index.html
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    //Open dev tools
    win.webContents.openDevTools();

    win.on('closed', () => {
        win = null;
    });
}

// Quit when all windows are closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Save content from window renderer to pdf
ipc.on('print-to-pdf', function (event) {
    const date = new Date();
    const time = `${date.getHours()}.${date.getMinutes()}.${date.getSeconds()}`;
    const pdfPath = path.join(os.homedir(), `Desktop/dobavnica${time}.pdf`);
    const win = BrowserWindow.fromWebContents(event.sender);

    // PRint options 
    const options = {printBackground: true};

    // Use default printing options
    win.webContents.printToPDF(options, function (error, data) {
        if (error) throw error;
        fs.writeFile(pdfPath, data, function (error) {
            if (error) {
                throw error;
            }
            shell.openExternal('file://' + pdfPath);
            event.sender.send('wrote-pdf', pdfPath);
        });
    });
});
