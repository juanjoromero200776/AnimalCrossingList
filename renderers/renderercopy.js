const fs = require('fs');
const path = require('path');
let selectedGame = '';
let selectedCategory = '';


// Función para desplazarse al inicio de la página
function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
  
  // Mostrar/Ocultar el botón según el desplazamiento
  window.addEventListener('scroll', () => {
    const backToTopButton = document.getElementById('back-to-top');
    if (window.scrollY > 200) {
      backToTopButton.style.display = 'block';
    } else {
      backToTopButton.style.display = 'none';
    }
  }); 
  

// Función para mostrar el menú principal
function showMainMenu() {
  const checklist = document.getElementById('checklist');
  checklist.innerHTML = `<h2>Selecciona un juego para continuar.</h2>`;
  selectedGame = null;

  const categoryLinks = document.querySelectorAll('.category-link');
  categoryLinks.forEach(link => link.style.display = 'none');
}

// Función para seleccionar un juego
function selectGame(game) {
  selectedGame = game;
  document.querySelectorAll('.category-link').forEach(link => link.style.display = 'inline'); // Mostrar categorías
  const categoryLinks = document.querySelectorAll('.category-link');
  categoryLinks.forEach(link => link.style.display = 'inline-block');
  const checklist = document.getElementById('checklist');
  checklist.innerHTML = `<h2>Juego seleccionado: ${capitalizeGameName(game)}</h2><p>Seleccione una categoría para ver los ítems.</p>`;
}

// Función para capitalizar nombres
function capitalizeGameName(game) {
  return game.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}


function loadCategoryData(fileName) {
  const filePath = path.join(__dirname, fileName);

  try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const checklist = document.getElementById('checklist');
      renderSeriesList(data, checklist); // Llama a la función de renderizado con los datos
  } catch (error) {
      const checklist = document.getElementById('checklist');
      checklist.innerHTML = `<p>No se pudo cargar la categoría: ${error.message}</p>`;
      console.error("Error al cargar el archivo:", error);
  }
}



// Función para mostrar una categoría específica
function showCategory(category) {
  if (!selectedGame) {
    alert('Por favor, seleccione un juego primero.');
    return;
  }

  selectedCategory = category;

  const fileName = `${selectedCategory}_${selectedGame}.json`;
  const checklist = document.getElementById('checklist');
  const filePath = path.join(__dirname, `${category}_${selectedGame}.json`);

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    loadCategoryData(fileName);
    checklist.innerHTML = `<h2>${capitalizeGameName(selectedGame)} - ${capitalizeCategory(category)}</h2>`;
    renderSeriesList(data.Furniture, checklist);
    renderAllFurnitureItems(data.Furniture, checklist);
    
  } catch (error) {
    checklist.innerHTML = `<p>No se pudo cargar la categoría: ${error.message}</p>`;
  }
}

// Función para capitalizar categorías
function capitalizeCategory(category) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

// Función para calcular el color en función del porcentaje completado
function getCompletionColor(percentage) {
    if (percentage === 100) {
        return '#3498db'; // Color azul para el 100% completado
    }
    const baseHue = 35; // Tono inicial (marrón claro similar a #8b5a2b)
    const greenHue = 120; // Tono final (verde)
    const hue = baseHue + ((greenHue - baseHue) * (percentage / 100));
    return `hsl(${hue}, 70%, 50%)`;
}

// Función para actualizar el texto y color del porcentaje de completitud en tiempo real
function updateCompletionTextAndColor(seriesName, seriesLink, checkedCount, totalItems) {
    const percentage = Math.floor((checkedCount / totalItems) * 100);
    seriesLink.style.backgroundColor = getCompletionColor(percentage);
    seriesLink.title = `${percentage}% completado`;
    seriesLink.style.color = percentage === 100 ? 'white' : '#8b5a2b'; // Cambiar a texto blanco en 100%
}


// Función para reiniciar todo el progreso
function resetAllProgress() {
  localStorage.removeItem('progress');
  alert('Se ha reiniciado el progreso de todo el programa.');
  location.reload();
}

// Renderizar lista de series con enlaces y colores
function renderSeriesList(furnitureData, checklist) {
  const seriesListContainer = document.createElement('div');
  seriesListContainer.classList.add('series-list');

  furnitureData.forEach(series => {
    const seriesLink = document.createElement('a');
    seriesLink.classList.add('series-link');
    seriesLink.textContent = series.series;
    seriesLink.href = `#${series.series.replace(/\s+/g, '-')}`;

    const totalItems = series.items.length;
    const completedItems = series.items.filter(item => loadSavedProgress(series.series, item.name)).length;
    const completionPercentage = Math.floor((completedItems / totalItems) * 100);

    seriesLink.style.backgroundColor = getCompletionColor(completionPercentage);
    seriesLink.style.color = completionPercentage > 50 ? 'white' : '#8b5a2b';
    seriesLink.title = `${completionPercentage}% completado`;

    seriesLink.dataset.series = series.series;
    seriesListContainer.appendChild(seriesLink);
  });

  checklist.appendChild(seriesListContainer);

  const resetAllButton = document.createElement('button');
  resetAllButton.textContent = 'Reiniciar todo el progreso';
  resetAllButton.classList.add('reset-button');
  resetAllButton.onclick = resetAllProgress;
  checklist.appendChild(resetAllButton);
}

function renderAllFurnitureItems(furnitureData, checklist) {
    furnitureData.forEach(series => {
        const seriesContainer = document.createElement('div');
        seriesContainer.classList.add('series-container');
        seriesContainer.id = series.series.replace(/\s+/g, '-');

        // Título de la serie y porcentaje completado
        const seriesHeader = document.createElement('div');
        seriesHeader.classList.add('series-header');
        const seriesTitle = document.createElement('h3');
        seriesTitle.textContent = `${series.series}`;

        const completionText = document.createElement('span');
        completionText.classList.add('completion-text');
        
        // Reiniciar el contador de elementos marcados
        let checkedCount = 0;
        const totalItems = series.items.length;
        
        // Cargar el progreso y calcular el porcentaje actual
        series.items.forEach(item => {
            if (loadSavedProgress(series.series, item.name)) {
                checkedCount++;
            }
        });
        
        // Mostrar el porcentaje inicial
        completionText.textContent = `${Math.floor((checkedCount / totalItems) * 100)}%`;
        
        seriesHeader.appendChild(seriesTitle);
        seriesHeader.appendChild(completionText);
        seriesContainer.appendChild(seriesHeader);

        // Crear tabla para los ítems de esta serie
        const table = document.createElement('table');
        table.classList.add('item-table');

        // Encabezado de la tabla
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `
            <th>✔️</th>
            <th>Item</th>
            <th>Price (Bells)</th>
            <th>Source</th>
        `;
        table.appendChild(headerRow);

        series.items.forEach(item => {
            const row = document.createElement('tr');
            row.classList.add('item');

            const checkboxCell = document.createElement('td');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = loadSavedProgress(series.series, item.name);

            // Evento para actualizar el progreso y guardar el estado al marcar/desmarcar
            checkbox.addEventListener('change', () => {
                saveProgress(series.series, item.name, checkbox.checked);
                checkbox.checked ? checkedCount++ : checkedCount--; // Incrementa o decrementa según estado
                completionText.textContent = `${Math.floor((checkedCount / totalItems) * 100)}%`;
                const seriesLink = document.querySelector(`[data-series="${series.series}"]`);
                updateCompletionTextAndColor(series.series, seriesLink, checkedCount, totalItems);
            });

            checkboxCell.appendChild(checkbox);

            const nameCell = document.createElement('td');
            nameCell.textContent = item.name;

            const priceCell = document.createElement('td');
            priceCell.textContent = item.bells ? `${item.bells} bells` : '-';

            const sourceCell = document.createElement('td');
            sourceCell.textContent = item.source || '-';

            row.appendChild(checkboxCell);
            row.appendChild(nameCell);
            row.appendChild(priceCell);
            row.appendChild(sourceCell);
            table.appendChild(row);
        });

        seriesContainer.appendChild(table);
        checklist.appendChild(seriesContainer);
    });
}


// Funciones de progreso para localStorage
function loadSavedProgress(seriesName, itemName) {
  const savedProgress = JSON.parse(localStorage.getItem('progress')) || {};
  return savedProgress[seriesName] && savedProgress[seriesName][itemName];
}

function saveProgress(seriesName, itemName, isChecked) {
  const savedProgress = JSON.parse(localStorage.getItem('progress')) || {};
  savedProgress[seriesName] = savedProgress[seriesName] || {};
  savedProgress[seriesName][itemName] = isChecked;
  localStorage.setItem('progress', JSON.stringify(savedProgress));
}

// Función para buscar ítems y series
document.getElementById('search-input').addEventListener('input', function () {
  const searchText = this.value.toLowerCase();
  const items = document.querySelectorAll('#checklist .item');
  const seriesContainers = document.querySelectorAll('#checklist .series-container');

  items.forEach(item => item.style.display = item.textContent.toLowerCase().includes(searchText) ? 'table-row' : 'none');
  seriesContainers.forEach(series => {
    const visibleItems = series.querySelectorAll('.item[style*="table-row"]');
    series.style.display = visibleItems.length > 0 ? 'block' : 'none';
  });
});

// Exportar e importar progreso
function exportProgress() {
  const progress = JSON.parse(localStorage.getItem('progress')) || {};
  const blob = new Blob([JSON.stringify(progress, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'progress.json';
  link.click();
  URL.revokeObjectURL(url);
}

function importProgress(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const importedProgress = JSON.parse(e.target.result);
      if (typeof importedProgress === 'object') {
        localStorage.setItem('progress', JSON.stringify(importedProgress));
        alert('Progreso importado con éxito.');
        location.reload();
      } else {
        alert('El archivo no es válido.');
      }
    } catch (error) {
      alert('Error al importar progreso.');
      console.error(error);
    }
  };
  reader.readAsText(file);
}


//new

// Función para mostrar el checklist
function showChecklist(game) {
    selectedGame = game;
    const checklist = document.getElementById('checklist');
    const dashboardContainer = document.getElementById('dashboard');
    const categoryLinks = document.querySelectorAll('.category-link');
  
    // Ocultar el dashboard y mostrar el checklist
    dashboardContainer.style.display = 'none';
    checklist.style.display = 'block';
  
    // Mostrar las categorías
    categoryLinks.forEach(link => link.style.display = 'inline-block');
  
    // Actualizar el contenido principal para mostrar el juego seleccionado
    checklist.innerHTML = `<h2>Juego seleccionado: ${capitalizeGameName(game)}</h2><p>Seleccione una categoría para ver los ítems.</p>`;
  }

  // Función para mostrar el dashboard
function showDashboard(game) {
    selectedGame = game;
    const checklist = document.getElementById('checklist');
    const dashboardContainer = document.getElementById('dashboard');
  
    // Ocultar el checklist y mostrar el dashboard
    checklist.style.display = 'none';
    dashboardContainer.style.display = 'block';
  
    // Llamar a la función que renderiza las estadísticas del dashboard
    renderDashboardStats(game);
  }