const awsconfig = {
  Auth: {
    identityPoolId: "us-east-2:215e0265-920c-40fa-8675-bb896ab72360",
    region: "us-east-2",
  },
  Interactions: {
    bots: {
      pruebaAlex: {
        name: "pruebaAlex",
        alias: "$LATEST",
        region: "us-east-1",
      },
      BookTrip_esLATAM: {
        name: "BookTrip_esLATAM",
        alias: "$LATEST",
        region: "us-east-1",
      },
      OrderFlowers_esLATAM: {
        name: "OrderFlowers_esLATAM",
        alias: "$LATEST",
        region: "us-east-1",
      },
      Tecnologia: {
        name: "Tecnologia",
        alias: "$LATEST",
        region: "us-east-1",
      },
    },
  },
};

export default awsconfig;
