import React from "react";
import Navbar from "../Navbar/Navbar";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Credenciales from "../Sesion/Credenciales";

// importaciones extra-----
import Amplify, { Interactions } from "aws-amplify";
import { ChatBot, AmplifyTheme } from "aws-amplify-react";
import awsconfig from "../aws-export";
Amplify.configure(awsconfig);

export class Ayuda extends React.Component {
  render() {
    return (
      <div style={{ minWidth: "100%" }}>
        
        <Navbar
          props={this.props}
          tituloP={"Inicio"}
          foto={Credenciales.Perfil}
        />
        <FullAyuda props={this.props} />
      </div>
    );
  }
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(2),
    textAlign:"center"
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

export default function FullAyuda({ props }) {
  const classes = useStyles();
  //obtener datos de la session
  const [session, setsession] = React.useState(Credenciales.isAuthenticated());
  
  const handleComplete = (err, confirmation) => {
    if (err) {
      alert("Bot conversation failed");
      return;
    }

    //alert("Success: " + JSON.stringify(confirmation, null, 2));
    return "¿Puedo puedo ayudar en algo mas?";
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

  return (
    <div className={classes.root}>
      <Navbar
        props={props}
        tituloP={"Ayuda"}
        foto={Credenciales.isAuthenticated().foto}
        colorB={colorEstado()}
      />
      <h1>ChatBot de Ayuda COVID-19</h1>
      <ChatBot
        title="My ChatBot"
        botName="Tecnologia"
        welcomeMessage="Hola, Soy un chatbot para ayudarte a entender más sobre el COVID-19"
        onComplete={handleComplete}
        //clearOnComplete={true}
        conversationModeOn={true}
      />
    </div>
  );
}
