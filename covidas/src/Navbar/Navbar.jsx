import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import { Avatar, Drawer, MenuItem } from "@material-ui/core";

import Credenciales from "../Sesion/Credenciales";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

export default function Navbar({ props, tituloP, foto , colorB}) {
  const classes = useStyles();
  const [openDraw, setopenDraw] = useState(false);
  const [anchor, setAnchor] = useState("left");

  const abrirMenu = () => {
    setAnchor("left");
    setopenDraw(true);
  };
  const abrirPerfil = () => {
    setAnchor("right");
    setopenDraw(true);
  };

  const salir = () => {
    Credenciales.logout();
    props.history.push("/");
  };
  const irInicio = () => {
    props.history.push("/Inicio");
  };
  const irAlbumes = () => {
    props.history.push("/Albums");
  };
  const irFotos = () => {
    props.history.push("/Fotos");
  };
  const irChatBot = () => {
    props.history.push("/Ayuda");
  };

  return (
    <div className={classes.root}>
      <AppBar position="fixed" style={{backgroundColor:colorB}}>
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
            onClick={abrirMenu}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            {tituloP}
          </Typography>
          <MenuItem>
            <Button color="inherit" onClick={abrirPerfil}>
              <Avatar alt="Remy Sharp" src={foto} />
            </Button>
          </MenuItem>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Drawer
        anchor={anchor}
        open={openDraw}
        onClose={() => setopenDraw(false)}
      >
        <div
          style={{
            width: "250px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {anchor === "left" ? (
            <div>
              <Button style={{ width: "100%" }} onClick={irInicio}>
                Inicio
              </Button>
              <Button style={{ width: "100%" }} onClick={irAlbumes}>
                Albumes
              </Button>
              <Button style={{ width: "100%" }} onClick={irFotos}>
                Fotos
              </Button>
              <Button style={{ width: "100%" }} onClick={irChatBot}>
                Ayuda
              </Button>
            </div>
          ) : (
            <div>
              <Button style={{ width: "100%" }} onClick={salir}>
                Salir
              </Button>
            </div>
          )}
        </div>
      </Drawer>
    </div>
  );
}
