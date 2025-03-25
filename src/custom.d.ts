interface ElectronAPI {
  saveLists: (lists: any[]) => Promise<any>;
  getLists: () => Promise<any>;
  openList: (data: any) => Promise<any>;
  migrateFromLocalStorage: (data: any) => Promise<any>;
  setSize: (width: number, height: number) => void;
}

interface Window {
  electron: ElectronAPI;
}