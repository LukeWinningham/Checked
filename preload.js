const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  saveCurrentList: (list) => ipcRenderer.invoke('save-current-list', list),
  getCurrentList: () => ipcRenderer.invoke('get-current-list'),
  createNewList: () => ipcRenderer.invoke('create-new-list'),
  saveLists: (lists) => ipcRenderer.invoke('save-lists', lists),
  getLists: () => ipcRenderer.invoke('get-lists'),
  saveCompletedTasks: (tasks) => ipcRenderer.invoke('save-completed', tasks),
  getCompletedTasks: () => ipcRenderer.invoke('get-completed'),
  openList: (listData) => ipcRenderer.invoke('open-list', listData),
  setSize: (width, height) => ipcRenderer.invoke('set-size', width, height) 
});
