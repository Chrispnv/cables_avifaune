<?php

namespace PNV\CablesBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;

use Symfony\Component\Yaml\Yaml;

class TInventairePoteauxErdfConfigController extends Controller{ 

    // path : GET cables/config/invpoteauxerdf/form
    public function getFormAction(){
        $norm = $this->get('normalizer');
        // Définition de la liste de sélection #DicoTypePoteauErdf
        $repo = $this->getDoctrine()->getRepository('PNVCablesBundle:Dico\DicoTypePoteauErdf');
        $dico1 = $repo->findAll(array());
        $typPot = array();
        foreach($dico1 as $d1){
            $typPot[] = $norm->normalize($d1, array());
        }
        // Définition de la liste de sélection #DicoTypePoteauErdf secondaire
        $repo = $this->getDoctrine()->getRepository('PNVCablesBundle:Dico\DicoTypePoteauErdf');
        $dico2 = $repo->findBy(array('id'=>99));
        $typPot2 = array();
        foreach($dico2 as $d2){
            $typPot2[] = $norm->normalize($d2, array());
        }
        // Définition de la liste de sélection #Nom zone sensible 
        $repo = $this->getDoctrine()->getRepository('PNVCablesBundle:View\TZonesSensibles');
        $dico3 = $repo->findAll(array());
        $zs = array();
        foreach($dico3 as $d3){
            $zs[] = $norm->normalize($d3, array());
        } 
        // Définition de la liste de sélection #attractivite 
        $repo = $this->getDoctrine()->getRepository('PNVCablesBundle:Dico\DicoClassesRisque');
        $dico4 = $repo->findAll(array());
        $attr = array();
        foreach($dico4 as $d4){
            $attr[] = $norm->normalize($d4, array());
        }
        // Définition de la liste de sélection #dangerosite
        $repo = $this->getDoctrine()->getRepository('PNVCablesBundle:Dico\DicoClassesRisque');
        $dico5 = $repo->findAll(array());
        $dang = array();
        foreach($dico5 as $d5){
            $dang[] = $norm->normalize($d5, array());
        }
        $file = file_get_contents(__DIR__ . '/../Resources/clientConf/TInventairePoteauxErdf/form.yml');
        $out = Yaml::parse($file);

        //Initialisation des listes de sélection dans le formulaire de création #Voir form.yml 
        foreach($out['groups'] as &$group){
            foreach($group['fields'] as &$field){
                if(!isset($field['options'])){
                    $field['options'] = array();
                }
                if($field['name'] == 'id_type_poteau_erdf'){
                    $field['options']['choices'] = $typPot;
                }
                if($field['name'] == 'id_type_poteau_erdf_secondaire'){
                    $field['options']['choices'] = $typPot2;
                }
                if($field['name'] == 'id_zone_sensible'){
                    $field['options']['choices'] = $zs;
                }
                if($field['name'] == 'id_attractivite'){
                    $field['options']['choices'] = $attr;
                }
                if($field['name'] == 'id_dangerosite'){
                    $field['options']['choices'] = $dang;
                }
            }
        }

        return new JsonResponse($out);
    }

    // path : GET cables/config/invpoteauxerdf/list
    public function getListAction(){
        $file = file_get_contents(__DIR__ . '/../Resources/clientConf/TInventairePoteauxErdf/list.yml');
        $out = Yaml::parse($file);

        return new JsonResponse($out);
    }

    // path : GET cables/config/invpoteauxerdf/detail
    public function getDetailAction(){
        
        $file = file_get_contents(__DIR__ . '/../Resources/clientConf/TInventairePoteauxErdf/detail.yml');
        $out = Yaml::parse($file);
       
        return new JsonResponse($out);
    }
}