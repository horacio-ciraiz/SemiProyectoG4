import React from "react";
import Navbar from "../Navbar/Navbar";
import {
  makeStyles,
  Grid,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  GridList,
  GridListTile,
  GridListTileBar,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  FormControl,
  Select,
  FormHelperText,
} from "@material-ui/core";
import Swal from "sweetalert2";
import Credenciales from "../Sesion/Credenciales";
import {
  getAlbumsFotos,
  getTraduccion,
  postInsertarAlbum,
  postDeleteAlbum,
} from "../endpoints";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import SaveIcon from "@material-ui/icons/Save";

export class Albums extends React.Component {
  render() {
    return (
      <div style={{ minWidth: "100%" }}>
        <FullAlbums props={this.props} />
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
  gridList: {
    width: "70%",
    height: "200px",
  },
  containerList: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },
  itemList: {
    minWidth: 200,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  potho: {
    maxWidth: 200,
    maxHeight: 200,
  },
}));

export default function FullAlbums({ props }) {
  const classes = useStyles();
  //obtener datos de la session
  const [session, setsession] = React.useState(Credenciales.isAuthenticated());
  const [recargar, setrecargar] = React.useState(0);

  const [albumTxt, setalbumTxt] = React.useState("");
  const [txtnombre, settxtnombre] = React.useState("");
  const [errorTXT, seterrorTXT] = React.useState({
    txtnombre: "",
    txtalbum: "",
  });

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

  const [consulta, setconsulta] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [infoIMG, setinfoIMG] = React.useState([]);
  const [idiomatxt, setidiomatxt] = React.useState("");

  //---------------Cargar albumnes al mostrar pagina
  var data = { iduser: session.iduser };
  React.useEffect(() => {
    fetch(getAlbumsFotos, {
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
  }, [recargar]);
  const GenerarFotos = (listFots) => {
    const tileData = [];
    if (listFots !== undefined) {
      for (let index = 0; index < listFots.length; index++) {
        tileData.push({
          img: listFots[index].urlfoto,
          title: listFots[index].nombre,
          author: Credenciales.User,
          descripcion: listFots[index].descripcion,
          cols: 1,
        });
      }
    }
    return tileData;
  };
  const GenerarAlbums = () => {
    const nuevoAlbums = [];
    for (let index = 0; index < consulta.length; index++) {
      const listFots = consulta[index].listF;
      const tileData = GenerarFotos(listFots);
      nuevoAlbums.push(
        <Grid item xs={12} key={index}>
          <h2>Album {consulta[index].nombre}</h2>
          <div className={classes.containerList}>
            <GridList className={classes.gridList} cols={3}>
              {tileData.map((tile) => (
                <GridListTile
                  key={String(tile.img)}
                  className={classes.itemList}
                >
                  <Paper>
                    <img
                      src={tile.img}
                      alt={tile.title}
                      className={classes.potho}
                      onClick={() => {
                        MostarFoto(tile);
                      }}
                    />
                    <GridListTileBar title={tile.title} />
                  </Paper>
                </GridListTile>
              ))}
            </GridList>
          </div>
        </Grid>
      );
    }
    return nuevoAlbums;
  };

  const MostarFoto = (infoFoto) => {
    setinfoIMG(infoFoto);
    setOpen(true);
  };

  //cerrar cuadro emergente de fotos
  const handleClose = () => {
    setOpen(false);
  };

  //seleccionar el item/idioma
  const selecIdioma = (event) => {
    const name = event.target.value;
    setidiomatxt(name);
  };
  //---------------traducir descripcion
  const traducirInfo = () => {
    setOpen(false);
    if (idiomatxt !== "") {
      var data = {
        idioma: idiomatxt,
        texto: infoIMG.descripcion,
      };
      fetch(getTraduccion, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((json2) => {
          return json2;
        })
        .then((json2) => {
          if (json2.status === 200) {
            Swal.fire({
              title: idiomatxt,
              text: json2.texto,
              icon: "success",
            }).then((result) => {
              setOpen(true);
            });
          } else {
            Swal.fire({
              title: idiomatxt,
              text: json2.msg,
              icon: "error",
            }).then((result) => {
              setOpen(true);
            });
          }
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      Swal.fire({
        title: "Error!",
        text: "Debes Seleccionar Un Idioma",
        icon: "error",
      }).then((result) => {
        setOpen(true);
      });
    }
    setidiomatxt("");
  };

  //---------cargar en variables el texto ingresado
  const inputChange = (e) => {
    let { id, value } = e.target;
    if (id === "txtnombre") {
      settxtnombre(value);
      //validarInput(value, "txtnombre");
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

  //---------------cargar combobox
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

  const reiniciarTodo = () => {
    setalbumTxt("");
    settxtnombre("");
    seterrorTXT({
      txtnombre: "",
      txtalbum: "",
    });
    setrecargar(recargar + 1);
  };

  //------------Crear Album
  const crearAlbum = () => {
    if (validarInput(txtnombre, "txtnombre")) {
      var data = {
        nombre: txtnombre,
        iduser: session.iduser,
      };
      fetch(postInsertarAlbum, {
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
              reiniciarTodo();
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
        text: "Debes Ingresar el nombre del Album",
        icon: "error",
      });
    }
  };
  //------------Eliminar Album
  const eliminarAlbum = () => {
    if (validarInput(albumTxt, "txtalbum")) {
      var data = {
        idalbum: albumTxt,
        iduser: session.iduser,
      };
      fetch(postDeleteAlbum, {
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
              reiniciarTodo();
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
        text: "Debes seleccionar un album",
        icon: "error",
      });
    }
  };

  return (
    <div className={classes.root}>
      <Navbar
        props={props}
        tituloP={"Albums"}
        foto={Credenciales.isAuthenticated().foto}
        colorB={colorEstado()}
      />
      <Grid container>
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <h1>Gestionar álbumes</h1>
            </AccordionSummary>
            <AccordionDetails>
              <Grid
                container
                spacing={8}
                direction="row"
                justify="center"
                alignItems="center"
              >
                <Grid item xs>
                  <Grid
                    container
                    direction="row"
                    justify="center"
                    alignItems="center"
                    spacing={2}
                  >
                    <Grid item xs>
                      <TextField
                        style={{ minWidth: 300 }}
                        className="input-field"
                        id="txtnombre"
                        label="Nombre del album"
                        margin="normal"
                        variant="outlined"
                        value={txtnombre}
                        onChange={inputChange}
                        required
                        error={errorTXT.txtnombre.length !== 0}
                        helperText={errorTXT.txtnombre}
                      />
                    </Grid>
                    <Grid item xs>
                      <Button
                        variant="contained"
                        onClick={crearAlbum}
                        color="primary"
                        startIcon={<SaveIcon />}
                      >
                        Crear Album
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs>
                  <Grid
                    xs
                    container
                    direction="row"
                    justify="center"
                    alignItems="center"
                    spacing={2}
                  >
                    <Grid item xs>
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
                        <FormHelperText>{errorTXT.txtalbum}</FormHelperText>
                      </FormControl>
                    </Grid>
                    <Grid item xs>
                      <Button
                        variant="contained"
                        onClick={eliminarAlbum}
                        style={{ backgroundColor: "#c02748", color: "white" }}
                        startIcon={<SaveIcon />}
                      >
                        Eliminar Album
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
        {GenerarAlbums()}
      </Grid>
      <Dialog onClose={handleClose} open={open} scroll={"paper"}>
        <DialogTitle onClose={handleClose} style={{ textAlign: "center" }}>
          {infoIMG.title}
        </DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom align={"center"}>
            <img
              src={infoIMG.img}
              style={{ maxWidth: "100%", maxHeight: 500 }}
              alt={""}
            />
          </Typography>
          <Typography gutterBottom>{infoIMG.descripcion}</Typography>
          <Typography gutterBottom component="div" align={"center"}>
            <Select
              native
              onChange={selecIdioma}
              defaultValue={idiomatxt}
              inputProps={{
                name: "age",
                id: "filled-age-native-simple",
              }}
            >
              <option aria-label="None" value="">
                Seleccionar idioma...
              </option>
              <option value={"Ingles"}>Ingles</option>
              <option value={"Español"}>Español</option>
              <option value={"Ruso"}>Ruso</option>
            </Select>
            <Button variant="contained" color="primary" onClick={traducirInfo}>
              Traducir
            </Button>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            autoFocus
            onClick={handleClose}
            variant="contained"
            color="secondary"
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
