import React from "react";
import Navbar from "../Navbar/Navbar";
import {
  makeStyles,
  Grid,
  Button,
  TextField,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  FormLabel,
  Select,
  FormHelperText,
} from "@material-ui/core";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import SaveIcon from "@material-ui/icons/Save";
import Swal from "sweetalert2";
import Credenciales from "../Sesion/Credenciales";
import { getAlbums, postImagen, postImagenCovid } from "../endpoints";

export class Fotos extends React.Component {
  render() {
    return (
      <div style={{ minWidth: "100%" }}>
        <FullFotos props={this.props} />
      </div>
    );
  }
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(2),
    textAlign: "center",
  },
  paper: {
    padding: theme.spacing(2),
  },
  photo: {
    maxWidth: 300,
    maxHeight: 300,
    //borderRadius: "50%",
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  input: {
    display: "none",
  },
}));

export default function FullFotos({ props }) {
  const classes = useStyles();
  const [consulta, setconsulta] = React.useState("");
  //obtener datos de la session
  const [session, setsession] = React.useState(Credenciales.isAuthenticated());
  const [fCargada, setFCargada] = React.useState(Credenciales.PerfilDefault); //variable para desbloquear los input
  const [fotocargada, setfotocargada] = React.useState(false);
  const [newdescripcion, setnewdescripcion] = React.useState("");
  const [txtnombre, settxtnombre] = React.useState("");
  const [albumTxt, setalbumTxt] = React.useState("");
  const [txtdestino, settxtdestino] = React.useState("1");
  const [errorTXT, seterrorTXT] = React.useState({
    txtdescripcion: "",
    txtnombre: "",
    txtalbum: "",
  });

  //---------------Cargar albumnes combo box
  React.useEffect(() => {
    var data = { iduser: session.iduser };
    fetch(getAlbums, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((json) => {
        return json;
      })
      .then((json) => {
        console.log(json);
        setconsulta(json);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const misAlbums = () => {
    const listaalbums = [];
    for (let index = 0; index < consulta.length; index++) {
      const element = consulta[index];
      if (element.tipo !== 0 && element.tipo !== 1) {
        listaalbums.push(
          <option key={index} value={element.idalbum}>
            {"album " + element.nombre}
          </option>
        );
      }
    }
    return listaalbums;
  };

  //-------------Seleccionar Album
  const selecAlbum = (event) => {
    const name = event.target.value;
    setalbumTxt(name);
    validarInput(name, "txtalbum");
  };
  //-------------alternat radioSelect
  const handleChange = (event) => {
    settxtdestino(event.target.value);
  };

  //-----------agregar color de barra por estado
  const colorEstado = () => {
    if (session.estado === 1) {
      return "#ffa600";
    } else if (session.estado === 2) {
      return "#c02748";
    } else {
      return "";
    }
  };

  //---------cargar en variables el texto ingresado
  const inputChange = (e) => {
    let { id, value } = e.target;
    if (id === "txtdescripcion") {
      setnewdescripcion(value);
      //validarInput(value, "txtdescripcion");
    } else if (id === "txtnombre") {
      settxtnombre(value);
      validarInput(value, "txtnombre");
    }
  };
  const validarInput = (valor, campo) => {
    errorTXT[campo] = "";
    var result = true;
    if (valor === "") {
      errorTXT[campo] = "Información Requerida";
      result = false;
    }
    //modificar el estado del json
    seterrorTXT({ ...errorTXT });
    return result;
  };

  //--------------volver a los estados iniciales
  const cancelarT = () => {
    setsession(Credenciales.isAuthenticated());
    setFCargada(Credenciales.PerfilDefault);
    setfotocargada(false);
    setnewdescripcion("");
    settxtnombre("");
    setalbumTxt("");
    settxtdestino("1");
    seterrorTXT({
      txtdescripcion: "",
      txtnombre: "",
      txtalbum: "",
    });
  };

  //------------Select Foto
  const CargarFoto = (e) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setFCargada(reader.result);
        setfotocargada(true);
      }
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  //-------------guardar Foto
  const guardarFoto = () => {
    if (fotocargada) {
      if (txtdestino === "2") {
        console.log("identifcar contagio");
        validarInput(txtnombre, "txtnombre");
        //subir una foto para identificar contagios
        if (validarInput(txtnombre, "txtnombre")) {
          var data = {
            descripcion: newdescripcion,
            nombre: txtnombre,
            foto: fCargada,
            iduser: session.iduser,
            user: session.user,
          };
          fetch(postImagenCovid, {
            method: "POST", // or 'PUT'
            body: JSON.stringify(data), // data can be `string` or {object}!
            headers: {
              "Content-Type": "application/json",
            },
          })
            .then((res) => res.json())
            .catch(function (error) {
              alert(error);
            })
            .then((response) => {
              if (response.status === 200) {
                Swal.fire({
                  title: "Exito",
                  text:
                    "La foto ha sido analizada, se le notificara a los usuarios identificados",
                  icon: "success",
                }).then((result) => {
                  console.log(response);
                  //actualizar session
                  session.estado = 2;
                  session.alerta = 1;
                  Credenciales.login(session);
                  //reiniciar campos
                  //cancelarT();
                });
              } else {
                Swal.fire({
                  title: "Error!",
                  text: response.msg,
                  icon: "error",
                });
              }
            });
        } else {
          Swal.fire({
            title: "Error!",
            text: "Completa los campos obligatorios",
            icon: "error",
          });
        }
      } else {
        validarInput(txtnombre, "txtnombre");
        validarInput(albumTxt, "txtalbum");
        //subir una foto normal
        if (
          validarInput(txtnombre, "txtnombre") &&
          validarInput(albumTxt, "txtalbum")
        ) {
          var data = {
            descripcion: newdescripcion,
            nombre: txtnombre,
            foto: fCargada,
            iduser: session.iduser,
            idalbum: albumTxt,
          };
          fetch(postImagen, {
            method: "POST", // or 'PUT'
            body: JSON.stringify(data), // data can be `string` or {object}!
            headers: {
              "Content-Type": "application/json",
            },
          })
            .then((res) => res.json())
            .catch(function (error) {
              alert(error);
            })
            .then((response) => {
              if (response.status === 200) {
                Swal.fire({
                  title: "Exito",
                  text: response.msg,
                  icon: "success",
                }).then((result) => {
                  cancelarT(); //reiniciar campos
                });
              } else {
                Swal.fire({
                  title: "Error!",
                  text: response.msg,
                  icon: "error",
                });
              }
            });
        } else {
          Swal.fire({
            title: "Error!",
            text: "Completa los campos obligatorios",
            icon: "error",
          });
        }
      }
    } else {
      Swal.fire({
        title: "Error!",
        text: "Debes agregar una foto",
        icon: "error",
      });
    }
  };

  return (
    <div className={classes.root}>
      <Navbar
        props={props}
        tituloP={"Fotos"}
        foto={Credenciales.isAuthenticated().foto}
        colorB={colorEstado()}
      />
      <Grid container alignItems="flex-start" spacing={4}>
        <Grid item xs>
          <Grid container direction="column" alignItems="center" spacing={4}>
            <Grid item>
              <img src={fCargada} className={classes.photo} alt="" />
            </Grid>
            <Grid item>
              <input
                accept="image/*"
                className={classes.input}
                id="contained-button-file"
                multiple
                type="file"
                onChange={CargarFoto}
              />
              <label htmlFor="contained-button-file">
                <Button
                  variant="contained"
                  color="primary"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                >
                  Cargar Foto
                </Button>
              </label>
            </Grid>
            <Grid item>
              <FormControl component="fieldset">
                <FormLabel component="legend">Destino</FormLabel>
                <RadioGroup
                  aria-label="gender"
                  name="gender1"
                  value={txtdestino}
                  onChange={handleChange}
                >
                  <FormControlLabel
                    value="1"
                    control={<Radio />}
                    label="Album de imagenes"
                  />
                  <FormControlLabel
                    value="2"
                    control={<Radio />}
                    label="Identificar Contagios"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs>
          <Grid container direction="column" alignItems="baseline" spacing={4}>
            {txtdestino === "2" ? (
              <Grid item>
                <p style={{ textAlign: "justify", width: 310 }}>
                  Al elegir la opción "Identificar Contagios" indicaras que
                  actualmente eres positivo al covid19, se realizará un escaneo
                  de la foto ingresada y se les notificará a los usuarios
                  identificados que pueden estar contagiados.
                </p>
              </Grid>
            ) : (
              <Grid item>
                <FormControl error={errorTXT.txtalbum.length !== 0}>
                  <Select
                    native
                    onChange={selecAlbum}
                    value={albumTxt}
                    style={{ minWidth: 300 }}
                  >
                    <option aria-label="None" value="">
                      Seleccionar Album...
                    </option>
                    {misAlbums()}
                  </Select>
                  <Button
                    color="primary"
                    onClick={() => {
                      Swal.fire({
                        title: "Informacion",
                        text:
                          "para crear nuevos albumnes en dirigete a la pestaña de albumes",
                        icon: "info",
                      });
                    }}
                  >
                    info
                  </Button>
                  <FormHelperText>{errorTXT.txtalbum}</FormHelperText>
                </FormControl>
              </Grid>
            )}
            <Grid item>
              <TextField
                id="txtdescripcion"
                label="Descripcion"
                onChange={inputChange}
                value={newdescripcion}
                multiline
                rows={8}
                variant="outlined"
              />
            </Grid>
            <Grid item>
              <TextField
                className="input-field"
                id="txtnombre"
                label="Nombre de la foto"
                margin="normal"
                variant="outlined"
                value={txtnombre}
                onChange={inputChange}
                required
                error={errorTXT.txtnombre.length !== 0}
                helperText={errorTXT.txtnombre}
              />
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                onClick={guardarFoto}
                color="primary"
                startIcon={<SaveIcon />}
              >
                Guardar Foto
              </Button>
              <Button variant="contained" onClick={cancelarT} color="secondary">
                Cancelar
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}
