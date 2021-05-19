import React from "react";
import Navbar from "../Navbar/Navbar";
import { makeStyles } from "@material-ui/core/styles";
import Credenciales from "../Sesion/Credenciales";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import SaveIcon from "@material-ui/icons/Save";
import Swal from "sweetalert2";
import { Grid, TextField, Button } from "@material-ui/core";

export class Inicio extends React.Component {
  render() {
    return (
      <div style={{ minWidth: "100%" }}>
        <FullInicio props={this.props} />
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

export default function FullInicio({ props }) {
  const classes = useStyles();
  //obtener datos de la session
  const [session, setsession] = React.useState(Credenciales.isAuthenticated());
  const [fperfil, setfperfil] = React.useState(session.foto);
  const [fcargada, setfcargada] = React.useState(false);
  const [boolEditar, setboolEditar] = React.useState(false);
  const [txtnombre, settxtnombre] = React.useState(session.nombre);
  const [txtpass, settxtpass] = React.useState(session.password);
  const [txtuser, settxtuser] = React.useState(session.user);
  const [errorTXT, seterrorTXT] = React.useState({
    user: "",
    password: "",
    nombre: "",
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
  //mostrar alerta al iniciar
  React.useEffect(() => {
    if (session.alerta === 1) {
      if (session.estado === 1) {
        Swal.fire({
          title: "Advertencia!",
          text:
            "Es posible que estuvieras en contacto con una persona positiva al covid, revisa la sección de albums para averiguarlo, y la seccion de ayuda para ver los pasos a seguir si fuera el caso",
          icon: "warning",
        }).then((result) => {
          session.alerta = 0;
        });
      } else if (session.estado === 2) {
        Swal.fire({
          title: "Advertencia!",
          text:
            "Eres una persona positiva al covid revisa la sección ayuda para ver los pasos a seguir",
          icon: "warning",
        }).then((result) => {
          session.alerta = 0;
        });
      }
    }
  }, []);

  //------------metodo para cargar fotos
  const metodoFoto = (e) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setfperfil(reader.result);
        setfcargada(true);
      }
    };
    reader.readAsDataURL(e.target.files[0]);
  };
  //--------------Tomar valores y validar Campos llenos
  const inputChange = (e) => {
    let { id, value } = e.target;
    if (id === "user") {
      settxtuser(value);
      validarInput(value, "user");
    } else if (id === "password") {
      settxtpass(value);
      validarInput(value, "password");
    } else if (id === "nombre") {
      settxtnombre(value);
      validarInput(value, "nombre");
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
  ///------------Cancelar edicion y restablecer a session
  const cancelarEdit = () => {
    setsession(Credenciales.isAuthenticated());
    setfperfil(session.foto);
    setfcargada(false);
    setboolEditar(false);
    settxtnombre(session.nombre);
    settxtpass(session.password);
    settxtuser(session.user);
    seterrorTXT({
      user: "",
      password: "",
      nombre: "",
    });
  };

  return (
    <div className={classes.root}>
      <Navbar
        props={props}
        tituloP={"Inicio"}
        foto={session.foto}
        colorB={colorEstado()}
      />
      <Grid container>
        <Grid item xs={12} style={{ textAlign: "center" }}>
          <h1>Datos Personales</h1>
        </Grid>
        <Grid item xs>
          <Grid container direction="column" alignContent="center">
            <Grid item xs>
              <img
                alt=""
                src={fperfil}
                style={{
                  minWidth: 300,
                  width: "100%",
                  height: "100%",
                  maxWidth: 400,
                  maxHeight: 500,
                  backgroundSize: "cover",
                  borderRadius: "20%",
                  backgroundRepeat: "no-repeat",
                }}
              />
            </Grid>
            <Grid item xs>
              <input
                accept="image/*"
                type="file"
                onChange={metodoFoto}
                id="btnfoto"
                style={{ display: "none" }}
              />
              <label htmlFor="btnfoto">
                <Button
                  disabled={!boolEditar}
                  variant="contained"
                  color="primary"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                >
                  Nueva Foto
                </Button>
              </label>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs>
          <Grid container direction="column" alignContent="flex-start">
            <Grid item xs>
              <TextField
                style={{ minWidth: 300 }}
                className="input-field"
                id="user"
                label="Usuario"
                margin="normal"
                InputProps={{
                  readOnly: !boolEditar,
                }}
                variant="outlined"
                value={txtuser}
                onChange={inputChange}
                required
                error={errorTXT.user.length !== 0}
                helperText={errorTXT.user}
              />
            </Grid>
            <Grid item xs>
              <TextField
                className="input-field"
                id="nombre"
                label="Nombre Completo"
                margin="normal"
                InputProps={{
                  readOnly: !boolEditar,
                }}
                variant="outlined"
                value={txtnombre}
                onChange={inputChange}
                required
                error={errorTXT.nombre.length !== 0}
                helperText={errorTXT.nombre}
              />
            </Grid>
            <Grid item xs>
              <TextField
                id="password"
                type="password"
                label="Contraseña"
                className="input-field"
                margin="normal"
                InputProps={{
                  readOnly: !boolEditar,
                }}
                variant="outlined"
                value={txtpass}
                onChange={inputChange}
                required
                error={errorTXT.password.length !== 0}
                helperText={errorTXT.password}
              />
            </Grid>
            <Grid item xs>
              <Grid container direction="row" justify="flex-start" spacing={4}>
                <Grid item xs>
                  <Button
                    disabled={!boolEditar}
                    variant="contained"
                    color="primary"
                    onClick={() => {}}
                    startIcon={<SaveIcon />}
                  >
                    Guardar
                  </Button>
                </Grid>
                <Grid item xs>
                  {!boolEditar ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setboolEditar(!boolEditar)}
                    >
                      Editar
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={cancelarEdit}
                    >
                      Cancelar
                    </Button>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}
