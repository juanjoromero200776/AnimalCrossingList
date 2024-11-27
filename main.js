const { app, BrowserWindow, screen } = require('electron');
const path = require('path');

function createWindow() {
  // Obtener el tamaño de la pantalla principal
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  // Crear la ventana principal con el tamaño de la pantalla
  const win = new BrowserWindow({
    width: Math.floor(width),
    height: Math.floor(height),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Maximizar la ventana al abrirla
  win.maximize();

  // Cargar el archivo HTML principal
  win.loadFile('index.html');
}

// Inicia la aplicación
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
