<?php

namespace PNV\CablesBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Yaml\Yaml;


class CablesConfigController extends Controller{
    
    // path : GET cables/config/cables/list
    public function getListAction(){
        $file = file_get_contents(__DIR__ . '/../Resources/clientConf/cables/list.yml');
        $out = Yaml::parse($file);

        return new JsonResponse($out);
    }    
}
