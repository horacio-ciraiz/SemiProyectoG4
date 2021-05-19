import React from "react";
import {
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@material-ui/core";
import Webcam from "react-webcam";
import { PhotoCamera } from "@material-ui/icons";
import Swal from "sweetalert2";
import "./style.css";
import imgLogin from "./img/log.svg";
import imgRegistro from "./img/register.svg";
import Credenciales from "../Sesion/Credenciales";
import { postRegistro, postLoginDatos, postLoginFoto } from "../endpoints";

export class RegistroyLogin extends React.Component {
  render() {
    return (
      <div style={{ minWidth: "100%" }}>
        <FullInicio props={this.props} />
      </div>
    );
  }
}

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user",
};

export default function FullInicio({ props }) {
  const [open, setOpen] = React.useState(false);
  const [capturaF, setcapturaF] = React.useState("");
  //variables registro
  const [fperfil, setfperfil] = React.useState(Credenciales.PerfilDefault);
  const [fcargada, setfcargada] = React.useState(false);
  const [txtuserR, settxtuserR] = React.useState("");
  const [txtpassR1, settxtpassR1] = React.useState("");
  const [txtnombreR, settxtnombreR] = React.useState("");
  //variables login
  const [txtuser, settxtuser] = React.useState("");
  const [txtpass, settxtpass] = React.useState("");
  const [errorTXT, seterrorTXT] = React.useState({
    user: "",
    password: "",
    userR: "",
    passR1: "",
    nombreR: "",
  });

  //------------evitar entrar al registro/login al tener session
  React.useEffect(() => {
    if (Credenciales.isAuthenticated()) {
      //console.log("logueado")
      props.history.push("/Inicio");
    } else {
      //console.log("no logueado")
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

  //--------------Metodo para registrar
  const metodoRegistrar = () => {
    //mostrar todos los mensajes, los metodos retornan true/false
    validarInput(txtuserR, "userR");
    validarInput(txtpassR1, "passR1");
    validarInput(txtnombreR, "nombreR");
    if (
      validarInput(txtuserR, "userR") &&
      validarInput(txtpassR1, "passR1") &&
      validarInput(txtnombreR, "nombreR")
    ) {
      if (fcargada) {
        var data = {
          nombre: txtnombreR,
          user: txtuserR,
          password: txtpassR1,
          foto: fperfil,
        };
        fetch(postRegistro, {
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
                title: "Bienvenido",
                text:
                  "Gracias por unirte a la comunidad " + response.user.nombre,
                icon: "success",
              }).then((result) => {
                //crear el json de session
                const session = response.user;
                //guardar sesion en el localStorage
                Credenciales.login(session);
                //iniciar
                props.history.push("/Inicio");
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
          text: "Agrega una foto de perfil",
          icon: "error",
        });
      }
    } else {
      Swal.fire({
        title: "Error!",
        text: "Completa los Campos Obligatorios",
        icon: "error",
      });
    }
  };
  //--------------Metodo para el login
  const metodoIngresar = () => {
    //mostrar todos los mensajes
    validarInput(txtuser, "user");
    validarInput(txtpass, "password");
    if (validarInput(txtuser, "user") && validarInput(txtpass, "password")) {
      var data = {
        user: txtuser,
        password: txtpass,
      };
      fetch(postLoginDatos, {
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
              title: "Bienvenido",
              text: response.user.nombre,
              icon: "success",
            }).then((result) => {
              //crear el json de session
              const session = response.user;
              console.log(response);
              //guardar sesion en el localStorage
              Credenciales.login(session);
              //iniciar
              props.history.push("/Inicio");
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
        text: "Completa los Campos Obligatorios",
        icon: "error",
      });
    }
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
    } else if (id === "passR1") {
      settxtpassR1(value);
      validarInput(value, "passR1");
    } else if (id === "nombreR") {
      settxtnombreR(value);
      validarInput(value, "nombreR");
    } else if (id === "userR") {
      settxtuserR(value);
      validarInput(value, "userR");
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

  //--------------Funciones que permiten cambiar entre login/registro
  const mostrarRegistro = () => {
    const container = document.querySelector(".container");
    container.classList.add("sign-up-mode");
  };
  const mostrarLogin = () => {
    const container = document.querySelector(".container");
    container.classList.remove("sign-up-mode");
  };

  //-------cerrar cuadro emergente de fotos
  const handleClose = () => {
    setcapturaF("");
    setOpen(false);
  };
  //------mostrar Camara
  const mostrarCarmara = () => {
    setOpen(true);
  };
  const webcamRef = React.useRef(null);

  //--------Tomar Foto e ingresar
  const capture = () => {
    //realizar la captura y mostrarla
    var caputuraCamara = webcamRef.current.getScreenshot();
    setcapturaF(caputuraCamara);
    //realizar la peticion al server
    var data = {
      foto: caputuraCamara,
    };
    fetch(postLoginFoto, {
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
        setOpen(false);
        if (response.status === 200) {
          Swal.fire({
            title: "Bienvenido",
            text: response.user.nombre,
            icon: "success",
          }).then((result) => {
            //crear el json de session
            const session = response.user;
            //guardar sesion en el localStorage
            Credenciales.login(session);
            //iniciar
            props.history.push("/Inicio");
          });
        } else {
          Swal.fire({
            title: "Error!",
            text: response.msg,
            icon: "error",
          }).then((result) => {
            setOpen(true);
          });
        }
      });
  };

  return (
    <div className="container">
      <div className="forms-container">
        <div className="signin-signup">
          <div className="form sign-in-form">
            <h2 className="title">Ingresar</h2>
            <TextField
              className="input-field"
              id="user"
              label="Usuario"
              margin="normal"
              variant="outlined"
              value={txtuser}
              onChange={inputChange}
              required
              error={errorTXT.user.length !== 0}
              helperText={errorTXT.user}
            />
            <TextField
              id="password"
              type="password"
              label="Contraseña"
              className="input-field"
              margin="normal"
              variant="outlined"
              value={txtpass}
              onChange={inputChange}
              required
              error={errorTXT.password.length !== 0}
              helperText={errorTXT.password}
            />
            <button className="btn" onClick={metodoIngresar}>
              Ingresar
            </button>

            <p className="social-text">
              O ingresa utilizando la camara
              <IconButton
                color="primary"
                style={{ color: "#17a178" }}
                onClick={mostrarCarmara}
              >
                <PhotoCamera />
              </IconButton>
            </p>
          </div>
          <div className="form sign-up-form">
            <h2 className="title">Registro</h2>
            <div
              style={{
                width: 300,
                height: 200,
                backgroundImage: "url(" + fperfil + ")",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "contain",
                display: "flex",
                flexFlow: "wrap",
                justifyContent: "center",
                alignContent: "flex-end",
              }}
            >
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="contained-button-file"
                multiple
                type="file"
                onChange={metodoFoto}
              />
              <label htmlFor="contained-button-file">
                <Button
                  variant="contained"
                  color="primary"
                  component="span"
                  startIcon={<PhotoCamera />}
                >
                  Cargar Foto
                </Button>
              </label>

              <div style={{ width: "60%" }}></div>
            </div>
            <TextField
              className="input-field"
              id="userR"
              label="Usuario"
              margin="normal"
              variant="outlined"
              value={txtuserR}
              onChange={inputChange}
              required
              error={errorTXT.userR.length !== 0}
              helperText={errorTXT.userR}
            />
            <TextField
              className="input-field"
              id="nombreR"
              label="Nombre Completo"
              margin="normal"
              variant="outlined"
              value={txtnombreR}
              onChange={inputChange}
              required
              error={errorTXT.nombreR.length !== 0}
              helperText={errorTXT.nombreR}
            />
            <TextField
              className="input-field"
              id="passR1"
              label="Password"
              margin="normal"
              variant="outlined"
              value={txtpassR1}
              onChange={inputChange}
              required
              error={errorTXT.passR1.length !== 0}
              helperText={errorTXT.passR1}
            />
            <button className="btn" onClick={metodoRegistrar}>
              Guardar
            </button>
          </div>
        </div>
      </div>

      <div className="panels-container">
        <div className="panel left-panel">
          <div className="content">
            <h3>¿Aún no posees una cuenta?</h3>
            <p>Registrate ahora mismo para estar informado</p>
            <button
              className="btn transparent"
              id="sign-up-btn"
              onClick={mostrarRegistro}
            >
              Registrarse
            </button>
          </div>
          <img src={imgLogin} className="image" alt="" />
        </div>
        <div className="panel right-panel">
          <div className="content">
            <h3>¿Ya posees una cuenta?</h3>
            <p>Utiliza tus credenciales para ingresar</p>
            <button
              className="btn transparent"
              id="sign-in-btn"
              onClick={mostrarLogin}
            >
              Ingresar
            </button>
          </div>
          <img src={imgRegistro} className="image" alt="" />
        </div>
      </div>
      <Dialog onClose={handleClose} open={open} scroll={"paper"}>
        <DialogTitle onClose={handleClose} style={{ textAlign: "center" }}>
          Tomate una foto para ingresar
        </DialogTitle>
        {capturaF ? (
          <DialogContent dividers align={"center"}>
            <img width={"100%"} height={"100%"} src={capturaF} alt="" />
          </DialogContent>
        ) : (
          <DialogContent dividers align={"center"}>
            <Webcam
              audio={false}
              height={"100%"}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={"100%"}
              videoConstraints={videoConstraints}
            />
            <button className="btn" onClick={capture}>
              Tomar Foto
            </button>
          </DialogContent>
        )}
        <DialogActions>
          <button className="btn" onClick={handleClose}>
            Cancelar
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
