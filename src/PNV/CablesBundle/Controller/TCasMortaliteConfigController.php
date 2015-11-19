<?php

namespace PNV\CablesBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;

use Symfony\Component\Yaml\Yaml;

class TCasMortaliteConfigController extends Controller{ 

   // path : GET cables/config/tronconserdf/form
    public function getFormAction(){
        $norm = $this->get('normalizer');

        // Définition de la liste de sélection #Nom Espece
        $repo = $this->getDoctrine()->getRepository('PNVCablesBundle:Dico\TEspeces');
        $dico1 = $repo->findAll(array());
        $especes = array();
        foreach($dico1 as $d1){
            $especes[] = $norm->normalize($d1, array());
        }
        // Définition de la liste de sélection #Cause Mortalité
        $repo = $this->getDoctrine()->getRepository('PNVCablesBundle:Dico\DicoCauseMortalite');
        $dico2 = $repo->findAll(array());
        $causeMort = array();
        foreach($dico2 as $d2){
            $causeMort[] = $norm->normalize($d2, array());
        }
        // Définition de la liste de sélection #Sexe
        $repo = $this->getDoctrine()->getRepository('PNVCablesBundle:Dico\DicoSexe');
        $dico3 = $repo->findAll(array());
        $sexe = array();
        foreach($dico3 as $d3){
            $sexe[] = $norm->normalize($d3, array());
        }
        // Définition de la liste de sélection #Age
        $repo = $this->getDoctrine()->getRepository('PNVCablesBundle:Dico\DicoAge');
        $dico4 = $repo->findAll(array());
        $age = array();
        foreach($dico4 as $d4){
            $age[] = $norm->normalize($d4, array());
        }
        // Définition de la liste de sélection #Source
        $repo = $this->getDoctrine()->getRepository('PNVCablesBundle:Dico\DicoSource');
        $dico5 = $repo->findAll(array());
        $source = array();
        foreach($dico5 as $d5){
            $source[] = $norm->normalize($d5, array());
        }
                    
        $file = file_get_contents(__DIR__ . '/../Resources/clientConf/TCasMortalite/form.yml');
        $out = Yaml::parse($file);

        // Initialisation des listes de sélection dans le formulaire de création #Voir form.yml 
        foreach($out['groups'] as &$group){
            foreach($group['fields'] as &$field){
                if(!isset($field['options'])){
                    $field['options'] = array();
                }
                if($field['name'] == 'id_espece'){
                    $field['options']['choices'] = $especes;
                }
                if($field['name'] == 'id_cause_mortalite'){
                    $field['options']['choices'] = $causeMort;
                }
                if($field['name'] == 'sexe'){
                    $field['options']['choices'] = $sexe;
                }
                if($field['name'] == 'age'){
                    $field['options']['choices'] = $age;
                }
                if($field['name'] == 'source'){
                    $field['options']['choices'] = $source;
                }
            }
        }

        return new JsonResponse($out);
    }
    // path : GET cables/config/mortalites/list
    public function getListAction(){
        $file = file_get_contents(__DIR__ . '/../Resources/clientConf/TCasMortalite/list.yml');
        $out = Yaml::parse($file);

        return new JsonResponse($out);
    }

    // path : GET cables/config/mortalites/detail
    public function getDetailAction(){
        
        $file = file_get_contents(__DIR__ . '/../Resources/clientConf/TCasMortalite/detail.yml');
        $out = Yaml::parse($file);
       
        return new JsonResponse($out);
    }
}