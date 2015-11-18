
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

