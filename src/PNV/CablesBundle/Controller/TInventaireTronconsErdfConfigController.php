<?php

namespace PNV\CablesBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;

use Symfony\Component\Yaml\Yaml;

class TInventaireTronconsErdfConfigController extends Controller{ 

    // path : GET cables/config/invtronconserdf/form
    public function getFormAction(){
        $norm = $this->get('normalizer');
        // Définition de la liste de sélection #Risques 
        $repo = $this->getDoctrine()->getRepository('PNVCablesBundle:Dico\DicoClassesRisque');
        $dico1 = $repo->findAll(array()); 
        $risIntB = array(); #risque_integration_bati
        $dico2 = $repo->findAll(array()); 
        $risDep = array(); #risque_deplacement
        $dico3 = $repo->findAll(array());
        $risIntT = array(); #risque_integration_topo
        $dico4 = $repo->findAll(array());
        $risIntV = array(); #risque_integration_vegetation 
        
        foreach($dico1 as $d1){
            $risIntB[] = $norm->normalize($d1, array('risqueBati'));
        }
        foreach($dico2 as $d2){           
            $risDep[]  = $norm->normalize($d2, array());
        }
        foreach($dico3 as $d3){           
            $risIntT[] = $norm->normalize($d3, array());
        }
        foreach($dico4 as $d4){           
            $risIntV[] = $norm->normalize($d4, array());
        }
        
        //Définition de la liste de sélection #Nom zone sensible 
        $repo = $this->getDoctrine()->getRepository('PNVCablesBundle:View\TZonesSensibles');
        $dico5 = $repo->findAll(array());
        $zs = array();
        foreach($dico5 as $d5){
            $zs[] = $norm->normalize($d5, array());
        } 
        $file = file_get_contents(__DIR__ . '/../Resources/clientConf/TInventaireTronconsErdf/form.yml');
        $out = Yaml::parse($file);

        // Initialisation des listes de sélection dans le formulaire de création #Voir form.yml 
        foreach($out['groups'] as &$group){
            foreach($group['fields'] as &$field){
                if(!isset($field['options'])){
                    $field['options'] = array();
                }
                if($field['name'] == 'id_risque_integration_bati'){
                    $field['options']['choices'] = $risIntB;
                }
                if($field['name'] == 'id_risque_deplacement'){
                    $field['options']['choices'] = $risDep;
                }
                if($field['name'] == 'id_risque_integration_topo'){
                    $field['options']['choices'] = $risIntT;
                }
                if($field['name'] == 'id_risque_integration_vegetation'){
                    $field['options']['choices'] = $risIntV;
                }
                if($field['name'] == 'id_zone_sensible'){
                    $field['options']['choices'] = $zs;
                }
            }
        }

        return new JsonResponse($out);
    }

    // path : GET cables/config/invtronconserdf/list
    public function getListAction(){
        $file = file_get_contents(__DIR__ . '/../Resources/clientConf/TInventaireTronconsErdf/list.yml');
        $out = Yaml::parse($file);

        return new JsonResponse($out);
    }

    // path : GET cables/config/invtronconserdf/detail
    public function getDetailAction(){
        
        $file = file_get_contents(__DIR__ . '/../Resources/clientConf/TInventaireTronconsErdf/detail.yml');
        $out = Yaml::parse($file);
       
        return new JsonResponse($out);
    }
}