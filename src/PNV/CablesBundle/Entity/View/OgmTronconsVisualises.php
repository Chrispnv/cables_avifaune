<?php

namespace PNV\CablesBundle\Entity\View;

use Doctrine\ORM\Mapping as ORM;

/**
 * OgmTronconsVisualises
 */
class OgmTronconsVisualises
{
    /**
     * @var integer
     */
    private $idtv;

    /**
     * @var array
     */
    private $geomJson;


    /**
     * Get idtv
     *
     * @return integer 
     */
    public function getIdtv()
    {
        return $this->idtv;
    }

    /**
     * Set geomJson
     *
     * @param array $geomJson
     * @return OgmTronconsVisualises
     */
    public function setGeomJson($geomJson)
    {
        $this->geomJson = $geomJson;

        return $this;
    }

    /**
     * Get geomJson
     *
     * @return array 
     */
    public function getGeomJson()
    {
        return $this->geomJson;
    }
}
