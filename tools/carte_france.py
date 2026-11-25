#!/usr/bin/env python3
"""Prépare les données de la carte /carte/ (locations courte durée par département).

Usage : python3 tools/carte_france.py CHEMIN/departements-version-simplifiee.geojson
  - chiffres : tools/data/eurostat_tour_ce_oan3.csv
    Eurostat, jeu « tour_ce_oan3 » : nuitées réservées via les plateformes en ligne
    (Airbnb, Booking.com, Expedia Group, Tripadvisor), par département (NUTS 3).
  - contours : france-geojson (G. David), d'après IGN Admin Express, Licence Ouverte.
    https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements-version-simplifiee.geojson
Écrit carte/data/france.json, puis relancer tools/build_pages.py.
"""
import csv, json, os, sys, unicodedata

from shapely.geometry import shape, mapping

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOM = {"FRY10": "971", "FRY20": "972", "FRY30": "973", "FRY40": "974", "FRY50": "976"}


def cle(s):
    s = unicodedata.normalize("NFD", s.replace("’", "'")).encode("ascii", "ignore").decode().lower()
    return "".join(c for c in s if c.isalnum())


def arrondi(o):
    if isinstance(o, float):
        return round(o, 3)
    if isinstance(o, (list, tuple)):
        return [arrondi(x) for x in o]
    return o


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    rows = list(csv.DictReader(open(os.path.join(ROOT, "tools", "data", "eurostat_tour_ce_oan3.csv"), encoding="utf-8")))
    gj = json.load(open(sys.argv[1], encoding="utf-8"))
    geo = {cle(f["properties"]["nom"]): f for f in gj["features"]}
    total = sum(int(r["nuitees_2025"]) for r in rows)
    deps, feats = [], []
    for r in rows:
        v25, v24, f25 = int(r["nuitees_2025"]), int(r["nuitees_2024"]), int(r["etrangers_2025"])
        f = geo.pop(cle(r["nom"]), None)
        code = f["properties"]["code"] if f else DOM.get(r["nuts3"])
        assert code, r["nom"]
        deps.append({"c": code, "n": r["nom"], "v": v25, "p": v24, "e": f25, "dom": f is None})
        if f:
            g = shape(f["geometry"]).simplify(0.015, preserve_topology=True)
            feats.append({"type": "Feature", "properties": {"c": code}, "geometry": arrondi(mapping(g))})
    assert not geo, f"contours sans chiffres : {list(geo)}"
    assert len(feats) == 96, len(feats)
    deps.sort(key=lambda d: -d["v"])
    for i, d in enumerate(deps, 1):
        d["r"] = i
    out = {"annee": 2025, "total": total, "total_prec": sum(d["p"] for d in deps),
           "deps": deps, "geo": {"type": "FeatureCollection", "features": feats}}
    os.makedirs(os.path.join(ROOT, "carte", "data"), exist_ok=True)
    p = os.path.join(ROOT, "carte", "data", "france.json")
    json.dump(out, open(p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(f"{len(deps)} départements, {total} nuitées, {os.path.getsize(p) // 1024} Ko")


if __name__ == "__main__":
    main()
