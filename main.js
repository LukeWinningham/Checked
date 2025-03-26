const { app, BrowserWindow, Tray, nativeImage, ipcMain, globalShortcut, Menu, screen, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const { v4: uuidv4 } = require('uuid') 

let tray = null;
let cardViewWindow = null;


function ensureUserDataDir() {
  const userDataPath = app.getPath('userData');
  if (!fsSync.existsSync(userDataPath)) {
    fsSync.mkdirSync(userDataPath, { recursive: true });
    console.log(`Created user data directory: ${userDataPath}`);
  } else {
    console.log(`User data directory exists: ${userDataPath}`);
  }
}

function ensureListsArchiveExists() {
  const userDataPath = app.getPath('userData');
  const filePath = path.join(userDataPath, 'listsArchive.json');
  if (!fsSync.existsSync(filePath)) {
    fsSync.writeFileSync(filePath, '[]');
    console.log('Created empty listsArchive.json file');
  }
}

function refreshTrayMenu() {
  console.log('Refreshing tray menu with latest lists');
  if (tray) {
    tray.setContextMenu(buildTrayMenu());
  }
}

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.whenReady().then(() => {
  globalShortcut.register('CommandOrControl+N', () => {
    if (cardViewWindow && !cardViewWindow.isDestroyed()) {
      cardViewWindow.close();
    }
    
    cardViewWindow = null;
    
    const newList = {
      id: uuidv4(),
      tasks: [],
      listName: "New List",
      updatedAt: new Date().toISOString()
    }
    
    createCardViewWindow(newList);
  });

  globalShortcut.register('CommandOrControl+X', () => {
    if (cardViewWindow && !cardViewWindow.isDestroyed()) {
      if (!cardViewWindow.isVisible()) {
        cardViewWindow.show();
      }
      cardViewWindow.setAlwaysOnTop(true);
      cardViewWindow.focus();
      setTimeout(() => {
        if (cardViewWindow && !cardViewWindow.isDestroyed()) {
          cardViewWindow.setAlwaysOnTop(false);
        }
      }, 100);
    } else {
      createCardViewWindow({});
    }
  });
});

function createCardViewWindow(listData) {

  if (process.platform === 'darwin') {
    app.dock.hide();
  }
  const cursorPoint = screen.getCursorScreenPoint();
  const currentDisplay = screen.getDisplayNearestPoint(cursorPoint);
  const { bounds } = currentDisplay;
  const windowWidth = 350;

  const xPosition = bounds.x + bounds.width - windowWidth;
  const yPosition = bounds.y;

  cardViewWindow = new BrowserWindow({
    x: xPosition,
    y: yPosition,
    minWidth: windowWidth,
    minHeight: 470,
    maxWidth: windowWidth,
    maxHeight: 470,
    transparent: true,
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    opacity: 0.93,
    show: false
  })
  cardViewWindow.once('ready-to-show', () => {
    cardViewWindow.show();
    const [currentX, currentY] = cardViewWindow.getPosition();
    if (currentX !== xPosition || currentY !== yPosition) {
      cardViewWindow.setPosition(xPosition, yPosition);
    }
  });
  cardViewWindow.loadFile(path.join(__dirname, 'dist/index.html'), {
    query: { 
      "view": "card", 
      "listData": JSON.stringify(listData || {
        id: uuidv4(),
        tasks: [],
        listName: "New List",
        updatedAt: new Date().toISOString()
      })
    }
  })

  cardViewWindow.on('close', (e) => {
    if (process.platform !== 'darwin') {
      e.preventDefault()
      cardViewWindow.hide()
    }
  })


  return cardViewWindow
}

function createTray() {
  let iconPath;
  if (app.isPackaged) {
    iconPath = path.join(process.resourcesPath, 'assets/Checked.png');
  } else {
    iconPath = path.join(__dirname, 'assets/Checked.png');
  }
  
  const trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
  tray = new Tray(trayIcon);
  tray.setToolTip('Task Lists');
  tray.setContextMenu(buildTrayMenu());

  tray.on('click', () => {
    if (process.platform !== 'darwin') {
      tray.popUpContextMenu();
    }
  });
}

function buildTrayMenu() {
  const userDataPath = app.getPath('userData');
  const filePath = path.join(userDataPath, 'listsArchive.json');
  let lists = [];

  try {
    if (fsSync.existsSync(filePath)) {
      const data = fsSync.readFileSync(filePath, 'utf8');
      if (data && data.trim() !== '') {
        lists = JSON.parse(data);
      }
    }
  } catch (err) {
    console.error('Error reading lists:', err);
  }

  const menuTemplate = [
    {
      label: 'New List',
      click: () => createCardViewWindow({})
    },
    { type: 'separator' }
  ];

  if (lists && lists.length > 0) {
    menuTemplate.push({
      label: `Your Lists (${lists.length})`,
      enabled: false
    });

    lists.forEach((list, index) => {
      const listName = list.listName || `Unnamed List ${index + 1}`;
      const listId = list.id;

      menuTemplate.push({
        label: listName,
        submenu: [
          {
            label: 'Open List',
            click: () => createCardViewWindow(list)
          },
          {
            label: 'Delete List',
            click: () => {
              const updatedLists = lists.filter(l => l.id !== listId);
              fs.writeFile(filePath, JSON.stringify(updatedLists, null, 2))
                .then(() => {
                  console.log(`List "${listName}" deleted.`);
                  refreshTrayMenu();
                })
                .catch(err => console.error('Error deleting list:', err));
            }
          }
        ]
      });
    });

    menuTemplate.push(
      { type: 'separator' },
      {
        label: 'Delete All Lists',
        click: () => {
          dialog.showMessageBox({
            type: 'warning',
            title: 'Delete All Lists',
            message: 'Are you sure you want to delete all lists?',
            detail: 'This action cannot be undone.',
            buttons: ['Cancel', 'Delete All'],
            defaultId: 0,
            cancelId: 0
          }).then(({ response }) => {
            if (response === 1) {
              fs.writeFile(filePath, '[]')
                .then(() => {
                  console.log('All lists deleted.');
                  refreshTrayMenu();
                })
                .catch(err => console.error('Error deleting all lists:', err));
            }
          });
        }
      }
    );
  } else {
    menuTemplate.push({
      label: 'No saved lists',
      enabled: false
    });
  }

  menuTemplate.push(
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => app.quit()
    }
  );

  return Menu.buildFromTemplate(menuTemplate);
}


ipcMain.handle('set-size', (event, width, height) => {
  if (cardViewWindow && !cardViewWindow.isDestroyed()) {
    cardViewWindow.setSize(width, height);
  }
});

ipcMain.on('sync-local-storage', (event) => {
  try {
    const filePath = path.join(app.getPath('userData'), 'listsArchive.json');
    const data = fsSync.existsSync(filePath) ? fsSync.readFileSync(filePath, 'utf8') : '[]';
    event.reply('sync-local-storage-reply', data);
  } catch (err) {
    console.error('Error syncing localStorage:', err);
    event.reply('sync-local-storage-reply', '[]');
  }
});

ipcMain.handle('save-lists', async (event, lists) => {
  try {
    const userDataPath = app.getPath('userData');
    const filePath = path.join(userDataPath, 'listsArchive.json');

    const listsToSave = typeof lists === 'string' ? JSON.parse(lists) : lists;
    
    await fs.writeFile(filePath, JSON.stringify(listsToSave, null, 2));
    refreshTrayMenu();
    return { status: 'success' };
  } catch (err) {
    console.error('Error saving lists:', err);
    return { status: 'error', error: err.message };
  }
});

ipcMain.handle('open-list', async (event, listData) => {
  createCardViewWindow(listData);
  return { status: 'success' };
});

ipcMain.handle('get-lists', async () => {
  try {
    const userDataPath = app.getPath('userData');
    const filePath = path.join(userDataPath, 'listsArchive.json');
    if (fsSync.existsSync(filePath)) {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (err) {
    console.error('Error reading lists:', err);
    return [];
  }
});

ipcMain.handle('save-current-list', async (event, listData) => {
  try {
    const lists = await ipcMain.handle('get-lists');
    const updatedLists = lists.map(list => ({ ...list, isCurrent: false }));
    updatedLists.push({
      ...listData,
      isCurrent: true,
      updatedAt: new Date().toISOString()
    });

    const userDataPath = app.getPath('userData');
    const filePath = path.join(userDataPath, 'listsArchive.json');
    await fs.writeFile(filePath, JSON.stringify(updatedLists, null, 2));
    refreshTrayMenu();
    return { status: 'success' };
  } catch (err) {
    console.error('Error saving current list:', err);
    return { status: 'error', error: err.message };
  }
});

ipcMain.handle('migrate-from-localStorage', (event, data) => {
  try {
    const userDataPath = app.getPath('userData');
    const filePath = path.join(userDataPath, 'listsArchive.json');
    if (!fsSync.existsSync(filePath) && data) {
      fsSync.writeFileSync(filePath, data);
      console.log('Successfully migrated data from localStorage');
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error migrating data:', err);
    return false;
  }
});

ipcMain.on('quit', () => {
  app.quit();
});


app.whenReady().then(() => {
  ensureUserDataDir();
  ensureListsArchiveExists();
  createTray();
  createCardViewWindow({});
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

