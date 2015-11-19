var app = angular.module('cablesGlobalCtrl');


/*
 * configuration des routes
 */
app.config(function($routeProvider){
    $routeProvider
        .when('/cables', {
            controller: 'cablesGlobalMapCtrl',
            templateUrl: 'js/templates/cables/cablesGlobalTab.htm'
        });
});


// #1 controleur pour le chargement par défault carte et données acceuil 
app.controller('cablesGlobalMapCtrl',  function($scope, $http, $filter, $routeParams, LeafletServices, dataServ, mapService, configServ, $loading, userServ, $q, $timeout, loadDataSymf, storeFlag){
   
    
    
    /*
     * Spinner pour le premier chargement y compris les données tableau "Zones sensibles" : onglet par défaut ouvert
     */
    $loading.start('spinner-1');
    var dfd = $q.defer(); 
    var promise = dfd.promise; 
    promise.then(function(result) {
        $loading.finish('spinner-1');
    });
    
    /* 
     * Chargement des données géométriques sur la carte
     */
   
    $scope.$on('$viewContentLoaded', function(event) {
        $timeout(function(){        
            configServ.getUrl('', // le configServ.getUrl a besoin d'une url de config et d'un success, on peut lui passer des ''. 
                function($templateCache) {
                    mapService.initializeCarte('js/resources/defaultMap.json').then(function(){
                        mapService.displayGeomData("allThemaDataLayer");
                        
                    });
                });
            dfd.resolve('loading data');
        },0);
    });
});

// Gestion des onglets dans la bloc tableau de données attributaires
app.controller('TabsManagerCtrl', function ($rootScope, $scope, loadDataSymf, storeFlag, mapService) {
    // alert("dans TabsManagerCtrl");
    // $rootScope.tabs = [
    //     {id:'zonessensibles', title:'Zones sensibles',content:'Dynamic content 1',disabled:false},
    //     {id:'mortalites', title:'Cas de mortalité',content:'Dynamic content 1',disabled:false},
    //     {id:'tronconserdf', title:'Tronçons ERDF',content:'Dynamic content 3',disabled:false},
    //     {id:'poteauxerdf', title:'Poteaux ERDF', content:'Dynamic content 1', disabled:false},
    //     {id:'eqtronconserdf', title:'Equipements tronçons ERDF', content:'Dynamic content 1', disabled:false},
    //     {id:'eqpoteauxerdf', title:'Equipements poteaux ERDF', content:'Dynamic content 2', disabled:false},
    //     {id:'nidifications', title:'Site de nidification', content:'Dynamic content 2', disabled:false},
    //     {id:'observations', title:'Observations', content:'Dynamic content 2', disabled:false}
    // ];

    $scope.notSorted = function(obj){
        if (!obj) {
            return [];
        }
        return Object.keys(obj);
    };

    $scope.displayLayer = function(pTabClickedValue) {

        // NF1 : voir layerToggle dans mapServices.js
        // var idCheckTab = pTabClickedValue+"_tab";

        if (storeFlag.getFlagLayer(pTabClickedValue) == "noLoaded"){
            // alert("dans noloaded");
            loadDataSymf.getThemaData(pTabClickedValue);
            storeFlag.setFlagLayer(pTabClickedValue, "cacheChecked");
            // NF1
            // document.getElementById(idCheckTab).checked = true;
        }
        else if (storeFlag.getFlagLayer(pTabClickedValue) === "cacheUnchecked"){
            // alert("dans noloaded");
            mapService.setTabThemaData(pTabClickedValue);
            storeFlag.setFlagLayer(pTabClickedValue, "cacheChecked");
            // NF1
            // document.getElementById(idCheckTab).checked = true;
        }
    };
});

// #2 contrôleur tableau de données --- zones sensibles --- dans onglet
app.controller('zonesSensiblesTabCtrl',  function($scope, $http, $filter, $routeParams, LeafletServices, dataServ, mapService, configServ, $loading, userServ, $q, $timeout, loadDataSymf){

    $scope.title = 'Zones sensibles';
    $scope.data = [];

    /* Initiation des données pour le tableau 
     * remplissage du scope 
     * param : $scope.data = tmp;
     * voir js/templates/cables/zoneSensible.htm data=data
     */
    $scope.setZS = function(resp){
        var tmp = [];
        $scope.items = resp;
        resp.forEach(function(item){
            tmp.push(item.properties);
        });
        $scope.data = tmp;
        // console.log(JSON.stringify(tmp));
    };
    /* Récupération du Schéma du tableau ==> voir dans js/templates/cables/zoneSensible.htm schema = schema
     * Chargement des données dans le tableau
     * param : dataServ.get('url', callback);
     */
    $timeout(function(){        
        configServ.getUrl('cables/config/zonessensibles/list', 
            function(schema) {
                $scope.schema = schema;
                dataServ.get('cables/zonessensibles', $scope.setZS);
            });
    },0);
});

// #3 contrôleur tableau de données --- cas de mortalités --- dans onglet
app.controller('mortalitesTabCtrl',  function($scope, $http, $filter, $routeParams, LeafletServices, dataServ, mapService, configServ, $loading, userServ, $q, $timeout, loadDataSymf){

    $scope.createAccess = userServ.checkLevel(3);
    $scope.editAccess = userServ.checkLevel(3);
    $scope.title = 'Cas de mortalités';
    $scope.data = [];

    /*
     * Spinner pour le chargment des données tableau mortalités 
     * */
    
    $loading.start('spinner-1');
    var dfd = $q.defer();
    var promise = dfd.promise;
    promise.then(function(result) {
        $loading.finish('spinner-1');
    });

    /* Initiation des données pour le tableau 
     * remplissage du scope 
     * param : $scope.data = tmp;
     * voir js/templates/cables/mortalites.htm data=data
     */
    $scope.setMort = function(resp){
        var tmp = [];
        $scope.items = resp;
        resp.forEach(function(item){
            tmp.push(item.properties);
        });
        $scope.data = tmp;
        dfd.resolve('loading data');
    };
    /* Récupération du Schéma du tableau ==> voir dans js/templates/cables/mortalites.htm schema = schema
     * Chargement des données dans le tableau
     * param : dataServ.get('url', callback);
     */
    $timeout(function(){        
        configServ.getUrl('cables/config/mortalites/list', 
            function(schema) {
                $scope.schema = schema;
                dataServ.get('cables/mortalites', $scope.setMort);
            });
    },0);

});

// #4 contrôleur tableau de données --- Inventaires tronçons ERDF --- dans onglet
app.controller('tronconsErdfTabCtrl',  function($scope, $http, $filter, $routeParams, LeafletServices, dataServ, mapService, configServ, $loading, userServ, $q, $timeout, loadDataSymf){

    $scope.createAccess = userServ.checkLevel(3);
    $scope.editAccess = userServ.checkLevel(3);
    $scope.title = 'Inventaires tronçons ERDF';
    $scope.data = [];

    /*
     * Spinner pour le chargment des données tableau Inventaires tronçons ERDF
     * */
    
    $loading.start('spinner-1');
    var dfd = $q.defer();
    var promise = dfd.promise;
    promise.then(function(result) {
        $loading.finish('spinner-1');
    });

    /* Initiation des données pour le tableau 
     * remplissage du scope 
     * param : $scope.data = tmp;
     * voir js/templates/cables/tronconErdf.htm data = data
     */
    $scope.setTron = function(resp){
        var tmp = [];
        $scope.items = resp;
        resp.forEach(function(item){
            tmp.push(item.properties);
        });
        $scope.data = tmp;
        dfd.resolve('loading data');
    };
    /* Récupération du Schéma du tableau ==> voir dans js/templates/cables/tronconErdf.htm schema = schema
     * Chargement des données dans le tableau
     * param : dataServ.get('url', callback);
     */
    $timeout(function(){        
        configServ.getUrl('cables/config/tronconserdf/list', 
            function(schema) {
                $scope.schema = schema;
                dataServ.get('cables/tronconserdf', $scope.setTron);
            });
    },0);

});

// #5 contrôleur tableau de données --- Inventaires poteaux ERDF ---  dans onglet
app.controller('poteauxErdfTabCtrl',  function($scope, $http, $filter, $routeParams, LeafletServices, dataServ, mapService, configServ, $loading, userServ, $q, $timeout, loadDataSymf){

    $scope.createAccess = userServ.checkLevel(3);
    $scope.editAccess = userServ.checkLevel(3);
    $scope.title = 'Inventaires poteaux ERDF';
    $scope.data = [];

    /*
     * Spinner pour le chargment des données tableau Inventaires poteaux ERDF
     * */
    
    $loading.start('spinner-1');
    var dfd = $q.defer();
    var promise = dfd.promise;
    promise.then(function(result) {
        $loading.finish('spinner-1');
    });

    /* Initiation des données pour le tableau 
     * remplissage du scope 
     * param : $scope.data = tmp;
     * voir js/templates/cables/poteauxErdf.htm data = data
     */
    $scope.setPot = function(resp){
        var tmp = [];
        $scope.items = resp;
        resp.forEach(function(item){
            tmp.push(item.properties);
        });
        $scope.data = tmp;
        dfd.resolve('loading data');
    };
    /* Récupération du Schéma du tableau ==> voir dans js/templates/cables/poteauxErdf.htm schema = schema
     * Chargement des données dans le tableau
     * param : dataServ.get('url', callback);
     */
    $timeout(function(){        
        configServ.getUrl('cables/config/poteauxerdf/list', 
            function(schema) {
                $scope.schema = schema;
                dataServ.get('cables/poteauxerdf', $scope.setPot);
            });
    },0);

});

// #6 contrôleur tableau de données --- Equipements tronçons erdf --- dans onglet
app.controller('eqTronconsErdfTabCtrl',  function($scope, $http, $filter, $routeParams, LeafletServices, dataServ, mapService, configServ, $loading, userServ, $q, $timeout, loadDataSymf){

    $scope.title = 'Equipements tronçons erdf';
    $scope.data = [];

    /*
     * Spinner pour le chargment des données tableau Equipements tronçons erdf
     * */
    
    $loading.start('spinner-1');
    var dfd = $q.defer();
    var promise = dfd.promise;
    promise.then(function(result) {
        $loading.finish('spinner-1');
    });

    /* Initiation des données pour le tableau 
     * remplissage du scope 
     * param : $scope.data = tmp;
     * voir js/templates/cables/eqTronconsErdf.htm data = data
     */
    $scope.setEqTron = function(resp){
        var tmp = [];
        $scope.items = resp;
        resp.forEach(function(item){
            tmp.push(item.properties);
        });
        $scope.data = tmp;
        dfd.resolve('loading data');
    };
    /* Récupération du Schéma du tableau ==> voir dans js/templates/cables/eqTronconsErdf.htm schema = schema
     * Chargement des données dans le tableau
     * param : dataServ.get('url', callback);
     */
    $timeout(function(){        
        configServ.getUrl('cables/config/eqtronconserdf/list', 
            function(schema) {
                $scope.schema = schema;
                dataServ.get('cables/eqtronconserdf', $scope.setEqTron);
            });
    },0);

});

// #7 contrôleur tableau de données --- Sites de nidifications --- dans onglet
app.controller('nidificationsTabCtrl',  function($scope, $http, $filter, $routeParams, LeafletServices, dataServ, mapService, configServ, $loading, userServ, $q, $timeout, loadDataSymf){

    $scope.title = 'Sites de nidification';
    $scope.data = [];

    /*
     * Spinner pour le chargment des données tableau Sites de nidification
     * */
    
    $loading.start('spinner-1');
    var dfd = $q.defer();
    var promise = dfd.promise;
    promise.then(function(result) {
        $loading.finish('spinner-1');
    });

    /* Initiation des données pour le tableau 
     * remplissage du scope 
     * param : $scope.data = tmp;
     * voir js/templates/cables/nidifications.htm data = data
     */
    $scope.setNid = function(resp){
        var tmp = [];
        $scope.items = resp;
        resp.forEach(function(item){
            tmp.push(item.properties);
        });
        $scope.data = tmp;
        dfd.resolve('loading data');
    };
    /* Récupération du Schéma du tableau ==> voir dans js/templates/cables/nidifications.htm schema = schema
     * Chargement des données dans le tableau
     * param : dataServ.get('url', callback);
     */
    $timeout(function(){        
        configServ.getUrl('cables/config/nidifications/list', 
            function(schema) {
                $scope.schema = schema;
                dataServ.get('cables/nidifications', $scope.setNid);
            });
    },0);

});

// #8 contrôleur tableau de données --- Observations --- dans onglet
app.controller('observationsTabCtrl',  function($scope, $http, $filter, $routeParams, LeafletServices, dataServ, mapService, configServ, $loading, userServ, $q, $timeout, loadDataSymf){

    $scope.title = 'Observations';
    $scope.data = [];

    /*
     * Spinner pour le chargment des données tableau Observations
     * */
    
    $loading.start('spinner-1');
    var dfd = $q.defer();
    var promise = dfd.promise;
    promise.then(function(result) {
        $loading.finish('spinner-1');
    });

    /* Initiation des données pour le tableau 
     * remplissage du scope 
     * param : $scope.data = tmp;
     * voir js/templates/cables/observations.htm data = data
     */
    $scope.setObs = function(resp){
        var tmp = [];
        $scope.items = resp;
        resp.forEach(function(item){
            tmp.push(item.properties);
        });
        $scope.data = tmp;
        dfd.resolve('loading data');
    };
    /* Récupération du Schéma du tableau ==> voir dans js/templates/cables/observations.htm schema = schema
     * Chargement des données dans le tableau
     * param : dataServ.get('url', callback);
     */
    $timeout(function(){        
        configServ.getUrl('cables/config/observations/list', 
            function(schema) {
                $scope.schema = schema;
                dataServ.get('cables/observations', $scope.setObs);
            });
    },0);

});

// #9 contrôleur tableau de données --- Equipements poteaux erdf --- dans onglet
app.controller('eqPoteauxErdfTabCtrl',  function($scope, $http, $filter, $routeParams, LeafletServices, dataServ, mapService, configServ, $loading, userServ, $q, $timeout, loadDataSymf){


    $scope.title = 'Equipements poteaux erdf';
    $scope.data = [];

    /*
     * Spinner pour le chargment des données tableau Equipements poteaux erdf
     * */
    
    $loading.start('spinner-1');
    var dfd = $q.defer();
    var promise = dfd.promise;
    promise.then(function(result) {
        $loading.finish('spinner-1');
    });

    /* Initiation des données pour le tableau 
     * remplissage du scope 
     * param : $scope.data = tmp;
     * voir js/templates/cables/eqPoteauxErdf.htm data = data
     */
    $scope.setEqPot = function(resp){
        var tmp = [];
        $scope.items = resp;
        resp.forEach(function(item){
            tmp.push(item.properties);
        });
        $scope.data = tmp;
        dfd.resolve('loading data');
    };
    /* Récupération du Schéma du tableau ==> voir dans js/templates/cables/eqPoteauxErdf.htm schema = schema
     * Chargement des données dans le tableau
     * param : dataServ.get('url', callback);
     */
    $timeout(function(){        
        configServ.getUrl('cables/config/eqpoteauxerdf/list', 
            function(schema) {
                $scope.schema = schema;
                dataServ.get('cables/eqpoteauxerdf', $scope.setEqPot);
            });
    },0);

});

