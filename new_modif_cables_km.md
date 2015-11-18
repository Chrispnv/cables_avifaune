
### 1- Correction des erreurs géom en détail et édition : getItem SelectItem 
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

voir les fonction getEditItem et selectEditItem

### 2- Ajout du css pour onglet tableau et corriger afichage détail données == voir app.css
```css
/*
 * Détail tableau
 */
.dl-horizontal dt {
    float: left;
    margin-right: 10px;
    width: 300px;
    overflow: hidden;
    clear: right;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
}
```
