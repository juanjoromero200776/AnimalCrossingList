const fs = require("fs"),
	path = require("path");
let selectedGame = null;

function scrollToTop() {
	window.scrollTo({
		top: 0,
		behavior: "smooth"
	})
}

function showMainMenu() {
	document.getElementById("dashboard").style.display = "none", document.getElementById("checklist").style.display = "block", selectedGame = null;
	document.getElementById("checklist").innerHTML = "<h2>Selecciona un juego para continuar.</h2>";
	document.querySelectorAll(".category-link").forEach((e => {
		e.style.display = "none"
	}))
}

function selectGame(e) {
	selectedGame = e, document.getElementById("checklist").style.display = "block", document.getElementById("dashboard").style.display = "none";
	document.querySelectorAll(".category-link").forEach((e => e.style.display = "inline-block")), document.getElementById("checklist").innerHTML = `<h2>Juego seleccionado: ${capitalizeGameName(e)}</h2><p>Seleccione una categoría para ver los ítems.</p>`
}

function capitalizeGameName(e) {
	return e.split("_").map((e => e.charAt(0).toUpperCase() + e.slice(1))).join(" ")
}

function showCategory(e) {
	if (!selectedGame) return void alert("Por favor, seleccione un juego primero.");
	const t = document.getElementById("checklist"),
		o = path.join(__dirname, `${e}_${selectedGame}.json`);
	try {
		const n = JSON.parse(fs.readFileSync(o, "utf8"));
		t.innerHTML = `<h2>${capitalizeGameName(selectedGame)} - ${capitalizeCategory(e)}</h2>`, renderSeriesList(n.Furniture, t), renderAllFurnitureItems(n.Furniture, t)
	} catch (e) {
		t.innerHTML = `<p>No se pudo cargar la categoría: ${e.message}</p>`
	}
}

function capitalizeCategory(e) {
	return e.charAt(0).toUpperCase() + e.slice(1)
}

function getCompletionColor(e) {
	if (100 === e) return "#3498db";
	return `hsl(${35+e/100*85}, 70%, 50%)`
}

function updateCompletionTextAndColor(e, t, o, n) {
	const a = Math.floor(o / n * 100);
	t.style.backgroundColor = getCompletionColor(a), t.title = `${a}% completado`, t.style.color = 100 === a ? "white" : "#8b5a2b"
}

function resetAllProgress() {
	localStorage.removeItem("progress"), alert("Se ha reiniciado el progreso de todo el programa."), location.reload()
}

function renderSeriesList(e, t) {
	const o = document.createElement("div");
	o.classList.add("series-list"), e.forEach((e => {
		const t = document.createElement("a");
		t.classList.add("series-link"), t.textContent = e.series, t.href = `#${e.series.replace(/\s+/g,"-")}`;
		const n = e.items.length,
			a = e.items.filter((t => loadSavedProgress(e.series, t.name))).length,
			r = Math.floor(a / n * 100);
		t.style.backgroundColor = getCompletionColor(r), t.style.color = r > 50 ? "white" : "#8b5a2b", t.title = `${r}% completado`, t.dataset.series = e.series, o.appendChild(t)
	})), t.appendChild(o);
	const n = document.createElement("button");
	n.textContent = "Reiniciar todo el progreso", n.classList.add("reset-button"), n.onclick = resetAllProgress, t.appendChild(n)
}

function renderAllFurnitureItems(e, t) {
	e.forEach((e => {
		const o = document.createElement("div");
		o.classList.add("series-container"), o.id = e.series.replace(/\s+/g, "-");
		const n = document.createElement("div");
		n.classList.add("series-header");
		const a = document.createElement("h3");
		a.textContent = `${e.series}`;
		const r = document.createElement("span");
		r.classList.add("completion-text");
		let s = 0;
		const l = e.items.length;
		e.items.forEach((t => {
			loadSavedProgress(e.series, t.name) && s++
		})), r.textContent = `${Math.floor(s/l*100)}%`, n.appendChild(a), n.appendChild(r), o.appendChild(n);
		const c = document.createElement("table");
		c.classList.add("item-table");
		const i = document.createElement("tr");
		i.innerHTML = "\n            <th>✔️</th>\n            <th>Item</th>\n            <th>Price (Bells)</th>\n            <th>Source</th>\n        ", c.appendChild(i), e.items.forEach((t => {
			const o = document.createElement("tr");
			o.classList.add("item");
			const n = document.createElement("td"),
				a = document.createElement("input");
			a.type = "checkbox", a.checked = loadSavedProgress(e.series, t.name), a.addEventListener("change", (() => {
				saveProgress(e.series, t.name, a.checked), a.checked ? s++ : s--, r.textContent = `${Math.floor(s/l*100)}%`;
				const o = document.querySelector(`[data-series="${e.series}"]`);
				updateCompletionTextAndColor(e.series, o, s, l)
			})), n.appendChild(a);
			const i = document.createElement("td");
			i.textContent = t.name;
			const d = document.createElement("td");
			d.textContent = t.bells ? `${t.bells} bells` : "-";
			const m = document.createElement("td");
			m.textContent = t.source || "-", o.appendChild(n), o.appendChild(i), o.appendChild(d), o.appendChild(m), c.appendChild(o)
		})), o.appendChild(c), t.appendChild(o)
	}))
}

function loadSavedProgress(e, t) {
	const o = JSON.parse(localStorage.getItem("progress")) || {};
	return o[e] && o[e][t]
}

function saveProgress(e, t, o) {
	const n = JSON.parse(localStorage.getItem("progress")) || {};
	n[e] = n[e] || {}, n[e][t] = o, localStorage.setItem("progress", JSON.stringify(n))
}

function exportProgress() {
	const e = JSON.parse(localStorage.getItem("progress")) || {},
		t = new Blob([JSON.stringify(e, null, 2)], {
			type: "application/json"
		}),
		o = URL.createObjectURL(t),
		n = document.createElement("a");
	n.href = o, n.download = "progress.json", n.click(), URL.revokeObjectURL(o)
}

function importProgress(e) {
	const t = e.target.files[0];
	if (!t) return;
	const o = new FileReader;
	o.onload = e => {
		try {
			const t = JSON.parse(e.target.result);
			"object" == typeof t ? (localStorage.setItem("progress", JSON.stringify(t)), alert("Progreso importado con éxito."), location.reload()) : alert("El archivo no es válido.")
		} catch (e) {
			alert("Error al importar progreso."), console.error(e)
		}
	}, o.readAsText(t)
}

function loadChecklist(e) {
	selectedGame = e;
	const t = document.getElementById("checklist"),
		o = document.getElementById("dashboard"),
		n = document.querySelectorAll(".category-link");
	t.style.display = "block", o.style.display = "none", n.forEach((e => e.style.display = "inline-block")), t.innerHTML = `<h2>Juego seleccionado: ${capitalizeGameName(e)}</h2><p>Seleccione una categoría para ver los ítems.</p>`
}

function capitalizeGameName(e) {
	return e.split("_").map((e => e.charAt(0).toUpperCase() + e.slice(1))).join(" ")
}

function showChecklist() {
	document.getElementById("dashboard").style.display = "none", document.getElementById("checklist").style.display = "block"
}

function showCategory(e) {
	if (!selectedGame) return void alert("Por favor, seleccione un juego primero.");
	showChecklist();
	const t = document.getElementById("checklist"),
		o = `${e}_${selectedGame}.json`,
		n = path.join(__dirname, o);
	try {
		const o = JSON.parse(fs.readFileSync(n, "utf8"));
		t.innerHTML = `<h2>${capitalizeGameName(selectedGame)} - ${capitalizeCategory(e)}</h2>`, renderSeriesList(o.Furniture, t), renderAllFurnitureItems(o.Furniture, t)
	} catch (e) {
		t.innerHTML = `<p>No se pudo cargar la categoría: ${e.message}</p>`
	}
}
window.addEventListener("scroll", (() => {
	const e = document.getElementById("back-to-top");
	window.scrollY > 200 ? e.style.display = "block" : e.style.display = "none"
})), document.getElementById("search-input").addEventListener("input", (function() {
	const e = this.value.toLowerCase(),
		t = document.querySelectorAll("#checklist .item"),
		o = document.querySelectorAll("#checklist .series-container");
	t.forEach((t => t.style.display = t.textContent.toLowerCase().includes(e) ? "table-row" : "none")), o.forEach((e => {
		const t = e.querySelectorAll('.item[style*="table-row"]');
		e.style.display = t.length > 0 ? "block" : "none"
	}))
}));
const chartInstances = {};

function clearCanvas(e) {
	chartInstances[e] && (chartInstances[e].destroy(), chartInstances[e] = null)
}

function renderDashboardCharts(e) {
	clearCanvas("overallChart"), clearCanvas("fishChart"), clearCanvas("bugsChart");
	const t = {
			completed: 500,
			pending: 976,
			total: 1476
		},
		o = {
			completed: 50,
			pending: 100,
			total: 150
		},
		n = {
			completed: 30,
			pending: 40,
			total: 70
		};
	chartInstances.overallChart || createProgressBarChart("overallChart", "Overall Progress", t), chartInstances.fishChart || createProgressBarChart("fishChart", "Fish Progress", o), chartInstances.bugsChart || createProgressBarChart("bugsChart", "Bugs Progress", n)
}

function selectGameAndLoadDashboard(e) {
	selectedGame === e && isDashboardLoaded || (selectedGame = e, isDashboardLoaded = !0, document.getElementById("checklist").style.display = "none", document.getElementById("dashboard").style.display = "block", document.getElementById("game-title").textContent = capitalizeGameName(e), renderDashboardCharts(e))
}

function showMainMenu() {
	document.getElementById("dashboard").style.display = "none", document.getElementById("checklist").style.display = "block", isDashboardLoaded = !1
}

function capitalizeGameName(e) {
	return e.split("_").map((e => e.charAt(0).toUpperCase() + e.slice(1))).join(" ")
}