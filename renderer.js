let selectedGame = '';
let selectedCategory = '';
let fileName; // Declara `fileName` globalmente para que sea accesible en todas las funciones

const fs = require('fs');
const path = require('path');

// Función para mostrar el checklist y ocultar el dashboard
function selectGameAndLoadDashboard(game, loadDashboard = true) {
    if (selectedGame === game && isDashboardLoaded && loadDashboard) {
        console.log("Dashboard is already loaded for this game");
        return; // Prevent reloading if already loaded
    }

    selectedGame = game;

    if (loadDashboard) {
        // Show dashboard and hide checklist
        document.getElementById('checklist').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';

        // Update dashboard title
        document.getElementById('game-title').textContent = capitalizeGameName(game);

        // Render the charts in the dashboard
        renderDashboardCharts(game);

        // Show category links
        const categoryLinks = document.querySelectorAll('.category-link');
        categoryLinks.forEach(link => link.style.display = 'inline-block');

        // Update checklist content
        document.getElementById('checklist').innerHTML = `
            <h2>Juego seleccionado: ${capitalizeGameName(game)}</h2>
            <p>Seleccione una categoría para ver los ítems.</p>
        `;
        isDashboardLoaded = true;
    } else {
        // Show checklist and hide dashboard
        document.getElementById('checklist').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';


        isDashboardLoaded = false;
    }
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
// Mostrar una categoría específica y obtener el índice para la clave de progreso (guardar archivo de progreso)
function showCategory(category) {
    if (!selectedGame) {
        alert('Por favor, seleccione un juego primero.');
        return;
    }

    // Ocultar el dashboard y mostrar el checklist
    document.getElementById('dashboard').style.display = 'none';
    isDashboardLoaded = false;
    document.getElementById('checklist').style.display = 'block';

    // Asigna `fileName` basado en el juego seleccionado y la categoría
    fileName = `${category}_${selectedGame}.json`;

    const checklist = document.getElementById('checklist');
    const filePath = path.join(__dirname, fileName);

    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Detectar la clave principal en el JSON
        const mainKey = Object.keys(data)[0];
        const itemsData = data[mainKey];

        // Actualizar contenido del checklist
        checklist.innerHTML = `<h2>${capitalizeGameName(selectedGame)} - ${capitalizeCategory(category)}</h2>`;
        renderSeriesList(itemsData, checklist);
        renderAllItems(itemsData, checklist);
    } catch (error) {
        // Mostrar mensaje de error si no se puede cargar el archivo
        checklist.innerHTML = `<p>No se pudo cargar la categoría: ${error.message}</p>`;
        console.error("Error al cargar el archivo:", error);
    }
}





// Función para calcular el color en función del porcentaje completado
function getCompletionColor(percentage) {
    if (percentage === 100) {
        return "gold"; // Usamos 'gold' para identificar que debe aplicar el estilo dorado
    }
    const baseHue = 35; // Tono inicial (marrón claro)
    const greenHue = 120; // Tono final (verde)
    const hue = baseHue + ((greenHue - baseHue) * (percentage / 100));
    return `hsl(${hue}, 70%, 50%)`;
}



// Aplica el estilo adecuado al botón basado en el porcentaje de completitud
function applyButtonStyle(buttonElement, percentage) {
    if (percentage === 100) {
        buttonElement.classList.add("golden-button");
        buttonElement.style.background = ""; // Elimina cualquier color inline previo
    } else {
        buttonElement.classList.remove("golden-button");
        buttonElement.style.backgroundColor = getCompletionColor(percentage);
    }
}


// Al cargar la página, aplica el estilo correspondiente a cada botón basado en el progreso guardado
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.series-button').forEach(button => {
        const seriesName = button.dataset.seriesName; // Asegúrate de que cada botón tenga un data-series-name con el nombre de la serie
        const progress = getProgressForSeries(seriesName);
        applyButtonStyle(button, progress);
    });
});


// Ejemplo de cómo enlazar las funciones
document.querySelectorAll('.series-button').forEach(button => {
    const progress = getProgressForSeries(button.dataset.seriesName); // Calcula el progreso en porcentaje
    applyButtonStyle(button, progress); // Aplica el color o estilo dorado según el progreso
});


// Ejemplo de cómo enlazar las funciones
document.querySelectorAll('.series-button').forEach(button => {
    const progress = getProgressForSeries(button.dataset.seriesName); // Supón que esta función devuelve el progreso en %
    applyButtonStyle(button, progress);
});

// Ejemplo de aplicación en tu lógica actual
document.querySelectorAll('.series-button').forEach(button => {
    const progress = getProgressForSeries(button.dataset.seriesName); // Función que devuelve el progreso
    const isComplete = progress === 100;
    applyButtonStyle(button, isComplete);
});


// Ejemplo de cómo actualizar el estilo al cambiar el progreso
function updateCompletionTextAndColor(seriesName, seriesLink, checkedCount, totalItems) {
    const percentage = Math.floor((checkedCount / totalItems) * 100);
    applyButtonStyle(seriesLink, percentage); // Actualiza el estilo basado en el progreso
    seriesLink.title = `${percentage}% completado`;
    seriesLink.style.color = percentage === 100 ? 'white' : '#8b5a2b'; // Cambia el texto a blanco al 100%
}


// Función para obtener el progreso de una serie específica
function getProgressForSeries(seriesName) {
    const savedProgress = JSON.parse(localStorage.getItem("progress")) || {};
    const seriesProgress = savedProgress[selectedGame]?.[fileName]?.[seriesName] || {};
    const checkedCount = Object.values(seriesProgress).filter(Boolean).length;
    const totalItems = Object.keys(seriesProgress).length;
    return Math.floor((checkedCount / totalItems) * 100);
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

    // Ordenar furnitureData alfabéticamente por el nombre de la serie
    furnitureData.sort((a, b) => a.series.localeCompare(b.series));

    furnitureData.forEach(series => {
        const seriesLink = document.createElement('a');
        seriesLink.classList.add('series-link');
        seriesLink.textContent = series.series;
        seriesLink.href = `#${series.series.replace(/\s+/g, '-')}`;

        // Cargar el progreso y calcular el porcentaje
        const totalItems = series.items.length;
        const completedItems = series.items.filter(item => loadSavedProgress(series.series, item.name)).length;
        const completionPercentage = Math.floor((completedItems / totalItems) * 100);

        // Aplica el color de fondo según el progreso
        if (completionPercentage === 100) {
            seriesLink.classList.add("golden-button"); // Añadir la clase dorada si está completo
            seriesLink.style.background = ""; // Eliminar cualquier estilo de fondo en línea
        } else {
            seriesLink.classList.remove("golden-button");
            seriesLink.style.backgroundColor = getCompletionColor(completionPercentage);
            seriesLink.style.color = completionPercentage > 50 ? 'white' : '#8b5a2b';
        }

        // Añadir el porcentaje de completitud como título (tooltip)
        seriesLink.title = `${completionPercentage}% completado`;

        // Añadir el atributo de datos para el nombre de la serie
        seriesLink.dataset.series = series.series;

        // Añadir el enlace al contenedor
        seriesListContainer.appendChild(seriesLink);
    });

    // Añadir el contenedor de la lista de series al checklist
    checklist.appendChild(seriesListContainer);

    // Añadir botón de reset
    const resetAllButton = document.createElement('button');
    resetAllButton.textContent = 'Reiniciar todo el progreso';
    resetAllButton.classList.add('reset-button');
    resetAllButton.onclick = resetAllProgress;
    checklist.appendChild(resetAllButton);
}


// Función para renderizar todos los ítems de una categoría (genérica para "Furniture", "Fish", etc.)
function renderAllItems(data, checklist) {
    data.forEach(series => {
        const seriesContainer = document.createElement('div');
        seriesContainer.classList.add('series-container');
        seriesContainer.id = series.series.replace(/\s+/g, '-');

        // Título de la serie y porcentaje completado
        const seriesHeader = document.createElement('div');
        seriesHeader.classList.add('series-header');
        const seriesTitle = document.createElement('h3');
        seriesTitle.textContent = series.series;

        const completionText = document.createElement('span');
        completionText.classList.add('completion-text');

        // Contador de elementos marcados
        let checkedCount = 0;
        const totalItems = series.items.length;

        // Calcular el progreso actual
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
            <th>Nombre</th>
            <th>Precio</th>
            <th>Fuente</th>
        `;
        table.appendChild(headerRow);

        series.items.forEach(item => {
            const row = document.createElement('tr');
            row.classList.add('item');

            // Columna del checkbox
            const checkboxCell = document.createElement('td');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = loadSavedProgress(series.series, item.name);

            // Evento para actualizar el progreso y guardar el estado al marcar/desmarcar
            checkbox.addEventListener('change', () => {
                saveProgress(series.series, item.name, checkbox.checked);
                checkbox.checked ? checkedCount++ : checkedCount--; 
                completionText.textContent = `${Math.floor((checkedCount / totalItems) * 100)}%`;
                const seriesLink = document.querySelector(`[data-series="${series.series}"]`);
                updateCompletionTextAndColor(series.series, seriesLink, checkedCount, totalItems);
            });

            checkboxCell.appendChild(checkbox);

            // Columna del nombre
            const nameCell = document.createElement('td');
            nameCell.textContent = item.name;

            // Columna del precio
            const priceCell = document.createElement('td');
            priceCell.textContent = item.bells ? `${item.bells} bells` : '-';

            // Columna de la fuente
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

// Función para crear gráficos de barras horizontales con progreso contenido
function createProgressBarChart(canvasId, label, data) {
    // Verificar si ya existe una instancia del gráfico y destruirla
    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }

    const ctx = document.getElementById(canvasId).getContext("2d");

// Crear un gradiente como color de fondo de la barra
const gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
gradient.addColorStop(0, '#4caf50');  // Color inicial (verde)
gradient.addColorStop(1, '#81c784');  // Color final (verde claro)

chartInstances[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [label],
        datasets: [
            {
                label: `${data.completed}/${data.total}`,
                data: [data.completed],
                backgroundColor: gradient, // Gradiente en el color de la barra
                borderRadius: 20,
                borderSkipped: false,  // Borde redondeado en ambos lados
                barThickness: 80
            }
        ]
    },
    options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 1000,
            easing: 'easeInOutQuad'
        },
        plugins: {
            tooltip: {
                enabled: false,  // Desactivar tooltip predeterminado
                external: function(context) {
                    // Llamar a la función personalizada del tooltip
                    customTooltipHandler(context, label, data);
                }
            },
			legend: {
                display: false
            }
			
        },
        scales: {
            x: {
                beginAtZero: true,
                max: data.total,
                display: false
            },
            y: {
                display: false
            }
        },
        layout: {
            padding: {
                top: 15,
                bottom: 15,
                left: 20,
                right: 20
            }
        }
    }
});
}

function customTooltipHandler(context, label, data) {
    // Obtener el tooltip div
    const tooltipEl = document.getElementById('customTooltip');

    // Mostrar el tooltip
    if (context.tooltip.opacity === 0) {
        tooltipEl.style.opacity = 0;
        tooltipEl.style.display = 'none';
        return;
    }

    // Configurar el contenido del tooltip
    const tooltipData = context.tooltip.dataPoints[0];
    tooltipEl.innerHTML = `<strong>${label}</strong><br> Progreso: ${data.completed} / ${data.total}`;

    // Hacer visible el tooltip
    tooltipEl.style.display = 'block';
    tooltipEl.style.opacity = 1;

    // Posicionar el tooltip
    const position = context.chart.canvas.getBoundingClientRect();
    tooltipEl.style.left = position.left + window.pageXOffset + context.tooltip.caretX + 'px';
    tooltipEl.style.top = position.top + window.pageYOffset + context.tooltip.caretY + 'px';
}
