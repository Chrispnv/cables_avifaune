<?php

namespace PNV\CablesBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;

use Symfony\Component\Yaml\Yaml;

class TEquipementsPoteauxErdfConfigController extends Controller{ 

    // path : GET cables/config/eqpoteauxerdf/form
    public function getFormAction(){
        $norm = $this->get('normalizer');
        // Définition de la liste de sélection #Nbre d'équipement
        $repo = $this->getDoctrine()->getRepository('PNVCablesBundle:Dico\DicoNbEquipements');
        $dico1 = $repo->findAll(array());
        $nbrEq = array();
        foreach($dico1 as $d1){
            $nbrEq[] = $norm->normalize($d1, array());
        }
        // Définition de la liste de sélection #Type d'équipement
        $repo = $this->getDoctrine()->getRepository('PNVCablesBundle:Dico\DicoTypeEquipementPoteau');
        $dico2 = $repo->findAll(array());
        $typEq = array();
        foreach($dico2 as $d2){
            $typEq[] = $norm->normalize($d2, array());
        }
        $file = file_get_contents(__DIR__ . '/../Resources/clientConf/TEquipementsPoteauxErdf/form.yml');
        $out = Yaml::parse($file);

        // Initialisation des listes de sélection dans le formulaire de création #Voir form.yml 
        foreach($out['groups'] as &$group){
            foreach($group['fields'] as &$field){
                if(!isset($field['options'])){
                    $field['options'] = array();
                }
                if($field['name'] == 'id_nb_equipements'){
                    $field['options']['choices'] = $nbrEq;
                }
                if($field['name'] == 'id_type_equipement_poteau'){
                    $field['options']['choices'] = $typEq;
                }
            }
        }

        return new JsonResponse($out);
    }

    // path : GET cables/config/eqpoteauxerdf/list
    public function getListAction(){
        $file = file_get_contents(__DIR__ . '/../Resources/clientConf/TEquipementsPoteauxErdf/list.yml');
        $out = Yaml::parse($file);

        return new JsonResponse($out);
    }

    // path : GET cables/config/eqpoteauxerdf/detail
    public function getDetailAction(){
        
        $file = file_get_contents(__DIR__ . '/../Resources/clientConf/TEquipementsPoteauxErdf/detail.yml');
        $out = Yaml::parse($file);
       
        return new JsonResponse($out);
    }
}