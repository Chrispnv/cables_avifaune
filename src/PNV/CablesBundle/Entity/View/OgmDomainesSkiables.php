<?php

namespace PNV\CablesBundle\Entity\View;

use Doctrine\ORM\Mapping as ORM;

/**
 * OgmDomainesSkiables
 */
class OgmDomainesSkiables
{
    /**
     * @var integer
     */
    private $iddomaine;

    /**
     * @var array
     */
    private $geomJson;


    /**
     * Get iddomaine
     *
     * @return integer 
     */
    public function getIddomaine()
    {
        return $this->iddomaine;
    }

    /**
     * Set geomJson
     *
     * @param array $geomJson
     * @return OgmDomainesSkiables
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
