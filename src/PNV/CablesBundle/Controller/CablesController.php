<?php

namespace PNV\CablesBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

use Commons\Exceptions\DataObjectException;
use Commons\Exceptions\CascadeException;

use Symfony\Component\HttpFoundation\BinaryFileResponse;


class CablesController extends Controller{

    // path: GET /cables/ 
    public function indexAction(){
        /*
         * retourne la liste des aires "cables"
         */
        $ss = $this->get('cablesService');

        return new JsonResponse($ss->getList());
    }
}
