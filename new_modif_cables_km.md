
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
/******Css tableau **********************************/
.with-nav-tabs.panel-primary .nav-tabs > li > a,
.with-nav-tabs.panel-primary .nav-tabs > li > a:hover,
.with-nav-tabs.panel-primary .nav-tabs > li > a:focus {
    color: #0000;
}
.with-nav-tabs.panel-primary .nav-tabs > .open > a,
.with-nav-tabs.panel-primary .nav-tabs > .open > a:hover,
.with-nav-tabs.panel-primary .nav-tabs > .open > a:focus,
.with-nav-tabs.panel-primary .nav-tabs > li > a:hover,
.with-nav-tabs.panel-primary .nav-tabs > li > a:focus {
  color: #fff;
  background-color: #3071a9;
  border-color: transparent;
}
.with-nav-tabs.panel-primary .nav-tabs > li.active > a,
.with-nav-tabs.panel-primary .nav-tabs > li.active > a:hover,
.with-nav-tabs.panel-primary .nav-tabs > li.active > a:focus {
  color: #fff;
  background-color: #3071a9;
  border-color: #428bca;
  border-bottom-color: transparent;
}
/********************************************************************/

/****** Titre en détail */
.editDetailButton{
  float:right;
  margin-top:35px;
}
```
