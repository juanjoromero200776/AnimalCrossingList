const fs = require('fs');
const path = require('path');
let selectedGame = null;
let isDashboardLoaded = false;
const chartInstances = {}; // To store chart instances for cleanup

// Function to scroll to top
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// Show/Hide back-to-top button on scroll
window.addEventListener('scroll', () => {
  const backToTopButton = document.getElementById('back-to-top');
  backToTopButton.style.display = window.scrollY > 200 ? 'block' : 'none';
});

// Main function to reset to main menu
function showMainMenu() {
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('checklist').style.display = 'block';
  selectedGame = null;
  isDashboardLoaded = false; // Reset the dashboard loaded flag
  const checklist = document.getElementById('checklist');
  checklist.innerHTML = `<h2>Selecciona un juego para continuar.</h2>`;
  hideCategoryLinks();
}

// Hide all category links initially
function hideCategoryLinks() {
  const categoryLinks = document.querySelectorAll('.category-link');
  categoryLinks.forEach(link => link.style.display = 'none');
}

// Show category links once a game is selected
function showCategoryLinks() {
  const categoryLinks = document.querySelectorAll('.category-link');
  categoryLinks.forEach(link => link.style.display = 'inline-block');
}

// Function to select a game and load the checklist
function loadChecklist(game) {
  selectedGame = game;
  isDashboardLoaded = false;
  const checklist = document.getElementById('checklist');
  const dashboard = document.getElementById('dashboard');
  checklist.style.display = 'block';
  dashboard.style.display = 'none';
  showCategoryLinks();
  checklist.innerHTML = `<h2>Juego seleccionado: ${capitalizeGameName(game)}</h2><p>Seleccione una categoría para ver los ítems.</p>`;
}

// Function to load the dashboard for a selected game
function selectGameAndLoadDashboard(game) {
  if (selectedGame === game && isDashboardLoaded) return;
  selectedGame = game;
  isDashboardLoaded = true;
  document.getElementById('checklist').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
  document.getElementById('game-title').textContent = capitalizeGameName(game);
  renderDashboardCharts(game);
}

// Function to capitalize game names
function capitalizeGameName(game) {
  const words = game.split('_');
  return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Clear previous chart from canvas
function clearCanvas(canvasId) {
  if (chartInstances[canvasId]) {
    chartInstances[canvasId].destroy();
    chartInstances[canvasId] = null;
  }
}

// Render charts in the dashboard
function renderDashboardCharts(game) {
  clearCanvas('overallChart');
  clearCanvas('fishChart');
  clearCanvas('bugsChart');

  const overallData = { completed: 500, total: 1476 };
  const fishData = { completed: 50, total: 150 };
  const bugsData = { completed: 30, total: 70 };

  createProgressBarChart('overallChart', 'Overall Progress', overallData);
  createProgressBarChart('fishChart', 'Fish Progress', fishData);
  createProgressBarChart('bugsChart', 'Bugs Progress', bugsData);
}

// Create a horizontal progress bar chart
function createProgressBarChart(canvasId, label, data) {
  clearCanvas(canvasId);

  chartInstances[canvasId] = new Chart(document.getElementById(canvasId), {
    type: 'bar',
    data: {
      labels: [label],
      datasets: [{
        label: `${data.completed}/${data.total}`,
        data: [data.completed, data.total - data.completed],
        backgroundColor: ['#4caf50', '#e0e0e0'],
        borderRadius: 5,
        barThickness: 15,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
        title: { display: true, text: `${label}: ${data.completed}/${data.total}`, font: { size: 14, weight: 'bold' } },
      },
      scales: {
        x: { beginAtZero: true, max: data.total, display: false },
        y: { ticks: { display: false }, grid: { display: false } }
      },
      layout: { padding: { top: 5, bottom: 5, left: 10, right: 10 } }
    }
  });
}

// Show selected category within the checklist
function showCategory(category) {
  if (!selectedGame) {
    alert('Por favor, seleccione un juego primero.');
    return;
  }

  const checklist = document.getElementById('checklist');
  checklist.style.display = 'block';
  document.getElementById('dashboard').style.display = 'none';

  const filePath = path.join(__dirname, `${category}_${selectedGame}.json`);
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    checklist.innerHTML = `<h2>${capitalizeGameName(selectedGame)} - ${capitalizeCategory(category)}</h2>`;
    renderSeriesList(data.Furniture, checklist);
    renderAllFurnitureItems(data.Furniture, checklist);
  } catch (error) {
    checklist.innerHTML = `<p>No se pudo cargar la categoría: ${error.message}</p>`;
  }
}

// Capitalize category names
function capitalizeCategory(category) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}
