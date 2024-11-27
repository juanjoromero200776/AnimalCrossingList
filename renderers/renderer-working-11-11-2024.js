let selectedGame = null;
const fs = require('fs');
const path = require('path');

// Función para mostrar el checklist y ocultar el dashboard
function selectGame(game) {
	selectedGame = game;
	document.getElementById('checklist').style.display = 'block';
	document.getElementById('dashboard').style.display = 'none';

	// Mostrar categorías y actualizar el contenido principal
	const categoryLinks = document.querySelectorAll('.category-link');
	categoryLinks.forEach(link => link.style.display = 'inline-block');
	document.getElementById('checklist').innerHTML = `<h2>Juego seleccionado: ${capitalizeGameName(game)}</h2><p>Seleccione una categoría para ver los ítems.</p>`;
}
// OLD VERSION // Main menu function to reset the dashboard state
//function showMainMenu() {
//	document.getElementById("dashboard").style.display = "none";
//	document.getElementById("checklist").style.display = "block";
//	isDashboardLoaded = false; // Reset flag
//  }

// Función para volver al menú principal
function showMainMenu() {
	document.getElementById('dashboard').style.display = 'none'; // Ocultar el dashboard
	document.getElementById('checklist').style.display = 'block'; // Mostrar el checklist
	selectedGame = null; // Reiniciar el juego seleccionado

	// Actualizar el contenido principal para mostrar el mensaje inicial
	const checklist = document.getElementById('checklist');
	checklist.innerHTML = `<h2>Selecciona un juego para continuar.</h2>`;

	// Ocultar las categorías hasta que se seleccione un juego
	const categoryLinks = document.querySelectorAll('.category-link');
	categoryLinks.forEach(link => {
		link.style.display = 'none';
	});
}



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



// Only one definition for capitalizeGameName function
function capitalizeGameName(game) {
	return game
	  .split("_")
	  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
	  .join(" ");
  }



// Función para capitalizar categorías
function capitalizeCategory(category) {
	return category.charAt(0).toUpperCase() + category.slice(1);
}
// Show a specific category and get the index for progress key (save file of progress)
function showCategory(category) {
    if (!selectedGame) {
        alert('Por favor, seleccione un juego primero.');
        return;
    }

    // Define el nombre del archivo basado en el juego y la categoría
    fileName = `${category}_${selectedGame}.json`;

    const checklist = document.getElementById('checklist');
    const filePath = path.join(__dirname, fileName);

    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        checklist.innerHTML = `<h2>${capitalizeGameName(selectedGame)} - ${capitalizeCategory(category)}</h2>`;
        renderSeriesList(data.Furniture, checklist);
        renderAllFurnitureItems(data.Furniture, checklist);
    } catch (error) {
        checklist.innerHTML = `<p>No se pudo cargar la categoría: ${error.message}</p>`;
    }
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

//RENDER SERIES LIST AND THEN FURNITURE


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


//SEARCH IN ITEMS AND SERIES
// Función para buscar ítems y series
document.getElementById('search-input').addEventListener('input', function() {
	const searchText = this.value.toLowerCase();
	const items = document.querySelectorAll('#checklist .item');
	const seriesContainers = document.querySelectorAll('#checklist .series-container');

	items.forEach(item => item.style.display = item.textContent.toLowerCase().includes(searchText) ? 'table-row' : 'none');
	seriesContainers.forEach(series => {
		const visibleItems = series.querySelectorAll('.item[style*="table-row"]');
		series.style.display = visibleItems.length > 0 ? 'block' : 'none';
	});
});

// FILENAME FOR INDEX



// SAVE AND LOAD PROGRESS
function loadSavedProgress(seriesName, itemName) {
	const savedProgress = JSON.parse(localStorage.getItem('progress')) || {};
	return (
	  savedProgress.root &&
	  savedProgress.root[selectedGame] &&
	  savedProgress.root[selectedGame][fileName] &&
	  savedProgress.root[selectedGame][fileName][seriesName] &&
	  savedProgress.root[selectedGame][fileName][seriesName][itemName]
	);
}

function saveProgress(seriesName, itemName, isChecked) {
    console.log("Saving progress for fileName:", fileName); // Verificar que fileName no esté vacío

    const savedProgress = JSON.parse(localStorage.getItem('progress')) || { root: {} };

    if (!savedProgress.root[selectedGame]) {
        savedProgress.root[selectedGame] = {};
    }
    if (!savedProgress.root[selectedGame][fileName]) {
        savedProgress.root[selectedGame][fileName] = {};
    }
    if (!savedProgress.root[selectedGame][fileName][seriesName]) {
        savedProgress.root[selectedGame][fileName][seriesName] = {};
    }

    savedProgress.root[selectedGame][fileName][seriesName][itemName] = isChecked;
    localStorage.setItem('progress', JSON.stringify(savedProgress));
}


// EXPORT AND IMPORT PROGRESS
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

// Función para cargar el checklist de un juego seleccionado
function loadChecklist(game) {
	selectedGame = game;
	const checklist = document.getElementById('checklist');
	const dashboard = document.getElementById('dashboard');
	const categoryLinks = document.querySelectorAll('.category-link');

	// Mostrar el checklist y ocultar el dashboard
	checklist.style.display = 'block';
	dashboard.style.display = 'none';

	// Mostrar las categorías
	categoryLinks.forEach(link => link.style.display = 'inline-block');

	// Actualizar el contenido principal para mostrar el juego seleccionado
	checklist.innerHTML = `<h2>Juego seleccionado: ${capitalizeGameName(game)}</h2><p>Seleccione una categoría para ver los ítems.</p>`;
}

//TEST

// Mostrar el checklist y ocultar el dashboard
function showChecklist() {
	document.getElementById('dashboard').style.display = 'none';
	document.getElementById('checklist').style.display = 'block';
}

let isDashboardLoaded = false;

function selectGameAndLoadDashboard(game) {
    if (selectedGame === game && isDashboardLoaded) {
        console.log("Dashboard is already loaded for this game");
        return; // Prevents reloading if already loaded
    }
    
    selectedGame = game;
    isDashboardLoaded = true;

    // Hide the checklist and display the dashboard
    document.getElementById('checklist').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';

    // Update the dashboard title
    document.getElementById('game-title').textContent = capitalizeGameName(game);

    // Render the charts in the dashboard
    renderDashboardCharts(game);
}

// Store chart instances to prevent redundant creation
const chartInstances = {};
let renderCallCount = 0;

function renderDashboardCharts(game) {
    // Define the overall and category-specific item counts
    const overallData = { completed: 0, total: 1476 };
    const categoryData = {
        furniture: { completed: 0, total: 601 },
        fish: { completed: 0, total: 40 },
        bugs: { completed: 0, total: 40 },
        gyroids: { completed: 0, total: 127 },
        wallpapers: { completed: 0, total: 67 }
        // Agrega más categorías si es necesario
    };

    // Retrieve progress data from localStorage
    const savedProgress = JSON.parse(localStorage.getItem("progress")) || {};

    // Calcular el progreso completado para cada categoría
    Object.keys(categoryData).forEach(category => {
        const categoryProgress = savedProgress.root?.[game]?.[`${category}_${game}.json`] || {};
        let completedItems = 0;

        // Contar elementos que tienen valor true en cada subcategoría
        Object.values(categoryProgress).forEach(subCategory => {
            if (typeof subCategory === 'object') {
                completedItems += Object.values(subCategory).filter(isChecked => isChecked === true).length;
            }
        });

        categoryData[category].completed = completedItems;
        overallData.completed += completedItems;
    });

    // Renderizar los gráficos
    createProgressBarChart("overallChart", "Overall Progress", overallData);
    createProgressBarChart("furnitureChart", "Furniture Progress", categoryData.furniture);
    createProgressBarChart("fishChart", "Fish Progress", categoryData.fish);
    createProgressBarChart("bugsChart", "Bugs Progress", categoryData.bugs);
    createProgressBarChart("gyroidsChart", "Gyroids Progress", categoryData.gyroids);
    createProgressBarChart("wallpapersChart", "Wallpapers Progress", categoryData.wallpapers);
}



function createProgressBarChart(canvasId, label, data) {
    console.log(`Creating chart for ${label} on canvas ${canvasId} with data:`, data);

    // Verificar si el canvas y el contenedor ya tienen tamaño fijo
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas with ID ${canvasId} not found.`);
        return;
    }

    // Asegurar un tamaño fijo para el canvas
    canvas.style.width = "400px";
    canvas.style.height = "300px";

    // Check if a chart instance already exists for this canvas and destroy it if necessary
    if (chartInstances[canvasId]) {
        console.log(`Destroying previous chart instance on ${canvasId}`);
        chartInstances[canvasId].destroy();
    }

    // Crear el gráfico con configuración limitada de tamaño
    chartInstances[canvasId] = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: [label],
            datasets: [
                {
                    label: `${data.completed}/${data.total}`,
                    data: [data.completed, data.total - data.completed],
                    backgroundColor: ['#4caf50', '#e0e0e0'],
                    borderRadius: 5,
                    barThickness: 15
                }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: false,  // Desactivar tamaño responsivo para evitar redimensionamiento automático
            maintainAspectRatio: false,
            animation: false, // Disable animation to reduce flickering
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false },
                title: {
                    display: true,
                    text: `${label}: ${data.completed}/${data.total}`,
                    padding: { top: 5, bottom: 5 },
                    font: { size: 14, weight: 'bold' }
                }
            },
            scales: {
                x: { beginAtZero: true, max: data.total, display: false },
                y: { ticks: { display: false }, grid: { display: false } }
            },
            layout: { padding: { top: 5, bottom: 5, left: 10, right: 10 } }
        }
    });

    console.log(`Finished creating chart for ${label}`);
}
