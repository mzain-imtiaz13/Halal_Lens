const { Router } = require("express");

const router = Router();
const billingRoutes = require("./billing.routes");
const scanRoutes = require("./scan.routes");

const defaultRoutes = [
  {
    path: "/billing",
    route: billingRoutes,
  },
  {
    path: "/scan",
    route: scanRoutes,
  },
];

defaultRoutes.forEach(({ path, route }) => {
  router.use(path, route);
});

module.exports = router;
