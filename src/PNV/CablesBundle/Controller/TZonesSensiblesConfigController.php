<?php

namespace PNV\CablesBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;

use Symfony\Component\Yaml\Yaml;

class TZonesSensiblesConfigController extends Controller{ 

    // path : GET cables/config/zonessensibles/list
    public function getListAction(){
        $file = file_get_contents(__DIR__ . '/../Resources/clientConf/TZonesSensibles/list.yml');
        $out = Yaml::parse($file);

        return new JsonResponse($out);
    }

    // path : GET cables/config/zonessensibles/detail
    public function getDetailAction(){
        
        $file = file_get_contents(__DIR__ . '/../Resources/clientConf/TZonesSensibles/detail.yml');
        $out = Yaml::parse($file);
       
        return new JsonResponse($out);
    }
}