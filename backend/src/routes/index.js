const { Router } = require("express");

const router = Router();
const billingRoutes = require("./billing.routes");
const scanRoutes = require("./scan.routes");
const userRoutes = require("./user.routes");

const defaultRoutes = [
  {
    path: "/billing",
    route: billingRoutes,
  },
  {
    path: "/scan",
    route: scanRoutes,
  },
  {
    path: "/user",
    route: userRoutes,
  },
];

defaultRoutes.forEach(({ path, route }) => {
  router.use(path, route);
});

module.exports = router;
