var app = angular.module('FormDirectives');

/**
 * wrapper pour la directive typeahead permettant de l'utiliser en édition
 * requete inverse au serveur pour obtenir un label lié à l'ID fourni et passage
 * label à la directive pour affichage
 * params supplémentaires:
 *  initial -> l'ID fourni
 *  reverseurl -> l'url permettant d'obtenir le label correspondant à l'ID
 */
app.directive('angucompletewrapper', function(dataServ, $http){
    return {
        restrict: 'E',
        scope: {
            inputclass: '@',
            decorated: '@',
            selectedobject: '=',
            ngBlur: '=',
            url: '@',
            initial: '=',
            reverseurl: '@',
            ngrequired: '=',
        },
        transclude: true,
        templateUrl: 'js/templates/form/autoComplete.htm',
        link: function($scope, elem){
            $scope.localselectedobject = '';
            $scope.test = function(){
                if($('#aw')[0].value == ''){
                    $scope.selectedobject = null;
                }
            };

            $scope.find = function(txt){
                if(txt){
                    return $http.get($scope.url + txt).then(function(resp){
                        return resp.data;    
                    });
                }
            };

            $scope.$watch('localselectedobject', function(newval){
                if(newval && newval.id){
                    $scope.selectedobject = newval.id;
                    elem[0].firstChild.children[1].focus();
                }
            });

            $scope.$watch('initial', function(newval){
                if(newval){
                    dataServ.get($scope.reverseurl + '/' + newval, function(resp){
                        $scope.localselectedobject = resp;
                    });
                }
            });
        }
    };
});


/**
 * génération automatique de formulaire à partir d'un json qui représente le schéma du formulaire
 * params:
 *  schema: le squelette du formulaire (cf. doc schémas)
 *  data: le dictionnaire de données source/cible
 *  errors: liste d'erreurs de saisie (dictionnaire {nomChamp: errMessage})
 */
app.directive('dynform', function(){
    return {
        restrict: 'E',
        scope: {
            group: '=',
            data: '=',
            errors: '=',
        },
        templateUrl: 'js/templates/form/dynform.htm',
        controller: function($scope){},
    };
});

app.directive('tableFieldset', function(){
    return {
        restrict: 'E',
        scope: {
            group: '=',
            data: '=',
            errors: '=',
        },
        templateUrl: 'js/templates/form/tableFieldset.htm',
        controller: function($scope){},
    };
});

/**
 * génération d'un champ formulaire de type multivalué
 * params:
 *  refer: la valeur source/cible du champ (une liste)
 *  schema: le schema descripteur du champ (cf. doc schemas)
 */
app.directive('multi', function(userMessages, $timeout){
    return {
        restrict: 'E',
        scope: {
            refer: '=',
            schema: '=',
        },
        templateUrl: 'js/templates/form/multi.htm',
        link: function($scope, elem){
            $scope.addDisabled = true;
            if(!$scope.refer){
                $scope.refer = [];
            }
            $scope.data = $scope.refer;
            $scope.$watch(function(){return $scope.refer;}, function(newval, oldval){
                if(newval){
                    $scope.data = $scope.refer;
                    if(newval.length == 0){
                        $scope.add(null);
                        $scope.addDisabled = true;
                    }
                    else{
                        $scope.addDisabled = false;
                    }
                }
            });
            $scope.add = function(item){
                $scope.data.push(item || null);
                $scope.$watch(
                    function(){
                        return $scope.data[$scope.data.length-1]
                    },
                    function(newval){
                        if(newval){
                            // protection doublons
                            if($scope.data.indexOf(newval)<$scope.data.length-1){
                                userMessages.errorMessage = "Il y a un doublon dans votre saisie !";
                                $scope.data.pop();
                            }
                            $scope.addDisabled = false;
                        }
                        else{
                            $scope.addDisabled = true;
                        }
                    }
                );
                $timeout(function(){
                    // passage du focus à la ligne créée
                    var name = $scope.schema.name+($scope.data.length-1);
                    try{
                        //cas angucomplete
                        document.getElementById(name).children[0].children[1].focus();
                    }
                    catch(e){
                        document.getElementById(name).focus();
                    }
                }, 0);
            };
            $scope.remove = function(idx){
                $scope.data.splice(idx, 1);
            };
            if($scope.refer && $scope.refer.length==0){
                $scope.add(null);
            }
            else{
            //if($scope.data && $scope.data.length>0){
                $scope.addDisabled = false;
            }
        }
    }
});


/* photoupload *** 
 * Directive qui permet d'avoir un champ de formulaire de type input  photo et qui l'envoie au serveur
 * params:
 *  chemin: la valeur du cheminPhoto
 */
app.directive('photoupload', function(){
    return {
        restrict: 'E',
        scope: {
            chemin: '=',
            options: '='
        },
        templateUrl: 'js/templates/form/photoUpload.htm',
        controller: function($scope, $rootScope, dataServ, userMessages, FileUploader){
            
            if($scope.options.id === 'photosPoteauxErdf'){            
                var uploader = $scope.uploader = new FileUploader({
                    url: 'upload_photos_poteaux',
                })
            } 
            if($scope.options.id === 'photosTronconsErdf'){            
                var uploader = $scope.uploader = new FileUploader({
                    url: 'upload_photos_troncons',
                })
            }        
            // CALLBACKS
            uploader.onWhenAddingFileFailed = function() {
                userMessages.infoMessage = "Le chargement de la photo a échoué.";   
            };
            uploader.onErrorItem = function() {
                userMessages.errorMessage ="Une erreur s'est produite pendant l'envoi de la photo. Veuillez réessayer svp!";
            };
            uploader.onCancelItem = function() {
                userMessages.infoMessage = "L'envoi a été annulé.";           
            };
            uploader.onProgressItem = function(fileItem, progress) {
                userMessages.infoMessage = "Chargement en cours..."; 
            };
            uploader.onCompleteItem = function(fileItem, response) {
                $scope.chemin = 'img/photos/' + response.cheminPhoto; // si le chargement est bon, on remplit cheminPhoto avec la réponse
                // console.log(response.cheminPhoto)
                userMessages.successMessage = "Photo chargée avec succès.";               
            };
        }
    }
});

/* photoThumb *** 
* Directive pour créér des miniatures de photos
* Regarde si le fichier chargé est une image pour en créer
* les format d'images acceptés sont |jpg|png|jpeg|bmp|gif| 
*/
app.directive('photoThumb', ['$window', function($window) {
    var helper = {
        support: !!($window.FileReader && $window.CanvasRenderingContext2D),
        isFile: function(item) {
            return angular.isObject(item) && item instanceof $window.File;
        },
        isImage: function(file) {
            var type =  '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
    };
    return {
        restrict: 'A',
        template: '<canvas/>',
        link: function(scope, element, attributes) {
            if (!helper.support) return;

            var params = scope.$eval(attributes.photoThumb);
            if (!helper.isFile(params.file)) return;
            if (!helper.isImage(params.file)) return;

            var canvas = element.find('canvas');
            var reader = new FileReader();

            reader.onload = onLoadFile;
            reader.readAsDataURL(params.file);

            function onLoadFile(event) {
                var img = new Image();
                img.onload = onLoadImage;
                img.src = event.target.result;
            }

            function onLoadImage() {
                var width = params.width || this.width / this.height * params.height;
                var height = params.height || this.height / this.width * params.width;
                canvas.attr({ width: width, height: height });
                canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
            }
        }
    };
}]);



/**
 * Directive qui permet d'avoir un champ de formulaire de type valeur calculée modifiable
 * params: 
 *  data: la source de données du champ (une liste de références aux champs servant au calcul)
 *  refs: une liste du nom des champs à surveiller
 *  model: la source/cible du champ (eq. ng-model)
 *  modifiable: bool -> indique si le champ est modifiable ou en lecture seule
 */
app.directive('calculated', function(){
    return {
        restrict: 'E',
        scope: {
            id: "@",
            ngclass: "@",
            ngBlur: "=",
            min: '=',
            max: '=',
            data: '=',
            refs: '=',
            model: '=',
            modifiable: '=',
        },
        template: '<input id="{{id}}" ng-blur="ngBlur" class="{{ngclass}}" type="number" min="{{min}}" max="{{max}}" ng-model="model" ng-disabled="!modifiable"/>',
        controller: function($scope){
            angular.forEach($scope.refs, function(elem){
                $scope.$watch(function(){
                    return $scope.data[elem];
                }, function(newval, oldval){
                    //$scope.model += newval-oldval;
                    //if($scope.model<0) $scope.model=0;
                    $scope.model = 0;
                    angular.forEach($scope.refs, function(elem){
                        $scope.model += $scope.data[elem];
                    }, $scope);
                });
            }, $scope);
        }
    }
});


/*
 * directive pour l'affichage simple d'un formulaire
 * params: 
 *  saveurl : l'url à laquelle seront envoyées les données
 *  schemaUrl : l'url du schéma descripteur du formulaire
 *  dataurl : url pour récupérer les données en édition
 *  data : conteneur de données (complété par les données obtenues par l'url *
 */
app.directive('simpleform', function(){
    return {
        restrict: 'A',
        scope: {
            saveUrl: '=saveurl',
            schemaUrl: '=schemaurl',
            dataUrl: '=dataurl',
            data: '='
        },
        transclude: true,
        templateUrl: 'js/templates/simpleForm.htm',
        controller: function($scope, $rootScope, configServ, dataServ, userServ, userMessages, $loading, $q, SpreadSheet, $modal, $location, $timeout, FileUploader){
            var dirty = true;
            $scope.errors = {};
            $scope.currentPage = 0;
            $scope.addSubSchema = false;
            // groupe d'accordion 
            $scope.status = {
                uneALaFois: false,
                isOpen: [true]
            };
            configServ.get('debug', function(value){
                $scope.debug = value;   
            });

            /*
             * Spinner
             * */
            $loading.start('spinner-form');
            var dfd = $q.defer();
            var promise = dfd.promise;
            promise.then(function(result) {
                $loading.finish('spinner-form');
            });

            // ouverture de modal pour confirmation 
            $scope.openConfirm = function(txt){
                var modInstance = $modal.open({
                    templateUrl: 'js/templates/modalConfirmation.htm',
                    resolve: {txt: function(){return txt}},
                    controller: function($modalInstance, $scope, txt){
                        $scope.txt = txt;
                        $scope.ok = function(){
                            $modalInstance.close();
                        };
                        $scope.cancel = function(){
                            $modalInstance.dismiss('cancel');
                        }
                    }
                });
                return modInstance.result;
            }
                          
            $scope.setSchema = function(resp){
                $scope.schema = angular.copy(resp);
                
                // mise en place tabulation formulaire
                // groups permet de regrouper des infos dans des goroupes définis dans Symfony dans .yml pour être utilisé dans Anguler
                $scope.schema.groups.forEach(function(group){
                    group.fields.forEach(function(field){
                        if(!field.options){
                            field.options = {};
                        }
                        field.options.readOnly = !userServ.checkLevel(field.options.editLevel || 0);
                        field.options.dismissed = !userServ.checkLevel(field.options.restrictLevel || 0);
                    });
                });
                if($scope.dataUrl){
                    dataServ.get($scope.dataUrl, $scope.setData);
                }
                else{
                    if($scope.schema.subSchemaAdd && userServ.checkLevel($scope.schema.subSchemaAdd)){
                        $scope.addSubSchema = true;
                    }
                    $scope.setData($scope.data || {});
                    dfd.resolve('loading form');
                }
            };

            $scope.setData = function(resp){
                $scope.schema.groups.forEach(function(group){
                    group.fields.forEach(function(field){
                        if(field.type != 'group'){
                            $scope.data[field.name] = angular.copy(resp[field.name]) || field.default || null;
                            if(field.type=='hidden' && field.options && field.options.ref=='userId' && $scope.data[field.name]==null && userServ.checkLevel(field.options.restrictLevel || 0)){
                                $scope.data[field.name] = userServ.getUser().idRole;
                            }
                        }
                        else{
                            field.fields.forEach(function(grField){
                                $scope.data[grField.name] = angular.copy(resp[grField.name]) || grField.default || null;
                            });
                        }

                    });
                });
                $scope.deleteAccess = userServ.checkLevel($scope.schema.deleteAccess);
                if(!$scope.deleteAccess && $scope.schema.deleteAccessOverride){
                    $scope.deleteAccess = userServ.isOwner($scope.data[$scope.schema.deleteAccessOverride]);
                }
                $rootScope.$broadcast('form:init', $scope.data);
                dfd.resolve('loading form');
            };

            // action sur bouton cancel
            $scope.cancel = function(){
                $rootScope.$broadcast('form:cancel', $scope.data);
            };

            // action sur bouton sauver
            $scope.saveConfirmed = function(){
                $loading.start('spinner-send');
                var dfd = $q.defer();
                var promise = dfd.promise;
                promise.then(function(result) {
                    $loading.finish('spinner-form');
                });
                
                if($scope.dataUrl){
                    dataServ.post($scope.saveUrl, $scope.data, $scope.updated(dfd), $scope.error(dfd));
                }
                else{
                    dataServ.put($scope.saveUrl, $scope.data, $scope.created(dfd), $scope.error(dfd));
                }
            };


            $scope.save = function(){
                var errors = null;
                if($scope.schema.subDataRef){
                    if(SpreadSheet.hasErrors[$scope.schema.subDataRef]){
                        errors = SpreadSheet.hasErrors[$scope.schema.subDataRef]();
                    }
                    else{
                        errors = null;
                    }
                    if(errors){
                        $scope.openConfirm(["Il y a des erreurs dans le sous formulaire de saisie rapide.", "Si vous confirmez l'enregistrement, les données du sous formulaire de saisie rapide ne seront pas enregistrées"]).then(function(){
                            scope.saveConfirmed();
                        },
                        function(){
                            userMessages.errorMessage = SpreadSheet.errorMessage[$scope.schema.subDataRef];
                        });
                    }
                    else{
                        $scope.saveConfirmed();
                    }
                }
                else{
                    $scope.saveConfirmed();
                }
            };

            $scope.updated = function(dfd){
                return function(resp){
                    dataServ.forceReload = true;
                    $scope.data.id = resp.id;
                    dirty = false;
                    dfd.resolve('updated');
                    $rootScope.$broadcast('form:update', $scope.data);
                };
            };

            $scope.created = function(dfd){
                return function(resp){
                    dataServ.forceReload = true;
                    $scope.data.id = resp.id;
                    dirty = false;
                    dfd.resolve('created');
                    $rootScope.$broadcast('form:create', $scope.data);
                };
            };

            $scope.error = function(dfd){
                return function(resp){
                    dfd.resolve('errors');
                    userMessages.errorMessage = 'Il y a des erreurs dans votre saisie';
                    $scope.errors = angular.copy(resp);
                }
            };

            $scope.remove = function(){
                $scope.openConfirm(["Êtes vous certain de vouloir supprimer cet élément ?"]).then(function(){
                    $loading.start('spinner-send');
                    var dfd = $q.defer();
                    var promise = dfd.promise;
                    promise.then(function(result) {
                        $loading.finish('spinner-send');
                    });
                    dataServ.delete($scope.saveUrl, $scope.removed(dfd));
                });
            };

            $scope.removed = function(dfd){
                return function(resp){
                    dirty = false;
                    dfd.resolve('removed');
                    $rootScope.$broadcast('form:delete', $scope.data);
                };
            };




            var locationBlock = $scope.$on('$locationChangeStart', function(ev, newUrl){
                if(!dirty){
                    locationBlock();
                    $location.path(newUrl.slice(newUrl.indexOf('#')+1));
                    return;
                }
                ev.preventDefault();
                $scope.openConfirm(["Etes vous certain de vouloir quitter cette page ?", "Les données non enregistrées pourraient être perdues."]).then(
                    function(){
                        locationBlock();
                        $location.path(newUrl.slice(newUrl.indexOf('#')+1));
                    }
                    );
            });

            $timeout(function(){
                configServ.getUrl($scope.schemaUrl, $scope.setSchema);
            },0);
        }
    }
});


/*
 * directive pour la gestion des données spatiales
 * params:
 *  geom -> eq. ng-model
 *  options: options à passer tel que le type de géométrie editer
 *  origin: identifiant du point à éditer
 *  Cette directive est appelé que sur l'édition
 */
app.directive('geometry', function($timeout){
    return {
        restrict: 'A',
        scope: {
            geom: '=',
            options: '=',
            origin: '=',
        },
        templateUrl:  'js/templates/form/geometry.htm',
        controller: function($scope, $rootScope, $timeout, mapService){
            $scope.editLayer = new L.FeatureGroup();
            var current = null;
            var couches = null;

            var setEditLayer = function(layer){
                mapService.getLayer($scope.options.dataUrl.split("/")[1]).removeLayer(layer);
                $scope.updateCoords(layer);
                $scope.editLayer.addLayer(layer);
                current = layer;
            };

            var coordsDisplay = null;


            if(!$scope.options.configUrl){
                $scope.configUrl = 'js/resources/defaultMap.json';
            }
            else{
                $scope.configUrl = $scope.options.configUrl;
            }

            var getEditItem = function(_id){
                var res = mapService.getGeoms().filter(function(item){
                    return item.feature.properties.id == _id;
                });
                if(res.length){
                    $timeout(function(){
                        try{
                            /*
                             * centre la carte sur le point sélectionné
                             */
                            mapService.getMap().setView(res[0].getLatLng(), Math.max(mapService.getMap().getZoom(), 13));
                            }
                            catch(e){
                            /*
                             * centre la carte sur la figure sélectionnée
                             */
                        	mapService.getMap().fitBounds(res[0].getBounds());
                        	}
                    }, 0);
                    return res[0];
                }
                return null;
            };
            var selectEditItem = function(_id){
                var geom = getEditItem(_id);
                var currentSel = null;
                if(currentSel){
                    mapService.changeColorItem(currentSel, false);
                }
                mapService.changeColorItem(geom, true);
                currentSel = geom;
                return geom;
            };

            mapService.initializeCarte($scope.configUrl).then(function(){
                mapService.getLayerControl().addOverlay($scope.editLayer, "Edition");
                mapService.loadData($scope.options.dataUrl, $scope.options.dataUrl.split("/")[1]).then(function(){
                    if($scope.origin){
                        $timeout(function(pThemaData){
                            var layer = selectEditItem($scope.origin);
                            if(layer){
                                setEditLayer(layer);
                            }
                        }, 0);
                    }
                    mapService.getMap().addLayer($scope.editLayer);
                    // mapService.getMap().removeLayer(mapService.getLayer($scope.options.dataUrl.split("/")[1]));
                });

                /* Récupération des couches depuis mapServices pour les fonctionnalités
                 *  d'accrochage en création d'objet geom
                 * Pour l'instant, pas possibilités de factoriser pour rendre le tableau des couches dynamiques
                 */
                 //couches existantes sur la carte
                var tabThemaData = mapService.tabThemaData;
                couches = [
                    tabThemaData['zonessensibles'], 
                    tabThemaData['mortalites'],
                    tabThemaData['tronconserdf'],
                    tabThemaData['poteauxerdf'],
                    tabThemaData['eqtronconserdf'], 
                    tabThemaData['eqpoteauxerdf'],
                    tabThemaData['nidifications'],
                    tabThemaData['observations'],
                    tabThemaData['erdfappareilcoupure'],
                    tabThemaData['ogmcablesremonteesmecaniques'],
                    tabThemaData['rtelignes'],
                ]

                // on passe les couches au controle de l'édition 
                var guideLayers = couches;
                // console.log(couches) // couches OK 
                $scope.controls = new L.Control.Draw({
                    edit: {
                        featureGroup: $scope.editLayer},
                    draw: {
                        moveMarkers: false, // options pour déplacer en entier et facilement polygone et polyline en édition
                        rectangle: false,
                        circle: false,
                        marker: $scope.options.geometryType == 'point',
                        polyline: $scope.options.geometryType == 'linestring',
                        polygon: $scope.options.geometryType == 'polygon',
                    },
                });
                mapService.getMap().addControl($scope.controls);

                /*Options d'accrochage couches en mode édit*/
                $scope.controls.setDrawingOptions({
                    polygon: { guideLayers: guideLayers, snapDistance: 5 },
                    polyline: { guideLayers: guideLayers},
                    marker: { guideLayers: guideLayers, snapVertices: true },
                });
                
                /*
                 * affichage coords curseur en edition 
                 * TODO confirmer le maintien
                 */
                coordsDisplay = L.control({position: 'bottomright'});
                coordsDisplay.onAdd = function(map){
                    this._dsp = L.DomUtil.create('div', 'coords-dsp');
                    return this._dsp;
                };
                coordsDisplay.update = function(evt){
                    this._dsp.innerHTML = '<span>Long. : ' + evt.latlng.lng + '</span><span>Lat. : ' + evt.latlng.lat + '</span>';
                };
                mapService.getMap().on('mousemove', function(e){
                    coordsDisplay.update(e);
                });
                coordsDisplay.addTo(mapService.getMap());
                /*
                 * ---------------------------------------
                 */             
                
                mapService.getMap().on('draw:created', function(e){
                    if(!current){
                        $scope.editLayer.addLayer(e.layer);
                        current = e.layer;
                        guideLayers.push(current);
                        $rootScope.$apply($scope.updateCoords(current));
                    }
                });
                mapService.getMap().on('draw:edited', function(e){
                    $rootScope.$apply($scope.updateCoords(e.layers.getLayers()[0]));
                });

                mapService.getMap().on('draw:deleted', function(e){
                    current = null;
                    $rootScope.$apply($scope.updateCoords(current));
                });
                $timeout(function() {
                    mapService.getMap().invalidateSize();
                }, 0 );
            
            });

            $scope.geom = $scope.geom || [];

            $scope.updateCoords = function(layer){
                $scope.geom.splice(0);
                if(layer){
                    try{
                        layer.getLatLngs().forEach(function(point){
                            $scope.geom.push([point.lng, point.lat]);
                        });
                    }
                    catch(e){
                        point = layer.getLatLng();
                        $scope.geom.push([point.lng, point.lat]);
                    }
                }
            };
        },
    };
});

/*
 * datepicker
 * params:
 *  uid: id du champ
 *  date: valeur initiale format yyyy-MM-dd
 */
app.directive('datepick', function(){
    return{
        restrict:'A',
        scope: {
            uid: '@',
            date: '=',
            ngrequired: '=',
        },
        templateUrl: 'js/templates/form/datepick.htm',
        controller: function($scope){
            $scope.opened = false;
            $scope.toggle = function($event){
                $event.preventDefault();
                $event.stopPropagation();
                $scope.opened = !$scope.opened;
            };

            $scope.$watch('date', function(newval){
                try{
                    newval.setHours(12);
                    $scope.date = ('00'+$scope.date.getDate()).slice(-2) + '/' + ('00' + ($scope.date.getMonth()+1)).slice(-2) + '/' + $scope.date.getFullYear();
                }
                catch(e){
                    if(newval){
                        try{
                            $scope.date = ('00'+$scope.date.getDate()).slice(-2) + '/' + ('00' + ($scope.date.getMonth()+1)).slice(-2) + '/' + $scope.date.getFullYear();
                        }
                        catch(e){
                            $scope.date = $scope.date.replace(/(\d+)-(\d+)-(\d+)/, '$3/$2/$1');
                        }
                    }
                }
            });
        }
    }
});


app.factory('SpreadSheet', function(){
    return {
        errorMessage: {},
        hasErrors: {},
    };
});

/**
 * Directive pour l'affichage d'un tableau de saisie rapide style feuille de calcul
 * params : 
 *  schemaurl -> url du schema descripteur du tableau
 *  data -> reference vers le dictionnaire de données du formulaire parent
 *  dataref -> champ à utiliser pour stocker les données
 *  subtitle -> Titre indicatif du formulaire
 */
app.directive('spreadsheet', function(){
    return {
        restrict: 'A',
        scope: {
            schemaUrl: '=schemaurl',
            dataRef: '=dataref',
            subTitle: '=subtitle',
            dataIn: '=data',
        },
        templateUrl: 'js/templates/form/spreadsheet.htm',
        controller: function($scope, configServ, SpreadSheet){
            var defaultLine = {};
            var lines = [];
            $scope.data = [];
            $scope.$watch(
                function(){
                    return $scope.schemaUrl;
                }, 
                function(newval){
                    if(newval){
                        configServ.getUrl(newval, $scope.setSchema);
                    }
                }
            );
            $scope.setSchema = function(schema){
                $scope.schema = schema;
                $scope.schema.fields.forEach(function(item){
                    defaultLine[item.name] = item.default || null;
                });
                $scope.data = lines;
                $scope.addLines();
            };

            $scope.addLines = function(){
                for(i=0; i<3; i++){
                    line = angular.copy(defaultLine);
                    lines.push(line);
                }
            };

            $scope.check = function(){
                var out = [];
                var err_lines = [];
                var primaries = [];
                var errMsg = "Erreur";
                var hasErrors = false;
                $scope.data.forEach(function(line){
                    var line_valid = true;
                    var line_empty = true;
                    $scope.schema.fields.forEach(function(field){
                        if(line[field.name] && line[field.name] != '__NULL__'){
                            line_empty = false;
                        }
                        if((field.options.required || field.options.primary) && (!line[field.name] || line[field.name] == '__NULL__')){
                            line_valid = false;
                        }
                        if(field.options.primary && line_valid){
                            //gestion des clés primaires pour la suppression des doublons
                            if(primaries.indexOf(line[field.name])>-1){
                                line_valid = false;
                                errMsg = "Doublon";
                                hasErrors = true
                            }
                            else{
                                primaries.push(line[field.name]);
                            }
                        }
                    });
                    if(line_valid){
                        out.push(line);
                    }
                    else{
                        if(!line_empty){
                            err_lines.push($scope.data.indexOf(line) + 1);
                            hasErrors = true;
                        }
                    }
                });


                if(!$scope.dataIn[$scope.dataRef]){
                    $scope.dataIn[$scope.dataRef] = [];
                }
                else{
                    $scope.dataIn[$scope.dataRef].splice(0);
                }
                out.forEach(function(item){
                    $scope.dataIn[$scope.dataRef].push(item);
                });
                if(hasErrors){
                    errMsg = 'Il y a des erreurs ligne(s) : '+err_lines.join(', ');
                    SpreadSheet.errorMessage[$scope.dataRef]= errMsg;
                }
                return hasErrors;
            };
            SpreadSheet.hasErrors[$scope.dataRef] = $scope.check;
        },
    };
});

app.directive('subeditform', function(){
    return{
        restrict: 'A',
        scope: {
            schema: "=",
            saveUrl: "=saveurl",
            refId: "=refid",
        },
        template: '<div spreadsheet schemaurl="schema" dataref="dataRef" data="data" subtitle=""></div><button type="button" class="btn btn-success" ng-click="save()">Enregistrer</button>',
        controller: function($scope, $rootScope, dataServ, configServ, SpreadSheet, userMessages, $loading, $q){
            $scope.data = {refId: $scope.refId};
            $scope.dataRef = '__items__';

            $scope.save = function(){
                errors = SpreadSheet.hasErrors[$scope.dataRef]();
                if(errors){
                    userMessages.errorMessage = SpreadSheet.errorMessage[$scope.dataRef];
                }
                else{
                    /*
                     * Spinner
                     * */
                    $loading.start('spinner-detail');
                    var dfd = $q.defer();
                    var promise = dfd.promise;
                    promise.then(function(result) {
                        $loading.finish('spinner-detail');
                    });
                    dataServ.put($scope.saveUrl, $scope.data, $scope.saved(dfd));
                }
            };

            $scope.saved = function(deferred){
                return function(resp){
                    resp.ids.forEach(function(item, key){
                        $scope.data.__items__[key].id = item;
                    });
                    deferred.resolve();
                    userMessages.successMessage = "Données ajoutées";
                    $rootScope.$broadcast('subEdit:dataAdded', $scope.data.__items__);
                };
            };
        }
    };
})