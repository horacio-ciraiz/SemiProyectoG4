CREATE TABLE usuario (
    iduser int NOT NULL AUTO_INCREMENT,
    nombre varchar(250),    
    user varchar(250),
    password varchar(250),
    foto text,
    alerta int,
    estado int,     
    PRIMARY KEY (iduser)  
);  

CREATE TABLE album ( 
    idalbum int NOT NULL AUTO_INCREMENT,
    nombre varchar(250),
    tipo int,
    iduser int,
    PRIMARY KEY (idalbum),
    FOREIGN KEY (iduser) REFERENCES usuario (iduser) ON DELETE CASCADE  
);  


CREATE TABLE fotografia ( 
    idfoto int NOT NULL AUTO_INCREMENT,
    nombre varchar(250),
    urlfoto text,
    descripcion text,
    idalbum int,
    PRIMARY KEY (idfoto),
    FOREIGN KEY (idalbum) REFERENCES album (idalbum) ON DELETE CASCADE  
);

