# Modifications sur cables_km

## 1- Ajout du breadcrumb 

### a- Dans Symfony: voir  BreadConfigController.php
Mise à jour des requêtes SQL dans le fichier


### b- Dans AngularJS: voir la directive breadcrumbs dans displayDirectives.js 

voir aussi fichier template htm: js/templates/display/breadcrumbs.htm

ajout du breadcrumb dans les pages avec la div 
```javascript 
<div breadcrumbs appname="{{cables}}"></div> 
```

## 2- Label à afficher sur Géom carte et dans détail objet

Pour : 

##### Zones sensibles : nom zone sensible
```javascript
$scope.title =  data.nom_zone_sensible;
```
##### Cas de Mortalité : nom espèce
```javascript
$scope.title =  data.nom_espece;
```
##### Inventaires troncons ERDF : Tronçon + ID
```javascript
$scope.title = 'tronçon ' + data.id;
```
##### Inventaires poteaux ERDF : Poteau + ID
```javascript
$scope.title = 'poteau' + data.id;
```
##### Equipements poteaux ERDF : Type d'équipement poteau
```javascript
$scope.title = data.type_equipement_poteau;
```
##### Equipements tronçons ERDF : Type d'équipement tronçon
```javascript
$scope.title = data.type_equipement_troncon;
```
##### Sites de nidifications : nom espèce
```javascript
$scope.title =  data.nom_espece;
```
##### Observations : nom espèce
```javascript
$scope.title = data.nom_espece;
```
 
## 3- Ajout du tableau Equipement poteaux dans list

a- Dans Symfony:
- ajout des routes dans routing.yml et routing_conf.yml

b- Dans AngularJs
- création du contrôleur eqPoteauxErdfCtrl
- mise à jour de app.js (ajout du module eqPoteauxErdfCtrl)
- mise à jour de cables.html (appel du fichier js du contrôleur)
- création de detail.htm et edit.htm dans js/templates sous eqPoteauxErdf
- ajout dans le tableau accueil 


## 4- Configuration saisie
### Mise à jour des orm et entités dans Symfony 
(Mise à jour dans  CablesBundle/Entity et Ressources/config/doctrine) 
Création de trois types d'entités:
- Dico : tous les dictionnaires (ex: Dico.DicoCauseMortalite.orm )
- Edit: entités utilisées uniquement pendant la saisie  (ex: Edit.TEquipementsPoteauxErdf.orm )
- View: entités utilisées dans l'affichage (liste et détail) des données (ex: View.TInventaireTronconsErdfView.orm )

## Suppression de ExtBundle

Ce bundle était conçu pour gérer toutes les entités des dictionnaires. Il ne sert plus rien à présent. 

- suppression dans app/AppKernel.php 
```javascript
 class AppKernel extends Kernel
{
    public function registerBundles()
    {
        $bundles = array(
            new Symfony\Bundle\FrameworkBundle\FrameworkBundle(),
            new Symfony\Bundle\SecurityBundle\SecurityBundle(),
            new Symfony\Bundle\TwigBundle\TwigBundle(),
            new Symfony\Bundle\MonologBundle\MonologBundle(),
            new Symfony\Bundle\SwiftmailerBundle\SwiftmailerBundle(),
            new Symfony\Bundle\AsseticBundle\AsseticBundle(),
            new Doctrine\Bundle\DoctrineBundle\DoctrineBundle(),
            new Sensio\Bundle\FrameworkExtraBundle\SensioFrameworkExtraBundle(),
            new Commons\UsersBundle\CommonsUsersBundle(),
            new PNV\CablesBundle\PNVCablesBundle(),   
            //new PNV\ExtBundle\PNVExtBundle(),         
        );
       
```


