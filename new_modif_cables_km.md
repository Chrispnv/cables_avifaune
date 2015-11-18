
### 1- Correction des erreurs en détail : getItem SelectItem 
Dans les controlleurs ...DetailCtrl ou ...EditCtrl, il faut passer la valeur de la couche en cours dans le selectItem qui attend un param
- Exemple des cas de mortalités
```javascript
$scope.$on('display:init', function(ev, data){
        mapService.initializeCarte('js/resources/defaultMap.json').then(function(){
            mapService.loadData($scope._appName + '/mortalites', "mortalites").then(
                function(){                    
                    document.getElementById("mortalites").checked = true;
                    mapService.displayGeomData("mortalites");
                    storeFlag.setFlagLayer("mortalites", "cacheChecked");
                    mapService.selectItem($routeParams.id, 'mortalites'); 
                });
            $scope.title = data.espece;
        });
    });
};

```

- Et dans FormDirectives:

```javascript
                mapService.getLayerControl().addOverlay($scope.editLayer, "Edition");
                mapService.loadData($scope.options.dataUrl, $scope.options.dataUrl.split("/")[1]).then(function(){
                    if($scope.origin){
                        $timeout(function(pThemaData){
                            var layer = mapService.selectItem($scope.origin, 'mortalites');
                            if(layer){
                                setEditLayer(layer);
                            }
                        }, 0);
                    }
                    mapService.getMap().addLayer($scope.editLayer);
                    mapService.getMap().removeLayer(mapService.getLayer($scope.options.dataUrl.split("/")[1]));
                });

```
