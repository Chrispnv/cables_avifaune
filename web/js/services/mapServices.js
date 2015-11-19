app = angular.module('mapServices');

/*
 * * #1 - configuration des types couches de bases == voir js/resource
 */
app.factory('LeafletServices', ['$http', function($http) {
    return {

    /* changement du nom de "layer" en "couche" 
    */
      couche : {},  
            
      loadData : function(layerdata) {
        this.couche = {}; 
        this.couche.name = layerdata.name; // nom de la couche
        this.couche.active = layerdata.active; // true ou false pour activer le fond par default
        
        
        if (layerdata.type == 'tileLayer' || layerdata.type == 'ign') {
          if ( layerdata.type == 'ign') {
            url = 'https://gpp3-wxs.ign.fr/' + layerdata.key + '/geoportail/wmts?LAYER='+layerdata.layer+'&EXCEPTIONS=text/xml&FORMAT=image/jpeg&SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}'; 
          }
          else {
            url = layerdata.url;
          }
          this.couche.map = new L.TileLayer(url,layerdata.options);
        }
        else if (layerdata.type == 'wms') {
          this.couche.map = L.tileLayer.wms(layerdata.url,layerdata.options);
        }
        return this.couche;
      }
   };
}]);

/*
  * * #2 - Service cartographique
  */
app.factory('mapService', function(){
    return {};
});



 /*
  * * #3 - Directive pour la gestion de la carte Leaflet et des couches s
  */
app.directive('leafletMap', function(){
    return {
        restrict: 'A',
        scope: {
            data: '=',
        },
        templateUrl: 'js/templates/display/map.htm',
        controller: function($scope, $filter, $q, $rootScope, LeafletServices, mapService,  configServ, dataServ, $timeout, $loading, $routeParams, userServ, storeFlag, loadDataSymf){
                  

            // Variables globales dans la directive leafletMap
            var map = null; // la carte 
            var zonessensibles = null; // couche de données "Zones sensibles"
            var mortalites = null; // couche de données "mortalités"
            var tronconserdf = null; // couche de données "Tronçons ERDF"
            var poteauxerdf = null; // couche de données "Tronçons ERDF"
            var eqtronconserdf = null; // couche de données "Equipements tronçons ERDF"
            var eqpoteauxerdf = null; // couche de données "Equipements tronçons ERDF"
            var nidifications = null; // couche de données "Sites de nidification"
            var observations = null; // couche de données "Observations"
            var erdfappareilcoupure = null; // couche de référence ERDF
            var ogmcablesremonteesmecaniques = null; // couche de référence ERDF
            var rtelignes = null; // couche de référence ERDF
            var tileLayers = {}; // couche pour les fonds de référence
            var geoms = []; // tableau des couches Leaflet GeoJSON créées 
            var geom = []; // couche Leaflet GeoJSON
            var currentSel = null; // la géometrie séléctionnée en détail
            var layerControl = null; // couches de contrôle pour la légende Leaflet
            var resource = null;  // couches  de référence dans la carte                    
            
            // Tableau des couches métier             
            var tabThemaData = {
                "zonessensibles" : L.featureGroup(), 
                "mortalites" : L.markerClusterGroup(), 
                "tronconserdf": L.featureGroup(),
                "poteauxerdf": L.featureGroup(),
                "eqtronconserdf": L.featureGroup(),
                "eqpoteauxerdf": L.featureGroup(),
                "nidifications": L.featureGroup(),
                "observations": L.markerClusterGroup(),
                "erdfappareilcoupure": L.featureGroup(),
                "ogmcablesremonteesmecaniques": L.featureGroup(),
                "rtelignes": L.featureGroup(),
            };
            // Ajout du tableau dans le mapService pour la gestion de l'accrochage des couches ** voir FormDirectives **
            mapService.tabThemaData = tabThemaData 
            
            /*
             * Déclaration des styles pour les couches (icons et pictos) 
             */
             // Style Zones sensibles
             var zsCouleur = {
                weight: 2,
                color: "#DE0101",
                opacity: 0.5,
                fillColor: "#DE0101",
                fillOpacity: 0.5
            }
            //Style pour les polygones 
            var polyStyle = {
                weight: 2,
                opacity: 0,
                fillOpacity: 0.5
            }
            // style pour les lignes
            var lineStyle = {
                opacity: 0.8
            };
            //Style pour les électrocutions
            var iconElec = L.AwesomeMarkers.icon({
				prefix: 'fa',
                icon: 'bolt',
                markerColor: 'cadetblue',
                iconColor: '#DECF06'
			});
           	//Style pour pércussions
            var iconPerc = L.AwesomeMarkers.icon({
                icon: 'glyphicon-certificate',
                markerColor: 'cadetblue',
                iconColor: '#FFF'
            });         
            //Style pour les poteaux à risque élevé
            var poRisqueEleve = L.icon({
                className : 'poRisqueEleve',
                iconUrl: 'css/lib/images/marker-poteau.png', 
            });
            //Style pour les poteaux à risque secondaire
            var poRisqueSecondaire = L.icon({
                className : 'poRisqueSecondaire',
                iconUrl: 'css/lib/images/marker-poteau.png',                
            });
            //Style pour les poteaux à non risque 
            var poNonRisque = L.icon({
                className : 'poNonRisque',
                iconUrl: 'css/lib/images/marker-poteau.png', 
            });
            //Style pour les équipements poteaux
            var eqPoteau = L.icon({
                className : 'eqPoteau',
                iconUrl: 'css/lib/images/marker-poteau.png', 
            });
            //Style pour les équipements tronçons
            var eqTroncon = {
              color:'#5CB85C',
              width:1,
              opacity:0.8
            }

            //Initialisation de la carte et de ses contrôles            
            var initializeCarte = function(configUrl){ 
                var dfd = $q.defer();
                try{
                    map = L.map('mapd', { 
                            maxZoom: 17,
                            fullscreenControl:true, 
                            // Ajout de l'option plein écran 
                            fullscreenControlOptions:{
                                position:'topright',
                                title: 'Afficher en plein écran !',
                            }                           
                          });

                    // Ajout des couches sur la carte
                    for(var key in tabThemaData){
                        tabThemaData[key].addTo(map);
                    }                    
           
                    /* Récupération de l'url de données avec getUrl de configServ
                     * Url fourni dans les contôles des base (exemple : cablesControllers.js)
                     */
                    configServ.getUrl(configUrl, function(res){
                        resource = res[0];
                        //Chargement des fonds de référence : layers ==> baselayers définis defaultMap.json                     
                        var curlayer = null;
                        configServ.get('map:currentLayer', function(_curlayer){
                            curlayer = _curlayer
                        });
                        resource.layers.baselayers.forEach(function(_layer, name){
                            var layerData = LeafletServices.loadData(_layer);
                            tileLayers[layerData.name] = layerData.map;
                            // Ajout des couches sur la carte
                            if(curlayer){
                                if(layerData.name == curlayer){
                                    layerData.map.addTo(map);
                                }
                            }
                            else{
                                if(layerData.active){
                                    layerData.map.addTo(map);
                                }
                            }
                        });
                        // Vue par défaut de la carte
                        map.setView(
                            [resource.center.lat, resource.center.lng], 
                            resource.center.zoom);
                        // Ajout d'un panneau de type sidebar pour contenir la légende
                        var sidebar = L.control.sidebar('legende', {
                            closeButton: true,
                            position: 'left', 
                        });
                        map.addControl(sidebar);
                        // Ajout du boutton pour ouvrir et fermer le bloc contenant la légende
                        L.easyButton('fa-bars', function(){
                            sidebar.toggle()}, {
                            position:"topright"}
                        ).addTo(map);
                        // Ouverture automatiqument du panneau 
                        setTimeout(function () {
                            sidebar.show();
                        },500);                
                        // Mise en cache de la vue actuelle 
                        if (!map.restoreView()) {
                            map.setView([45.4957590, 6.3102722], 11);
                        }              
                       
                         
                        // Gestion de la légende                        
                        $scope.layerToggle = function(){
                            layerClickedValue = event.currentTarget.value;

                            // NOUVELLE FONCTIONNALITE (NF1) : si décision mettre check ou oeil sur onglet dans bloc 'Tableau' pour gérer affichage couche dans carte
                            // Attention : Cette fonctionnalité est développée en partie
                            // var idCheckTab = layerClickedValue+"_tab";
                            if (storeFlag.getFlagLayer(layerClickedValue) === "noLoaded"){
                                loadDataSymf.getThemaData(layerClickedValue);
                                storeFlag.setFlagLayer(layerClickedValue, "cacheChecked");
                            }
                            else if (storeFlag.getFlagLayer(layerClickedValue) === "cacheChecked"){
                                map.removeLayer(tabThemaData[layerClickedValue]);
                                storeFlag.setFlagLayer(layerClickedValue, "cacheUnchecked");
                                // NF1
                                // document.getElementById(idCheckTab).checked = false;
                            }
                            else if (storeFlag.getFlagLayer(layerClickedValue) === "cacheUnchecked"){
                                map.addLayer(tabThemaData[layerClickedValue]);
                                storeFlag.setFlagLayer(layerClickedValue, "cacheChecked");
                            }                            
                        };

                        // Légende Leaflet
                        layerControl = L.control.layers(tileLayers, null, { collapsed: false});
                        // Récupération du fond de référence choisi quand on change de page
                        map.on('baselayerchange', function(ev){
                            $rootScope.$apply(function(){
                                configServ.put('map:currentLayer', ev.name);
                            })
                        });
                        // Ajout de la légende Leaflet sur la carte
                        layerControl.addTo(map);  
                        // Suppression du conteneur de la légande Leaflet par défaut
                        layerControl._container.remove(); 
                        // Mise en place des couches dans la légende personnalisée : voir template-url ==> map.htm
                        document.getElementById('baselayers').appendChild(layerControl.onAdd(map));
                                
                        //Ajout d'une l'échelle 
                        L.control.scale().addTo(map);                     
                        
                        $timeout(function(){
                            $rootScope.$broadcast('map:ready');
                        }, 0);

                        dfd.resolve();
                    });

                }
                catch(e){
                                    
                    geoms.splice(0);
                    dfd.resolve();
                }

                // Récupération des couches visibles après filtre depuis tableau de données
                var getVisibleItems = function(){
                    var bounds = map.getBounds();
                    var visibleItems = [];
                    geoms.forEach(function(item){
                        try{
                            var _coords = item.getLatLng();
                        }
                        catch(e){
                            var _coords = item.getLatLngs();
                        }
                        try{
                            if(bounds.intersects(_coords)){
                                visibleItems.push(item.feature.properties.id);
                            }
                        }
                        catch(e){
                            if(bounds.contains(_coords)){
                                visibleItems.push(item.feature.properties.id);
                            }
                        }
                    });
                
                    return visibleItems;
                };
                mapService.getVisibleItems = getVisibleItems;

                // Mise en service (mapService ) des contrôles de la carte
                var getLayerControl = function(){
                    return layerControl;
                };
                mapService.getLayerControl = getLayerControl;

                // Mise en service (mapService ) des couches métiers 
                var getLayer = function(couches){
                    return tabThemaData[couches];
                };
                mapService.getLayer = getLayer;
              
                // Mise en service (mapService ) de la carte
                var getMap = function(){
                    return map;
                }
                mapService.getMap = getMap;

                // Mise en service (mapService ) du tableau de couches Leaflet GeoJSON           
                var getGeoms = function(){
                    return geoms;
                }
                mapService.getGeoms = getGeoms;

                // Filtres des données depuis tableau
                // Affiche ou masque les couches 
                // var filterData = function(ids){
                //     angular.forEach(geoms, function(geom){
                //         if(ids.indexOf(geom.feature.properties.id) < 0){
                //             geom.feature.$shown = false;
                //             for(key in tabThemaData){
                //                 if(tabThemaData[key].hasLayer(geom)){
                //                     tabThemaData[key].removeLayer(geom);
                //                     geom.feature.coucheLeaflet = key;
                //                 }
                //             }
                //         }
                //         else{
                //             if(geom.feature.$shown === false){
                //                 geom.feature.$shown = true;
                //                 if(geom.feature.coucheLeaflet){
                //                     tabThemaData[geom.coucheLeaflet].addLayer(geom);
                //                 }
                //             }
                //         }
                //     });
                // };
                // mapService.filterData = filterData;

                // Recentrage des objets (emprise et zoom) quand on clique sur un objet sur la carte
                var getItem = function(_id, pThemaData){
                    var res = geoms.filter(function(item){
                        if (item.feature.properties.cat == pThemaData){
                            return item.feature.properties.id == _id;
                        }    
                    });             
                    if(res){
                        try{
                            /*
                             * centre la carte sur le point sélectionné
                             */
                            map.setView(res[0].getLatLng(), Math.max(map.getZoom(), 13));
                            return res[0];
                        }
                        catch(e){
                            /*
                             * centre la carte sur la figure sélectionnée
                             */
                            map.fitBounds(res[0].getBounds());
                            return res[0];
                        }
                    }
                    return null;
                };               
                mapService.getItem = getItem;
 
                // Changement de couleur lorsqu'un élément est sélectionné sur la carte et la liste
                // Fonction à développer ****
                var changeColorItem = function(item, _status){
                    var iconUrl = 'js/lib/leaflet/images/marker-icon.png';
                    var polygonColor = '#03F'; 
                    var zOffset = 0;
                    if(_status){
                        iconUrl = 'js/lib/leaflet/images/marker-rouge.png';
                        polygonColor = '#F00'; 
                        zOffset = 1000;
                    }
                    try{
                        item.setIcon(L.icon({
                            iconUrl: iconUrl, 
                            shadowUrl: 'js/lib/leaflet/images/marker-shadow.png',
                            iconSize: [25, 41], 
                            iconAnchor: [13, 41],
                            popupAnchor: [0, -41],
                        }));
                        item.setZIndexOffset(zOffset);
                    }
                    catch(e){
                        item.setStyle({
                            color: polygonColor,
                        });
                    }
                };
                mapService.changeColorItem = changeColorItem;

                // Applique le changement de couleur (changeColorItem) et le recentrage (getItem)
                var selectItem = function(_id, pThemaData){
                    var sel = getItem(_id, pThemaData);
                                        
                    if(currentSel){
                        changeColorItem(currentSel, false);
                    }
                    
                    changeColorItem(sel, true);
                    currentSel = sel;
                    return sel;

                };
                mapService.selectItem = selectItem;
            
                // Création des couches Leaflet GeoJSON
                addGeom = function(jsonData, layer){
                    var geom = L.GeoJSON.geometryToLayer(jsonData);
                    geom.feature = jsonData;
                    // Zoom et affiche le label la géométrie cliquée
                    geom.on('click', function(e){
                        $rootScope.$apply(
                            $rootScope.$broadcast('mapService:itemClick', geom)    
                        );
                    });
                    if(jsonData.properties.geomLabel){
                        geom.bindPopup(jsonData.properties.geomLabel);
                    }
                    try{
                        geom.setZIndexOffset(0);
                    }
                    catch(e){}
                    /*
                     * Distribution des couleurs aux différentes couches 
                     */ 
                    // Mortalités: Couleur des especes en fonction de la cause mortalité
                    if(jsonData.properties.cause_mortalite === 'électrocution'){
						geom.setIcon(iconElec);
                    }
                    else if(jsonData.properties.cause_mortalite === 'percussion'){
                        geom.setIcon(iconPerc);
                    }
                    // Zones sensibles: Couleur unique                   
                    if(jsonData.properties.cat === 'zonessensibles'){
                        geom.setStyle(zsCouleur)
                        geom.bindLabel(jsonData.properties.nom_zone_sensible, { noHide: true });
                    } 
                    // Tronçons à risque: Couleur en fonction du niveau de risque
                    if(jsonData.properties.cat === 'tronconserdf'){
                        switch (jsonData.properties.risqueTroncon) {
                            case 'Risque élevé':
                                geom.setStyle(angular.extend({color:'#DE0101', weight: 7}, lineStyle))
                            break;
                            case 'Risque secondaire':
                                geom.setStyle(angular.extend({color:'#ECA500', weight: 7}, lineStyle))
                            break;
                            case 'Peu ou pas de risque':
                                geom.setStyle(angular.extend({color:'#2B4EDC', weight: 7}, lineStyle))
                            break;
                        }
                    };
                    // Equiments tronçons
                    if(jsonData.properties.cat === 'eqtronconserdf'){
                        geom.setStyle(eqTroncon);
                    }
                    // Equiments poteaux
                    if(jsonData.properties.cat === 'eqpoteauxerdf'){
                        geom.setIcon(eqPoteau)
                    }
                    // Poteaux à risque: Couleur en fonction du niveau de risque
                    if(jsonData.properties.cat === 'poteauxerdf'){
                        switch (jsonData.properties.risquePoteau) {
                            case 'Risque élevé':
                                geom.setIcon(poRisqueEleve)
                            break;
                            case 'Risque secondaire':
                                geom.setIcon(poRisqueSecondaire)
                            break;
                            case 'Peu ou pas de risque':
                                geom.setIcon(poNonRisque)
                            break;
                        }
                    };
                    // Sites de nidification: Couleur en fonction de l'espece        
                    if(jsonData.properties.cat === 'nidifications'){
                        switch (jsonData.properties.nom_espece) {
                            case 'Gypaète barbu':                              
                                geom.setStyle(angular.extend({color:'#2E60EA'}, polyStyle))                               
                            break;
                            case 'Aigle royal':
                                geom.setStyle(angular.extend({color:'#F2EA19'}, polyStyle))                    
                            break;
                            case 'Grand Duc d\'Europe':
                                geom.setStyle(angular.extend({color:'#ED4AD2'}, polyStyle))
                            break;
                            case 'Faucon pélerin':
                                geom.setStyle(angular.extend({color:'#ED4AD2'}, polyStyle))
                            break;
                        }
                    }
                    // Ajout des couches dans le tableau des couches geoms
                    geoms.push(geom);
                    // Ajout des couches GeoJSON dans les couches métiers
                    tabThemaData[layer].addLayer(geom);
                    return geom;
                };
                mapService.addGeom = addGeom;

                // Fonction qui vérifie et ajoute la couche si elle est cochée depuis la légende
                displayGeomData = function(pLayerThemaData) {
                    var tabFlagLayer = null;
                    tabFlagLayer = storeFlag.getTabFlagLayer();
                    if (pLayerThemaData === "allThemaDataLayer"){
                        for(var key1 in tabFlagLayer){
                            if (tabFlagLayer[key1] === "firstLoad" || tabFlagLayer[key1] === "cacheChecked"){
                                document.getElementById(key1).checked = true;
                                loadDataSymf.getThemaData(key1);
                            }
                            else if (tabFlagLayer[key1] === "cacheUnchecked"){
                                loadDataSymf.getThemaData(key1);
                                document.getElementById(key1).checked = false;
                                map.removeLayer(tabThemaData[key1]);
                                storeFlag.setFlagLayer(key1, "cacheUnchecked");
                            }
                        };
                    }
                    else{
                        for(var key2 in tabFlagLayer){
                          if (key2 !== pLayerThemaData){
                            if (tabFlagLayer[key2] === "cacheChecked"){
                                document.getElementById(key2).checked = true;
                                loadDataSymf.getThemaData(key2);
                            }
                            else if (tabFlagLayer[key2] === "cacheUnchecked"){
                                loadDataSymf.getThemaData(key2);
                                document.getElementById(key2).checked = false;
                                map.removeLayer(tabThemaData[key2]);
                                storeFlag.setFlagLayer(key2, "cacheUnchecked");
                            }
                          }
                        };
                    }
                };
                mapService.displayGeomData = displayGeomData;
                    
                // Permet de créer rapidement une couche depuis un controleur ou une directive ::: Edition de données
                var loadData = function(url, pThemaData){
                    var defd = $q.defer();
                    $loading.start('map-loading');
                    dataServ.get(url, dataLoad(defd, pThemaData));
                    return defd.promise;
                };
                mapService.loadData = loadData;
                
                var dataLoad = function(deferred, pThemaData){
                    return function(resp){
                        resp.forEach(function(item){
                            addGeom(item, pThemaData);
                        });
                        $rootScope.$broadcast('mapService:dataLoaded');
                        $loading.finish('map-loading');
                        deferred.resolve();
                    };
                };

                return dfd.promise;
            };
            // Fin de la fonction initializeCarte
            mapService.initializeCarte = initializeCarte;

            // Chargement des couches sur la carte depuis tableau de données (clique sur onglet)
            var setTabThemaData = function(pTabClickedValue){
                map.addLayer(tabThemaData[pTabClickedValue]);
                document.getElementById(pTabClickedValue).checked = true;
            }
            mapService.setTabThemaData = setTabThemaData;

            // Destruction de la carte 
            $scope.$on('$destroy', function(evt){
                if(map){
                    map.remove();
                    geoms = [];
                }
            });
        }
    };
});

/*
 * * #4 - Directive qui gère les évenements entre la carte et le tableau de données
 */
app.directive('maplist', function($rootScope, $timeout, mapService){
    return {
        restrict: 'A',
        transclude: true,
        template: '<div><ng-transclude></ng-transclude></div>',
        link: function(scope, elem, attrs){
            // Récupération de l'identificateur d'événements de la liste
            var target = attrs['maplist'];

            var cat = target.split("/")[1];

            var filterTpl = '<div class="mapFilter"><label> filtrer avec la carte <input type="checkbox" onchange="filterWithMap(this);"/></label></div>';
            scope.mapAsFilter = false;
            scope.toolBoxOpened = true;
            var visibleItems = [];
            /*
             * Initialisation des listeners d'évenements carte 
             */
            var connect = function(){
                // Click sur la carte
                scope.$on('mapService:itemClick', function(ev, item){
                    mapService.selectItem(item.feature.properties.id, cat);
                    $rootScope.$broadcast(target + ':select', item.feature.properties);
                });

                scope.$on('mapService:pan', function(ev){
                    scope.filter();
                });

                scope.filter = function(){
                    visibleItems = mapService.getVisibleItems();
                    $rootScope.$broadcast(target + ':filterIds', visibleItems, scope.mapAsFilter);
                }

                // Sélection dans la liste
                scope.$on(target + ':ngTable:ItemSelected', function(ev, item){
                    $timeout(function(){
                        try{
                            var geom = mapService.selectItem(item.id, cat);
                            geom.openPopup();
                        }
                        catch(e){}
                    }, 0);
                });

                // Filtrage avec le tableau
                scope.$on(target + ':ngTable:Filtered', function(ev, data){
                    ids = [];
                    data.forEach(function(item){
                        ids.push(item.id);
                    });
                    if(mapService.filterData){
                        mapService.filterData(ids);
                    }
                });

            };

            var _createFilterCtrl = function(){
                var filterCtrl = L.control({position: 'topright'});
                filterCtrl.onAdd = function(map){
                    this._filtCtrl = L.DomUtil.create('div', 'filterBtn');
                    this.update();
                    return this._filtCtrl;
                };
                filterCtrl.update = function(){
                    this._filtCtrl.innerHTML = filterTpl;
                };
                filterCtrl.addTo(mapService.getMap());
            }

            // Fitre avec la carte
            document.filterWithMap = function(elem){
                $rootScope.$apply(function(){
                    scope.mapAsFilter = elem.checked;
                    scope.filter();
                });
            };

            $timeout(function(){
                connect();
            }, 0);

        }
    };
});
