<?php

namespace PNV\CablesBundle\Entity\View;

use Doctrine\ORM\Mapping as ORM;

/**
 * OgmTronconsVisualisesDangereux
 */
class OgmTronconsVisualisesDangereux
{
    /**
     * @var integer
     */
    private $idtvd;

    /**
     * @var array
     */
    private $geomJson;


    /**
     * Get idtvd
     *
     * @return integer 
     */
    public function getIdtvd()
    {
        return $this->idtvd;
    }

    /**
     * Set geomJson
     *
     * @param array $geomJson
     * @return OgmTronconsVisualisesDangereux
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
