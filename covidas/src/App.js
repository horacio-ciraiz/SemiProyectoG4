import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import { ProtecPage } from "./Sesion/ProtecPage";

import { RegistroyLogin } from "./Ingreso/RegistroyLogin";
import { Inicio } from "./Paginas/Inicio";
import { Albums } from "./Paginas/Albums";
import { Ayuda } from "./Paginas/Ayuda";
import { Fotos } from "./Paginas/Fotos";

import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#17a178",
    },
    secondary: {
      main: "#4481eb",
    },
  },
});

function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <Switch>
          <Route path="/" exact component={RegistroyLogin} />
          <ProtecPage path="/Inicio" exact component={Inicio} />
          <ProtecPage path="/Albums" exact component={Albums} />
          <ProtecPage path="/Fotos" exact component={Fotos} />
          <ProtecPage path="/Ayuda" exact component={Ayuda} />
          <ProtecPage component={Inicio} />
        </Switch>
      </ThemeProvider>
    </Router>
  );
}

export default App;
