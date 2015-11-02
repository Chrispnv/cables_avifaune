
### 1- Changement de MarkerClusterGroup en featureGroup
mapServices.js: Changement de toutes les couches en featureGroup sauf cas de mortalités
```javascript
var tabThemaData = {
  "zonessensibles" : L.featureGroup(), 
  "mortalites" : L.markerClusterGroup(), 
  "tronconserdf": L.featureGroup(),
  "poteauxerdf": L.featureGroup(),
  "eqtronconserdf": L.featureGroup(),
  "eqpoteauxerdf": L.featureGroup(),
  "nidifications": L.featureGroup(),
  "observations": L.featureGroup(),
  "erdfappareilcoupure": L.featureGroup(),
  "ogmcablesremonteesmecaniques": L.featureGroup(),
  "rtelignes": L.featureGroup(),
};

```

### 2- Gestion de la couleur des couches
