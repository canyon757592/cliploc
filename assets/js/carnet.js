/* Page du Carnet des étoiles : achat en un geste */
import { offreCarnet } from "./achats.js";
const b = document.getElementById("btnCarnet");
if (b) b.addEventListener("click", offreCarnet);
if (new URLSearchParams(location.search).get("achat") === "annule") { const m = document.getElementById("msgCarnet"); if (m) m.textContent = "Paiement annulé : rien n'a été débité."; }
