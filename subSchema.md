
### 1- Inventaires poteaux

- detail.yml
```yaml
editAccess: 3
subEditAccess: 2
subSchemaUrl: cables/config/eqpoteauxerdf/list 
subDataUrl: cables/eqpoteauxerdf/ 
```

### 2- Equipements poteaux 
- list.yml
```yaml
title: Equipements poteaux ERDF
emptyMsg: "Aucun équipement"
createBtnLabel: "Nouveau équipement"
createUrl: "#/cables/edit/eqpoteauxerdf/"
editUrl: "#/cables/edit/eqpoteauxerdf/"
detailUrl: "#/cables/eqpoteauxerdf/"
fields: 
    -   name: id 
        label: ID
        filter: 
            id: text
        options: 
            visible: false
    -   name: nom_type_equipement_poteau
        label: Type équipement poteau
        filter: 
            nom_type_equipement_poteau: text
        options:
            visible: true
    -   name: id_nb_equipements
        label: Nombre d'équipements
        filter:
            id_nb_equipements: text
        options:
            visible: true
    -   name: mise_en_place
        label: Mise en place
        filter:
            mise_en_place: text
        options:
            visible: true
    -   name: date_equipement
        label: Date d'équipement
        filter:
            date_equipement: text
        options:
            visible: true
```


