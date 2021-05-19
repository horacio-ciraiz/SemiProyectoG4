const mysql2 = require("mysql2/promise");
const express = require("express");
const app = express();
var axios = require("axios");

//funcion que procesa datos antes de que el servidor lo reciba
const morgan = require("morgan");
// puerto en el que escucha
app.set("port", process.env.PORT || 3030);
app.set("json spaces", 2);

//seguridad
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

app.use(morgan("dev"));
//app.use(express.urlencoded({extended: false}));
//app.use(express.json());

//--------------extra
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));

//----------AWS
const aws_keys = require("./credenciales");
const db_credenciales = require("./db_credenciales");
var connProme = mysql2.createPool(db_credenciales);

//instanciamos el sdk
var AWS = require("aws-sdk");
//instacinamos los servicios
const s3 = new AWS.S3(aws_keys.s3);
const rek = new AWS.Rekognition(aws_keys.rekognition);
const translate = new AWS.Translate(aws_keys.translate);

//======================================ALEX============================================
/*
CREATE TABLE usuario (
    iduser int NOT NULL AUTO_INCREMENT,
    nombre varchar(250),    
    user varchar(250),
    password varchar(250),
    foto text,
    alerta int,   0=no mostrar, 1=mostrar
    estado int,   0=sano, 1=posible contagio, 2=positivo
    PRIMARY KEY (iduser)  
);  

CREATE TABLE album ( 
    idalbum int NOT NULL AUTO_INCREMENT,
    nombre varchar(250),
    tipo int,  perfil==0,contagio==1,otro==2
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
*/

//-------------Registro------------
app.post("/api/Registro", async function (req, res) {
  const { nombre } = req.body;
  const { user } = req.body;
  const { password } = req.body;
  const { foto } = req.body;
  try {
    //verificar si existe el usuario
    let query = "Select * from usuario where user=?";
    let [rows, fields] = await connProme.query(query, user);
    if (rows.length == 0) {
      //crear la imagen para subir al s3
      var sub = foto.split(";");
      var extension = "." + sub[0].replace(/^data:image\//, "");
      let urlbucket =
        "https://practica1-g4-imagenes.s3.us-east-2.amazonaws.com/Fotos_Perfil/";
      let NombreImagen = "FotoPerfil" + new Date().getTime() + extension;
      let DireccionPerfil = urlbucket + NombreImagen;

      //-----------------------------registrar en la base de datos
      //usuario
      query =
        "INSERT INTO usuario (nombre, user, password,foto,alerta,estado) VALUES (?,?,MD5(?),?,?,?);";
      [rows, fields] = await connProme.execute(query, [
        nombre,
        user,
        password,
        DireccionPerfil,
        0,
        0,
      ]);

      //obtener el id que le genera la base de datos
      query = "SELECT iduser FROM usuario where user =?;";
      [rows, fields] = await connProme.execute(query, [user]);
      let iduser = rows[0].iduser;

      //crear el album db
      query = "INSERT INTO album (nombre,tipo,iduser) VALUES (?, ?,?);";
      [rows, fields] = await connProme.execute(query, ["perfil", 0, iduser]);

      //obtener el id que le genera la base de datos
      query = "SELECT idalbum FROM album where iduser =? and tipo=?;";
      [rows, fields] = await connProme.execute(query, [iduser, 0]);
      let idalbum = rows[0].idalbum;

      //insertar la imagen db
      query =
        "INSERT INTO fotografia (nombre,urlfoto,descripcion,idalbum) VALUES (?,?,?,?);";
      [rows, fields] = await connProme.execute(query, [
        NombreImagen,
        DireccionPerfil,
        "",
        idalbum,
      ]);

      //-----------------------------------subir al s3
      var imagenperfil = foto;
      var ruta = imagenperfil.replace(/^data:image\/[a-z]+;base64,/, "");
      let buff = new Buffer.from(ruta, "base64");
      const params = {
        Bucket: "practica1-g4-imagenes",
        Key: "Fotos_Perfil/" + NombreImagen,
        Body: buff,
        ContentType: "image",
        ACL: "public-read",
      };
      const putResult = await s3.putObject(params).promise();
      console.log(putResult);

      //-----retornar al cliente
      query = "Select * from usuario where user=?";
      [rows, fields] = await connProme.execute(query, [user]);

      return res.send({
        status: 200,
        msg: "Usuario Registrado con exito",
        user: rows[0],
      });
    } else {
      return res.send({
        status: 400,
        msg: "El usuario ya existe, intenta con otro User Name",
      });
    }
  } catch (error) {
    console.log(error);
    return res.send({
      status: 500,
      msg: "Ocurrio error en el server",
    });
  }
});

//-------------login---------------
app.post("/api/LoginDatos", async function (req, res) {
  const { user } = req.body;
  const { password } = req.body;
  try {
    let query = "Select * from usuario where user=? and password=MD5(?)";
    let [rows, fields] = await connProme.query(query, [user, password]);
    if (rows.length == 1) {
      return res.send({
        status: 200,
        user: rows[0],
      });
    } else {
      return res.send({
        status: 400,
        msg: "Datos no encontrados",
      });
    }
  } catch (error) {
    console.log(error);
    return res.send({
      status: 500,
      msg: "Ocurrio error en el server",
    });
  }
});

//-------------login rekognition---------------
app.post("/api/LoginFoto", async function (req, res) {
  const { foto } = req.body;
  try {
    //obtener todos los clientes
    let query = "Select * from usuario";
    let [rows, fields] = await connProme.query(query);
    if (rows.length != 0) {
      //---------------------------------crear la imagen
      var imagenperfil = foto;
      var ruta = imagenperfil.replace(/^data:image\/[a-z]+;base64,/, "");
      let buff = new Buffer.from(ruta, "base64");

      //----------recorrer los perfiles de db
      for (let i = 0; i < rows.length; i++) {
        const fotodb = rows[i].foto;
        //base64 from url
        let image = await axios.get(fotodb, {
          responseType: "arraybuffer",
        });
        let returnedB64 = Buffer.from(image.data, "base64");

        //----------comparar foto con fotodb
        var params = {
          SourceImage: {
            Bytes: buff,
          },
          TargetImage: {
            Bytes: returnedB64,
          },
          SimilarityThreshold: "80",
        };
        let resultCompa = (await rek.compareFaces(params).promise())
          .FaceMatches;
        if (resultCompa.length > 0) {
          return res.send({
            status: 200,
            msg: "Datos encontrados",
            user: rows[i],
          });
        }
      }
      return res.send({
        status: 400,
        msg: "Datos no encontrados",
      });
    } else {
      return res.send({
        status: 400,
        msg: "Datos no encontrados",
      });
    }
  } catch (error) {
    console.log(error);
    return res.send({
      status: 500,
      msg: "Ocurrio error en el server",
    });
  }
});

//-------------Listar Album + Fotos------------
app.post("/api/ListaAlbumsFotos", async function (req, res) {
  const { iduser } = req.body;
  try {
    let query = "Select * from album where iduser=?";
    let [rows, fields] = await connProme.query(query, [iduser]); //asi se agregan parametros evitando inyeccion sql
    console.log(iduser);
    for (const i in rows) {
      query = "Select * from fotografia where idalbum=?";
      let [rows2, fields2] = await connProme.query(query, [rows[i].idalbum]);
      rows[i].listF = rows2;
    }
    return res.send(rows);
  } catch (error) {
    console.log(error);
    return res.send({
      status: 400,
      msg: "Ocurrio error en el server",
    });
  }
});

//-------------Listar Album + Fotos------------
app.post("/api/ListaAlbums", async function (req, res) {
  const { iduser } = req.body;
  try {
    let query = "Select * from album where iduser=?";
    let [rows, fields] = await connProme.query(query, [iduser]);
    return res.send(rows);
  } catch (error) {
    console.log(error);
    return res.send({
      status: 400,
      msg: "Ocurrio error en el server",
    });
  }
});

//-------------Insertar Album------------
app.post("/api/InsertarAlbum", async function (req, res) {
  const { nombre } = req.body;
  const { iduser } = req.body;
  try {
    //---------------------Verificar si existe
    let query = "Select * from album where nombre=? and iduser=?";
    let [rows, fields] = await connProme.query(query, [
      String(nombre).toLowerCase(),
      iduser,
    ]);
    if (rows.length == 0) {
      //---------------------Crear el album en BD
      let query = "INSERT INTO album (nombre,tipo,iduser) VALUES (?,?,?);";
      let [rows, fields] = await connProme.execute(query, [nombre, 2, iduser]);

      //---------------------respuesta al cliente
      return res.send({
        status: 200,
        msg: "Album Creado",
      });
    } else {
      return res.send({
        status: 500,
        msg: "Ya existe el album:" + nombre,
      });
    }
  } catch (error) {
    console.log(error);
    return res.send({
      status: 500,
      msg: "Ocurrio error en el server",
    });
  }
});

//-------------Insertar Album------------
app.post("/api/EliminarAlbum", async function (req, res) {
  const { idalbum } = req.body;
  const { iduser } = req.body;
  try {
    //---------------------Verificar si existe
    let query = "Delete from album where iduser=? and idalbum=?";
    let [rows, fields] = await connProme.query(query, [iduser, idalbum]);
    //---------------------respuesta al cliente
    return res.send({
      status: 200,
      msg: "Album Eliminado",
    });
  } catch (error) {
    console.log(error);
    return res.send({
      status: 500,
      msg: "Ocurrio error en el server",
    });
  }
});

//-------------Insertar Imagen------------
app.post("/api/InsertarImagen", async function (req, res) {
  const { descripcion } = req.body;
  const { nombre } = req.body;
  const { foto } = req.body;
  const { iduser } = req.body;
  const { idalbum } = req.body;
  try {
    //---------------------------------crear la imagen
    var sub = foto.split(";");
    var extension = "." + sub[0].replace(/^data:image\//, "");
    let urlbucket =
      "https://practica1-g4-imagenes.s3.us-east-2.amazonaws.com/Fotos_Publicadas/";
    let NombreImagen = "Foto" + new Date().getTime() + extension;
    let DireccionPerfil = urlbucket + NombreImagen;
    //-----------------------------------subir al s3
    var imagenperfil = foto;
    var ruta = imagenperfil.replace(/^data:image\/[a-z]+;base64,/, "");
    let buff = new Buffer.from(ruta, "base64");
    const params = {
      Bucket: "practica1-g4-imagenes",
      Key: "Fotos_Publicadas/" + NombreImagen,
      Body: buff,
      ContentType: "image",
      ACL: "public-read",
    };
    const putResult = await s3.putObject(params).promise();
    console.log(putResult);

    //-------------agregar a la base de datos
    let query =
      "INSERT INTO fotografia (nombre,urlfoto,descripcion,idalbum) VALUES (?,?,?,?);";
    let [rows, fields] = await connProme.execute(query, [
      nombre,
      DireccionPerfil,
      descripcion,
      idalbum,
    ]);

    //---------------------respuesta al cliente
    return res.send({
      status: 200,
      msg: "Foto Guardada",
    });
  } catch (error) {
    console.log(error);
    return res.send({
      status: 500,
      msg: "Ocurrio error en el server",
    });
  }
});

//-------------Insertar Imagen------------
app.post("/api/InsertarImagenCovid", async function (req, res) {
  const { descripcion } = req.body;
  const { nombre } = req.body;
  const { foto } = req.body;
  const { iduser } = req.body;
  const { user } = req.body;
  try {
    //---------------------------------crear la imagen
    var sub = foto.split(";");
    var extension = "." + sub[0].replace(/^data:image\//, "");
    let urlbucket =
      "https://practica1-g4-imagenes.s3.us-east-2.amazonaws.com/Fotos_Publicadas/";
    let NombreImagen = "Foto" + new Date().getTime() + extension;
    let DireccionPerfil = urlbucket + NombreImagen;
    //-----------------------------------subir al s3
    var imagenperfil = foto;
    var ruta = imagenperfil.replace(/^data:image\/[a-z]+;base64,/, "");
    let buff = new Buffer.from(ruta, "base64");
    var params = {
      Bucket: "practica1-g4-imagenes",
      Key: "Fotos_Publicadas/" + NombreImagen,
      Body: buff,
      ContentType: "image",
      ACL: "public-read",
    };
    const putResult = await s3.putObject(params).promise();
    console.log(putResult);

    //cambiar usuario a estado covid estado = 2,alerta = 1;
    let query = "UPDATE usuario  set estado=?, alerta=? where iduser=?";
    let [rows, fields] = await connProme.execute(query, [2, 1, iduser]);
    //buscar lista de usuarios en la foto
    var contagiados = [];
    query = "Select * from usuario";
    [rows, fields] = await connProme.query(query);
    if (rows.length != 0) {
      //----------recorrer los perfiles de db
      for (let i = 0; i < rows.length; i++) {
        const fotodb = rows[i].foto;
        //base64 from url
        let image = await axios.get(fotodb, {
          responseType: "arraybuffer",
        });
        let returnedB64 = Buffer.from(image.data, "base64");

        //----------comparar foto con fotodb
        params = {
          SourceImage: {
            Bytes: returnedB64,
          },
          TargetImage: {
            Bytes: buff,
          },
          SimilarityThreshold: "80",
        };
        let resultCompa = (await rek.compareFaces(params).promise())
          .FaceMatches;
        if (resultCompa.length > 0) {
          contagiados.push(rows[i].iduser);
        }
      }
    }
    contagiados.indexOf(iduser) === -1 ? contagiados.push(iduser) : null; //agregar al usuario que la subio
    //crearles el album
    for (let index = 0; index < contagiados.length; index++) {
      //---------------------Verificar si existe
      query = "Select * from album where tipo=? and iduser=?";
      [rows, fields] = await connProme.query(query, [1, contagiados[index]]);
      if (rows.length == 0) {
        //si no existe se crea
        //---------------------Crear el album en BD
        query = "INSERT INTO album (nombre,tipo,iduser) VALUES (?,?,?);";
        await connProme.execute(query, [
          "Registro Contagio",
          1,
          contagiados[index],
        ]);
      }
      //obtener el id que le genera la base de datos
      query = "SELECT idalbum FROM album where iduser =? and tipo=?;";
      [rows, fields] = await connProme.execute(query, [contagiados[index], 1]);
      let idalbum = rows[0].idalbum;
      //subirle la foto
      query =
        "INSERT INTO fotografia (nombre,urlfoto,descripcion,idalbum) VALUES (?,?,?,?);";
      await connProme.execute(query, [
        nombre,
        DireccionPerfil,
        'Foto subida por"' + user + "-" + descripcion,
        idalbum,
      ]);
      //si no tienen covid cambiar a estado = 1,alerta = 1
      query =
        "UPDATE usuario  set estado=?, alerta=? where iduser=? and estado=?";
      await connProme.execute(query, [1, 1, contagiados[index], 0]);
    }

    /*

    //-------------agregar a la base de datos
    let query =
      "INSERT INTO fotografia (nombre,urlfoto,descripcion,idalbum) VALUES (?,?,?,?);";
    let [rows, fields] = await connProme.execute(query, [
      nombre,
      DireccionPerfil,
      descripcion,
      idalbum,
    ]);

    */

    //---------------------respuesta al cliente
    return res.send({
      status: 200,
      contagiados: JSON.stringify(contagiados),
      msg: "Foto Guardada",
    });
  } catch (error) {
    console.log(error);
    return res.send({
      status: 500,
      msg: "Ocurrio error en el server",
    });
  }
});

//-------------Traduccion Foto------------
app.post("/api/Traducir", async function (req, res) {
  const { idioma } = req.body;
  const { texto } = req.body;
  try {
    let lenguaje = "ja";
    if (idioma == "Ingles") {
      lenguaje = "en";
    } else if (idioma == "Español") {
      lenguaje = "es";
    } else if (idioma == "Ruso") {
      lenguaje = "ru";
    }
    let params = {
      SourceLanguageCode: "auto",
      TargetLanguageCode: lenguaje,
      Text: texto || "Hello there",
    };
    let trad = await (await translate.translateText(params).promise())
      .TranslatedText;
    return res.send({
      status: 200,
      texto: trad,
    });
  } catch (error) {
    console.log(error);
    return res.send({
      status: 500,
      msg: "Ocurrio error en el server",
    });
  }
});

//iniciando servidor
app.listen(app.get("port"), () => {
  console.log(`http://localhost:${app.get("port")}`);
});
